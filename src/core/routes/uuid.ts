import { Router } from 'express';
import { randomUUID } from 'crypto';

const uuidRouter = Router();

uuidRouter.all('/', (_req, res) => {
  const uuid = randomUUID();
  res.json({ uuid });
});

export { uuidRouter };
