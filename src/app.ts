import express from 'express';
import cors from 'cors';
import { delayMiddleware } from './middlewares/delay.js';
import { loggerMiddleware } from './middlewares/logger.js';
import { base64Router } from './routes/base64.js';
import { basicAuthRouter } from './routes/basic-auth.js';
import { bearerAuthRouter } from './routes/bearer-auth.js';
import { bigHeadersRouter } from './routes/big-headers.js';
import { cacheRouter } from './routes/cache.js';
import { cookiesRouter } from './routes/cookies.js';
import { crashRouter } from './routes/crash.js';
import { dateRouter } from './routes/date.js';
import { disconnectRouter } from './routes/disconnect.js';
import { dripRouter } from './routes/drip.js';
import { exceptionRouter } from './routes/exception.js';
import { failThenSucceedRouter } from './routes/fail-then-succeed.js';
import { fakeGzipRouter } from './routes/fake-gzip.js';
import { flakyRouter } from './routes/flaky.js';
import { gzipRouter } from './routes/gzip.js';
import { indexRouter } from './routes/index.js';
import { infiniteRouter } from './routes/infinite.js';
import { keepAliveCutRouter } from './routes/keep-alive-cut.js';
import { malformedJsonRouter } from './routes/malformed-json.js';
import { mirrorRouter } from './routes/mirror.js';
import { rateLimitRouter } from './routes/rate-limit.js';
import { redirectRouter } from './routes/redirect.js';
import { redirectLoopRouter } from './routes/redirect-loop.js';
import { requestRouter } from './routes/request.js';
import { resetRouter } from './routes/reset.js';
import { shutdownRouter } from './routes/shutdown.js';
import { statusRouter } from './routes/status.js';
import { timeoutRouter } from './routes/timeout.js';
import { truncateRouter } from './routes/truncate.js';
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
    // Neither the conditional request headers nor ETag are CORS-safelisted
    allowedHeaders: ['Authorization', 'Content-Type', 'If-None-Match', 'If-Modified-Since'],
    exposedHeaders: ['ETag'],
  }),
);
app.use(loggerMiddleware);
app.use(delayMiddleware);

app.use('/', indexRouter);
app.use('/base64', base64Router);
app.use('/basic-auth', basicAuthRouter);
app.use('/bearer-auth', bearerAuthRouter);
app.use('/big-headers', bigHeadersRouter);
app.use('/cache', cacheRouter);
app.use('/cookies', cookiesRouter);
app.use('/crash', crashRouter);
app.use('/date', dateRouter);
app.use('/disconnect', disconnectRouter);
app.use('/drip', dripRouter);
app.use('/exception', exceptionRouter);
app.use('/fail-then-succeed', failThenSucceedRouter);
app.use('/fake-gzip', fakeGzipRouter);
app.use('/flaky', flakyRouter);
app.use('/gzip', gzipRouter);
app.use('/infinite', infiniteRouter);
app.use('/keep-alive-cut', keepAliveCutRouter);
app.use('/malformed-json', malformedJsonRouter);
app.use('/mirror', mirrorRouter);
app.use('/rate-limit', rateLimitRouter);
app.use('/redirect', redirectRouter);
app.use('/redirect-loop', redirectLoopRouter);
app.use('/request', requestRouter);
app.use('/reset', resetRouter);
app.use('/shutdown', shutdownRouter);
app.use('/status', statusRouter);
app.use('/timeout', timeoutRouter);
app.use('/truncate', truncateRouter);
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
