import { Router } from 'express';

const mirrorRouter = Router();

mirrorRouter.post('/', (req, res) => {
  res.json(req.body);
});

export { mirrorRouter };
