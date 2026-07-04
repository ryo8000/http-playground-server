import { Router } from 'express';
import { status } from '../services/status.js';

const statusRouter = Router();

statusRouter.all('/:status', (req, res) => {
  const result = status(req.params.status);

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  res.sendStatus(result.status);
});

export { statusRouter };
