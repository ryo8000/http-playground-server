import express from 'express';
import { corsMiddleware } from './middlewares/cors';
import { delayMiddleware } from './middlewares/delay';
import { createStatusResponse } from './models/statusResponse';
import { indexRouter } from './routes/index';
import { mirrorRouter } from './routes/mirror';
import { statusRouter } from './routes/status';
import { environment } from './env';

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

const server = app.listen(environment.port, () => {
  console.log(`Server is running on http://localhost:${environment.port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');

  server.close((err) => {
    if (err) {
      console.error('Error during server close:', err);
      process.exit(1);
    }

    console.log('HTTP server closed');
    process.exit(0);
  });
});
