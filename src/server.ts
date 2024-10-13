import express from 'express';
import { statusRouter } from './routes/statusRoutes';

const app = express();
const PORT = 8000;

app.use(express.json());

app.use('/status', statusRouter);

app.get('/', (_req, res) => {
  res.send('Hello!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
