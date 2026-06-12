import type { Request, Response, NextFunction } from 'express';
import type { ZodIssue, ZodSchema } from 'zod';
import { ValidationError } from '@/errors';

function mapZodError(issues: ZodIssue[]) {
  return issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
}

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(new ValidationError(mapZodError(parsed.error.issues)));
    }
    req.body = parsed.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return next(new ValidationError(mapZodError(parsed.error.issues)));
    }
    req.query = parsed.data;
    next();
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      return next(new ValidationError(mapZodError(parsed.error.issues)));
    }
    req.params = parsed.data;
    next();
  };
}
