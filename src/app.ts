import express from 'express';
import { delayMiddleware } from './middlewares/delay';
import { indexRouter } from './routes/index';
import { mirrorRouter } from './routes/mirror';
import { statusRouter } from './routes/status';
import { EnvConfig } from './env';

const app = express();

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

app.listen(EnvConfig.PORT, () => {
  console.log(`Server is running on http://localhost:${EnvConfig.PORT}`);
});
