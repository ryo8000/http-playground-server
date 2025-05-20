import { Router } from 'express';
import { createStatusResponse } from '../models/statusResponse';
import { HttpStatusCodes } from '../utils/http';
import { toSafeInteger } from '../utils/number';

const statusRouter = Router();

statusRouter.get('/:status', (req, res) => {
  const reqStatusCode = toSafeInteger(req.params.status);
  const isValidStatusCode = reqStatusCode >= 200 && reqStatusCode <= 599;

  const statusCode = isValidStatusCode ? reqStatusCode : HttpStatusCodes.BAD_REQUEST;
  const errorMessage = isValidStatusCode ? undefined : 'Invalid status';

  res.status(statusCode).json(createStatusResponse(statusCode, { errorMessage }));
});

export { statusRouter };
