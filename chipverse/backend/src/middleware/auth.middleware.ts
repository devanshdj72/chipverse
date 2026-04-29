import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { sendUnauthorized } from '../utils/response';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return sendUnauthorized(res, 'No authentication token provided.');
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload as any;
    return next();
  } catch {
    return sendUnauthorized(res, 'Invalid or expired token. Please login again.');
  }
};

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
      req.user = verifyAccessToken(token) as any;
    } catch {
      // ignore, proceed as guest
    }
  }

  return next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return sendUnauthorized(res);
  if ((req.user as any).role !== 'ADMIN') return sendUnauthorized(res, 'Admin access required.');
  return next();
};