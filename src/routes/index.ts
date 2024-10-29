import { Router } from 'express';
import { createStatusResponse } from '../models/statusResponse';

const indexRouter = Router();
const statusCode = 200;

indexRouter.all('/', (_req, res) => {
  const responseBody = createStatusResponse(statusCode);

  res.json(responseBody);
});

export { indexRouter };
