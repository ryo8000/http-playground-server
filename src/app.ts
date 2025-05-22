import express from 'express';
import cookieParser from 'cookie-parser';
import { corsMiddleware } from './middlewares/cors';
import { delayMiddleware } from './middlewares/delay';
import { loggerMiddleware } from './middlewares/logger';
import { createStatusResponse } from './models/statusResponse';
import { indexRouter } from './routes/index';
import { mirrorRouter } from './routes/mirror';
import { shutdownRouter } from './routes/shutdown';
import { statusRouter } from './routes/status';
import { requestRouter } from './routes/request';
import { HttpStatusCodes } from './utils/http';
import { environment } from './env';
import { log } from './logger';

const app = express();

// Disable X-Powered-By header
app.disable('x-powered-by');

app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);
app.use(delayMiddleware);

app.use('/', indexRouter);
app.use('/mirror', corsMiddleware, mirrorRouter);
app.use('/request', requestRouter);
app.use('/shutdown', shutdownRouter);
app.use('/status', statusRouter);

// 404 handler
app.use((_req, res) => {
  res
    .status(HttpStatusCodes.NOT_FOUND)
    .json(createStatusResponse(HttpStatusCodes.NOT_FOUND, { errorMessage: 'Resource not found' }));
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  log.error({ err }, 'Unhandled error occurred');
  const isDevelopment = environment.nodeEnv === 'development';
  const statusCode = isDevelopment
    ? (err as any).status || HttpStatusCodes.INTERNAL_SERVER_ERROR
    : HttpStatusCodes.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json(
    createStatusResponse(statusCode, {
      errorMessage: isDevelopment ? err.stack : 'An unexpected error has occurred.',
    })
  );
});

export { app };
