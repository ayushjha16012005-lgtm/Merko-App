import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId =
    req.header('x-correlation-id') ?? req.header('x-request-id') ?? randomUUID();

  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}
