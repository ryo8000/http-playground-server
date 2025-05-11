import express from 'express';
import { corsMiddleware } from './middlewares/cors';
import { delayMiddleware } from './middlewares/delay';
import { loggerMiddleware } from './middlewares/logger';
import { createStatusResponse } from './models/statusResponse';
import { indexRouter } from './routes/index';
import { mirrorRouter } from './routes/mirror';
import { shutdownRouter } from './routes/shutdown';
import { statusRouter } from './routes/status';
import { environment } from './env';
import { log } from './logger';

const app = express();

// Disable X-Powered-By header
app.disable('x-powered-by');

app.use(express.json());
app.use(loggerMiddleware);
app.use(delayMiddleware);

app.use('/', indexRouter);
app.use('/mirror', corsMiddleware, mirrorRouter);
app.use('/shutdown', shutdownRouter);
app.use('/status', statusRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json(createStatusResponse(404, { errorMessage: 'Resource not found' }));
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  log.error({ err }, 'Unhandled error occurred');
  const isDevelopment = environment.nodeEnv === 'development';
  const statusCode = isDevelopment ? (err as any).status || 500 : 500;

  res.status(statusCode).json(
    createStatusResponse(statusCode, {
      errorMessage: isDevelopment ? err.stack : 'An unexpected error has occurred.',
    })
  );
});

export { app };
