import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { validateEnv, getEnv } from '@merko/config';
import { correlationIdMiddleware, requestLogger, errorHandler, logger } from '@/middleware';
import { registerRoutes } from '@/routes';

import path from 'path';

validateEnv();

const env = getEnv();
const app = express();

app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
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
const server = app.listen(port, () => {
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
