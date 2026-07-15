import { Router } from 'express';
import { date } from '../services/date.js';

const dateRouter = Router();

dateRouter.all('/', (req, res) => {
  const result = date(req.query['value']);

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  for (const [key, value] of Object.entries(result.headers)) {
    res.setHeader(key, value);
  }
  res.status(result.status).json(result.body);
});

export { dateRouter };
