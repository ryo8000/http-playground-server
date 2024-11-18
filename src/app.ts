import express from 'express';
import { delayMiddleware } from './middlewares/delay';
import { createStatusResponse } from './models/statusResponse';
import { indexRouter } from './routes/index';
import { mirrorRouter } from './routes/mirror';
import { statusRouter } from './routes/status';
import { EnvConfig } from './env';

const app = express();

// Disable X-Powered-By header
app.disable('x-powered-by');

// Set CORS header if an origin is specified in the environment configuration
app.use((_req, res, next) => {
  if (EnvConfig.ORIGIN !== '') {
    res.header({
      'Access-Control-Allow-Origin': EnvConfig.ORIGIN
    });
  }
  next();
});

// Middleware to handle delay based on query parameter
app.use(delayMiddleware);

app.use(express.json());

app.use('/', indexRouter);
app.use('/mirror', mirrorRouter);
app.use('/status', statusRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json(createStatusResponse(404, 'Resource not found'));
});

app.listen(EnvConfig.PORT, () => {
  console.log(`Server is running on http://localhost:${EnvConfig.PORT}`);
});
