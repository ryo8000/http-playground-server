import { Router } from 'express';
import { HttpStatusCodes } from '../utils/http';
import { toSafeInteger } from '../utils/number';

const statusRouter = Router();

statusRouter.all('/:status', (req, res) => {
  const statusCode = toSafeInteger(req.params.status);
  const isValidStatusCode = statusCode >= 200 && statusCode <= 599;

  if (!isValidStatusCode) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: {
        message: 'Invalid status',
      },
    });
    return;
  }

  res.sendStatus(statusCode);
});

export { statusRouter };
