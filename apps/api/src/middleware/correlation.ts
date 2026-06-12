import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
    }
  }
}

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = (req.header('x-correlation-id') || req.header('x-request-id') || randomUUID()) as string;
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}
