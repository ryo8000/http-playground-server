import { Router } from 'express';
import { createStatusResponse } from '../models/statusResponse';
import { HttpStatusCodes } from '../utils/http';

const indexRouter = Router();

indexRouter.all('/', (_req, res) => {
  const responseBody = createStatusResponse(HttpStatusCodes.OK);

  res.json(responseBody);
});

export { indexRouter };
