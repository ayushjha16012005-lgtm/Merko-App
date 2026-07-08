import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { validateEnv, getEnv } from '@merko/config';
import { correlationIdMiddleware, requestLogger, errorHandler, logger } from '@/middleware';
import { registerRoutes } from '@/routes';

import path from 'path';

validateEnv();

const env = getEnv();
const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(helmet());
app.use(limiter);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):(3000|3001|4000)$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during development/testing
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(cookieParser());
app.use(correlationIdMiddleware);
app.use(requestLogger);
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

registerRoutes(app);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: 'API endpoint not found',
    meta: null,
  });
});

app.use(errorHandler);

const port = env.PORT;
const server = app.listen(port, '0.0.0.0', () => {
  logger.info({ port, env: env.NODE_ENV }, 'Server running successfully');
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down server gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down server gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

export default app;
