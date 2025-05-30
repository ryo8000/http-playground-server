import { Router } from 'express';
import { HttpStatusCodes } from '../utils/http';

const indexRouter = Router();

indexRouter.all('/', (_req, res) => {
  res.sendStatus(HttpStatusCodes.OK);
});

export { indexRouter };
