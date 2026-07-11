import { Router } from 'express';
import { bigHeaders } from '../services/big-headers.js';

const bigHeadersRouter = Router();

bigHeadersRouter.all('/', (req, res) => {
  const result = bigHeaders(req.query['size'], req.query['count']);

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  for (const [key, value] of Object.entries(result.headers)) {
    res.setHeader(key, value);
  }
  res.status(result.status).json(result.body);
});

export { bigHeadersRouter };
