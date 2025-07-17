import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { delayMiddleware } from './middlewares/delay.js';
import { loggerMiddleware } from './middlewares/logger.js';
import { base64Router } from './routes/base64.js';
import { basicAuthRouter } from './routes/basic-auth.js';
import { errorRouter } from './routes/error.js';
import { indexRouter } from './routes/index.js';
import { mirrorRouter } from './routes/mirror.js';
import { redirectRouter } from './routes/redirect.js';
import { requestRouter } from './routes/request.js';
import { shutdownRouter } from './routes/shutdown.js';
import { statusRouter } from './routes/status.js';
import { uuidRouter } from './routes/uuid.js';
import { HttpStatusCodes } from './utils/http.js';
import { environment } from './env.js';
import { log } from './logger.js';

const app = express();

// Disable X-Powered-By header
app.disable('x-powered-by');

app.use(express.text());
app.use(express.json());
app.use(
  cors({
    origin: environment.origin,
    allowedHeaders: ['Authorization', 'Content-Type'],
  })
);
app.use(cookieParser());
app.use(loggerMiddleware);
app.use(delayMiddleware);

app.use('/', indexRouter);
app.use('/base64', base64Router);
app.use('/basic-auth', basicAuthRouter);
app.use('/error', errorRouter);
app.use('/mirror', mirrorRouter);
app.use('/redirect', redirectRouter);
app.use('/request', requestRouter);
app.use('/shutdown', shutdownRouter);
app.use('/status', statusRouter);
app.use('/uuid', uuidRouter);

// 404 handler
app.use((_req, res) => {
  res.status(HttpStatusCodes.NOT_FOUND).json({
    error: {
      message: 'Resource not found',
    },
  });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  log.error({ err }, 'Unhandled error occurred');
  const isDevelopment = environment.nodeEnv === 'development';
  const statusCode = isDevelopment
    ? (err as Error & { status?: number }).status || HttpStatusCodes.INTERNAL_SERVER_ERROR
    : HttpStatusCodes.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    error: {
      message: isDevelopment ? err.stack : 'An unexpected error has occurred.',
    },
  });
});

export { app };
