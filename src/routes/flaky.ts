import { Router } from 'express';
import { flaky } from '../services/flaky.js';

const flakyRouter = Router();

flakyRouter.all('/', (req, res) => {
  const result = flaky(req.query['rate'], Math.random());

  res.status(result.status).json(result.body);
});

export { flakyRouter };
