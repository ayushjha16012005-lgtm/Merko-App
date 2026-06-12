import type { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '@/errors';
import { errorLogger } from '@/middleware/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  errorLogger.error({
    message: err.message,
    stack: err.stack,
    correlationId: req.correlationId,
    path: req.path,
    method: req.method,
  });

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      error: err.message,
      meta: null,
      errors: err.errors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      error: err.message,
      meta: null,
    });
  }

  const isProduction = process.env.NODE_ENV === 'production';

  return res.status(500).json({
    success: false,
    data: null,
    error: isProduction ? 'Internal server error' : err.message,
    meta: null,
    ...(!isProduction && { stack: err.stack }),
  });
}
