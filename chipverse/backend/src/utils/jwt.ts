import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JwtPayload {
  userId: string;
  email?: string;
  role: string;
}

export const generateAccessToken = (payload: JwtPayload): string =>
  jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as any,
  });

export const generateRefreshToken = (payload: JwtPayload): string =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });

export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwt.accessSecret) as JwtPayload;
  } catch {
    throw new Error('Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
  } catch {
    throw new Error('Invalid or expired refresh token');
  }
};

/** Milliseconds until expiry from a JWT string */
export const getTokenExpiry = (token: string): number => {
  const decoded = jwt.decode(token) as { exp?: number };
  if (!decoded?.exp) return 0;
  return decoded.exp * 1000 - Date.now();
};
