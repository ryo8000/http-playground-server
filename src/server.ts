import express from 'express';
import { statusRouter } from './routes/statusRoutes';
import { EnvConfig } from './env';

const app = express();

app.use(express.json());

app.use('/status', statusRouter);

app.get('/', (_req, res) => {
  res.send('Hello!');
});

app.listen(EnvConfig.PORT, () => {
  console.log(`Server is running on http://localhost:${EnvConfig.PORT}`);
});
