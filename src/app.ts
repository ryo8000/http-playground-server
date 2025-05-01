import express from 'express';
import { corsMiddleware } from './middlewares/cors';
import { delayMiddleware } from './middlewares/delay';
import { createStatusResponse } from './models/statusResponse';
import { indexRouter } from './routes/index';
import { mirrorRouter } from './routes/mirror';
import { statusRouter } from './routes/status';

const app = express();

// Disable X-Powered-By header
app.disable('x-powered-by');

app.use(express.json());
app.use(delayMiddleware);

app.use('/', indexRouter);
app.use('/mirror', corsMiddleware, mirrorRouter);
app.use('/status', statusRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json(createStatusResponse(404, 'Resource not found'));
});

// Error handler
app.use((_err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json(createStatusResponse(500));
});

export { app };
