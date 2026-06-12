import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@/errors';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitInfo>();

export function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    const info = rateLimitMap.get(key);

    if (!info) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (now > info.resetTime) {
      info.count = 1;
      info.resetTime = now + windowMs;
      rateLimitMap.set(key, info);
      return next();
    }

    info.count += 1;
    rateLimitMap.set(key, info);

    if (info.count > limit) {
      _res.setHeader('Retry-After', Math.ceil((info.resetTime - now) / 1000));
      return next(new ForbiddenError('Too many requests, please try again later.'));
    }

    next();
  };
}
