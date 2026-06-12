import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { validateEnv, getEnv } from '@merko/config';
import { correlationIdMiddleware } from './middleware/correlation';
import { requestLogger, logger } from './middleware/logger';
import { errorHandler } from './middleware/error';
import { healthRouter } from './modules/health/health.router';

// Validate environment variables on startup. Throws and halts process if configuration is invalid.
validateEnv();

const env = getEnv();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(correlationIdMiddleware);
app.use(requestLogger);

// API Routing with versioning support
app.use('/api/v1/health', healthRouter);

// Fallback route handling for unmatched paths
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    data: null,
    error: 'API endpoint not found',
    meta: null,
  });
});

// Global Exception Filter Middleware
app.use(errorHandler);

const port = env.PORT;
const server = app.listen(port, () => {
  logger.info({ port, env: env.NODE_ENV }, 'Server running successfully');
});

// Handle lifecycle event terminations
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
