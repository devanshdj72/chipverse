import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendUnauthorized } from '../utils/response';
import prisma from '../config/prisma';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email?: string;
        role: string;
      };
    }
  }
}

/**
 * Require a valid JWT access token
 * Token can come from:
 *   1. Authorization: Bearer <token> header
 *   2. accessToken cookie
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Fallback to cookie
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return sendUnauthorized(res, 'No authentication token provided.');
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    return next();
  } catch {
    return sendUnauthorized(res, 'Invalid or expired token. Please login again.');
  }
};

/**
 * Optional auth — attaches user if token present, continues if not
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // ignore, proceed as guest
    }
  }

  return next();
};

/**
 * Require admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return sendUnauthorized(res);
  if (req.user.role !== 'ADMIN') return sendUnauthorized(res, 'Admin access required.');
  return next();
};
