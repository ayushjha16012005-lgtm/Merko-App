import pino from 'pino';
import pinoHttp from 'pino-http';
import { Request } from 'express';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const requestLogger = pinoHttp({
  logger,
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
