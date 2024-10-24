import express from 'express';
import { mirrorRouter } from './routes/mirrorRoutes';
import { statusRouter } from './routes/statusRoutes';
import { EnvConfig } from './env';

const app = express();

app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(express.json());

app.use('/mirror', mirrorRouter);
app.use('/status', statusRouter);

app.get('/', (_req, res) => {
  res.send('Hello!');
});

app.listen(EnvConfig.PORT, () => {
  console.log(`Server is running on http://localhost:${EnvConfig.PORT}`);
});
