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

  if (err.name === 'PrismaClientKnownRequestError' || (err.constructor && err.constructor.name === 'PrismaClientKnownRequestError')) {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      const target = prismaErr.meta?.target ? ` on ${Array.isArray(prismaErr.meta.target) ? prismaErr.meta.target.join(', ') : prismaErr.meta.target}` : '';
      return res.status(409).json({
        success: false,
        data: null,
        error: `A record with this unique value already exists${target}.`,
        meta: null,
      });
    }
    if (prismaErr.code === 'P2003' || prismaErr.code === 'P2014') {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Database foreign key constraint violation. Associated records exist.',
        meta: null,
      });
    }
    return res.status(400).json({
      success: false,
      data: null,
      error: 'Database operation failed due to constraint validation.',
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
