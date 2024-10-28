import { Router } from 'express';
import { HTTP_STATUS_CODE_MAP } from '../constants';
import { createStatusResponse } from '../models/statusResponse';
import { toSafeInteger } from '../utils/numberUtils';

const statusRouter = Router();

statusRouter.get('/:status', (req, res) => {
  const reqStatusCode = toSafeInteger(req.params.status);
  const isValidStatusCode = reqStatusCode >= 200 && reqStatusCode <= 599;

  const statusCode = isValidStatusCode ? reqStatusCode : 400;
  const message = isValidStatusCode
    ? HTTP_STATUS_CODE_MAP[statusCode] || 'unknown'
    : HTTP_STATUS_CODE_MAP[statusCode]!;
  const errorMessage = isValidStatusCode ? undefined : 'Invalid status';

  res.status(statusCode).json(createStatusResponse(statusCode, message, errorMessage));
});

export { statusRouter };
