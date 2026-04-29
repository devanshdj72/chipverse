import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  status = 200
) =>
  res.status(status).json({
    success: true,
    message,
    data,
  });

export const sendError = (
  res: Response,
  message: string,
  status = 400,
  errors?: unknown
) =>
  res.status(status).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });

export const sendUnauthorized = (res: Response, message = 'Unauthorized') =>
  sendError(res, message, 401);

export const sendForbidden = (res: Response, message = 'Forbidden') =>
  sendError(res, message, 403);

export const sendNotFound = (res: Response, message = 'Not found') =>
  sendError(res, message, 404);
