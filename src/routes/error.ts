import { Router } from 'express';

const errorRouter = Router();

errorRouter.all('/', (_req, _res) => {
  throw new Error('Intentional error');
});

export { errorRouter };
