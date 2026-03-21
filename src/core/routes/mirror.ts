import { Router } from 'express';

const mirrorRouter = Router();

mirrorRouter.all('/', (req, res) => {
  res.json(req.method === 'GET' || req.body === undefined ? {} : req.body);
});

export { mirrorRouter };
