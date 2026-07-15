import { Router } from 'express';
import { failThenSucceed } from '../services/fail-then-succeed.js';

const failThenSucceedRouter = Router();

failThenSucceedRouter.all('/', (req, res) => {
  const result = failThenSucceed(req.query['after'], req.query['id']);

  res.status(result.status).json(result.body);
});

export { failThenSucceedRouter };
