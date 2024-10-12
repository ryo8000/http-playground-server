import express from 'express';
import { HTTP_STATUS_CODE_MAP } from './constants';

const app = express();
const PORT = 8000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/status/:status', (req, res) => {
  const reqStatucCode = parseInt(req.params.status);
  const statucCode = (reqStatucCode >= 100 && reqStatucCode <= 599) ? reqStatucCode : 400;
  res.status(statucCode).json({ statucCode, message: HTTP_STATUS_CODE_MAP[statucCode] || 'unknown' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
