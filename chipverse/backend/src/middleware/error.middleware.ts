import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { validationResult } from 'express-validator';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(`${req.method} ${req.path} — ${err.message}`, { stack: err.stack });

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  // Prisma known errors
  if ((err as any).code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this data already exists.',
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  // Generic
  const status = (err as any).status ?? 500;
  return res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error' : err.message,
  });
};

/** 404 catch-all */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};
