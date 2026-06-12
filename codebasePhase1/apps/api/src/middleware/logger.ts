import pino from 'pino';
import pinoHttp from 'pino-http';
import type { Request } from 'express';

export const appLogger = pino({
  name: 'merko-api',
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const errorLogger = appLogger.child({ logger: 'error' });

export const requestLogger = pinoHttp({
  logger: appLogger.child({ logger: 'request' }),
  customProps: (req) => {
    const expressReq = req as unknown as Request;
    return {
      correlationId: expressReq.correlationId,
    };
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent'],
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

export const logger = appLogger;
