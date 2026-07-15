import { Router } from 'express';
import { rateLimit } from '../services/rate-limit.js';

const rateLimitRouter = Router();

rateLimitRouter.all('/', (req, res) => {
  const result = rateLimit(req.query['limit'], req.query['window'], req.query['id'], Date.now());

  if (result.headers) {
    res.set(result.headers);
  }
  res.status(result.status).json(result.body);
});

export { rateLimitRouter };
