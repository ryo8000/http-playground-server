import { Router } from 'express';
import { HttpStatusCodes } from '../utils/http.js';
import { toSafeInteger } from '../utils/number.js';

const MIN_VALID_STATUS_CODE = 200;
const MAX_VALID_STATUS_CODE = 599;

const statusRouter = Router();

statusRouter.all('/:status', (req, res) => {
  const statusCode = toSafeInteger(req.params.status);

  if (
    statusCode === undefined ||
    statusCode < MIN_VALID_STATUS_CODE ||
    statusCode > MAX_VALID_STATUS_CODE
  ) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: {
        message: `Invalid status code. Must be an integer between ${MIN_VALID_STATUS_CODE} and ${MAX_VALID_STATUS_CODE}.`,
      },
    });
    return;
  }

  res.sendStatus(statusCode);
});

export { statusRouter };
