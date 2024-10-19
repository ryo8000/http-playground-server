import { Router } from 'express';
import { HTTP_STATUS_CODE_MAP } from '../constants';
import { createStatusResponse } from '../models/statusResponse';

const statusRouter = Router();

statusRouter.get('/:status', (req, res) => {
  const reqStatusCode = parseInt(req.params.status);
  const statusCode =
    reqStatusCode >= 200 && reqStatusCode <= 599 ? reqStatusCode : 400;

  const responseBody = createStatusResponse(
    statusCode,
    HTTP_STATUS_CODE_MAP[statusCode] || 'unknown'
  );

  res.status(statusCode).json(responseBody);
});

export { statusRouter };
