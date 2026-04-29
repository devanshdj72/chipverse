import { Router } from 'express';
import passport from 'passport';
import {
  register,
  login,
  otpSend,
  otpVerify,
  refresh,
  logoutHandler,
  getMe,
  googleCallback,
  linkedinCallback,
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authLimiter, otpLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// ─── Email / Password ─────────────────────────────────────────────────────────
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// ─── OTP / Phone ──────────────────────────────────────────────────────────────
router.post('/otp/send', otpLimiter, otpSend);
router.post('/otp/verify', authLimiter, otpVerify);

// ─── Token Management ─────────────────────────────────────────────────────────
router.post('/refresh', refresh);
router.post('/logout', logoutHandler);

// ─── Current User ─────────────────────────────────────────────────────────────
router.get('/me', requireAuth, getMe);

// ─── Google OAuth ─────────────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=google', session: false }),
  googleCallback
);

// ─── LinkedIn OAuth ───────────────────────────────────────────────────────────
router.get(
  '/linkedin',
  passport.authenticate('linkedin', { session: false })
);
router.get(
  '/linkedin/callback',
  passport.authenticate('linkedin', { failureRedirect: '/login?error=linkedin', session: false }),
  linkedinCallback
);

export default router;
