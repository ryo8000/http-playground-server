import { Router } from 'express';
import { HTTP_STATUS_CODE_MAP } from '../constants';
import { createStatusResponse } from '../models/statusResponse';

const indexRouter = Router();
const statusCode = 200;

indexRouter.all('/', (_req, res) => {
  const responseBody = createStatusResponse(
    statusCode,
    HTTP_STATUS_CODE_MAP[statusCode]!
  );

  res.json(responseBody);
});

export { indexRouter };
