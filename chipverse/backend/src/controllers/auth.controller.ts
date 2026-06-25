import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  registerWithEmail,
  loginWithEmail,
  loginOrRegisterWithPhone,
  refreshAccessToken,
  logout,
  issueTokensForOAuthUser,
  sanitizeUser,
} from '../services/auth.service';
import { sendOtp, verifyOtp, normalizePhone } from '../services/otp.service';
import { sendSuccess, sendError } from '../utils/response';
import { config } from '../config/env';
import logger from '../utils/logger';
import prisma from '../config/prisma';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

const otpSendSchema = z.object({
  phone: z.string().min(10, 'Invalid phone number'),
});

const otpVerifySchema = z.object({
  phone: z.string().min(10, 'Invalid phone number'),
  code: z.string().length(6, 'OTP must be 6 digits'),
  name: z.string().optional(),
});

// ─── Cookie helper ─────────────────────────────────────────────────────────────
// Use 'none' + secure for cross-domain (Vercel frontend ↔ Vercel backend)
const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProd = config.isProd;

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax', // 'none' required for cross-domain
    maxAge: 15 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax', // 'none' required for cross-domain
    path: '/api/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie('accessToken', { sameSite: 'none', secure: true });
  res.clearCookie('refreshToken', { path: '/api/auth/refresh', sameSite: 'none', secure: true });
};

// ─── Controllers ──────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = registerSchema.parse(req.body);
    const result = await registerWithEmail(body);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    return sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken, // send in body too for localStorage fallback
    }, 'Account created successfully', 201);
  } catch (err) { return next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await loginWithEmail({ email: body.email, password: body.password });
    setAuthCookies(res, result.accessToken, result.refreshToken);
    return sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken, // send in body too for localStorage fallback
    }, 'Login successful');
  } catch (err) { return next(err); }
};

export const otpSend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = otpSendSchema.parse(req.body);
    const normalizedPhone = normalizePhone(phone);
    await sendOtp(normalizedPhone);
    return sendSuccess(res, { phone: normalizedPhone }, 'OTP sent successfully');
  } catch (err) { return next(err); }
};

export const otpVerify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, code, name } = otpVerifySchema.parse(req.body);
    const normalizedPhone = normalizePhone(phone);
    const valid = await verifyOtp(normalizedPhone, code);
    if (!valid) return sendError(res, 'Invalid or expired OTP', 401);
    const result = await loginOrRegisterWithPhone(normalizedPhone, name);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    return sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }, 'Phone verified and logged in');
  } catch (err) { return next(err); }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try cookie first, then body (localStorage fallback)
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (!token) return sendError(res, 'Refresh token not provided', 401);
    const tokens = await refreshAccessToken(token);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return sendSuccess(res, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken, // send back for localStorage update
    }, 'Token refreshed');
  } catch (err) { return next(err); }
};

export const logoutHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
    if (token) await logout(token);
    clearAuthCookies(res);
    return sendSuccess(res, null, 'Logged out successfully');
  } catch (err) { return next(err); }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, sanitizeUser(user), 'User info');
  } catch (err) { return next(err); }
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const tokens = await issueTokensForOAuthUser(user.id, user.email, user.role ?? 'USER');
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return res.redirect(
      `${process.env.GITHUB_PAGES_URL ?? config.frontendUrl}/chipverse-pwa/auth/callback?token=${tokens.accessToken}&provider=google`
    );
  } catch (err) {
    logger.error('Google callback error', err);
    return res.redirect(`${process.env.GITHUB_PAGES_URL ?? config.frontendUrl}/chipverse-pwa/auth/callback?error=google_failed`);
  }
};

export const linkedinCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const tokens = await issueTokensForOAuthUser(user.id, user.email, user.role ?? 'USER');
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return res.redirect(
      `${process.env.GITHUB_PAGES_URL ?? config.frontendUrl}/chipverse-pwa/auth/callback?token=${tokens.accessToken}&provider=linkedin`
    );
  } catch (err) {
    logger.error('LinkedIn callback error', err);
    return res.redirect(`${process.env.GITHUB_PAGES_URL ?? config.frontendUrl}/chipverse-pwa/auth/callback?error=linkedin_failed`);
  }
};