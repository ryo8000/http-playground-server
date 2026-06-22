import { Router, Response } from 'express';
import { HttpStatusCodes, RedirectStatuses } from '../utils/http.js';
import { toSafeInteger } from '../utils/number.js';

const redirectRouter = Router();

/**
 * Sends a 400 Bad Request response indicating an invalid redirect status code.
 *
 * @param {Response} res - The Express response object.
 */
const sendInvalidStatusError = (res: Response): void => {
  res.status(HttpStatusCodes.BAD_REQUEST).json({
    error: {
      message: 'Invalid redirect status code. Supported statuses are 301, 302, 303, 307 and 308',
    },
  });
};

redirectRouter.all('/', (req, res) => {
  const url = typeof req.query['url'] === 'string' ? req.query['url'] : undefined;
  const statusParam = req.query['status'];

  if (!url) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: {
        message: 'Missing `url` query parameter',
      },
    });
    return;
  }

  if (statusParam !== undefined && typeof statusParam !== 'string') {
    sendInvalidStatusError(res);
    return;
  }

  const redirectStatus =
    statusParam === undefined ? HttpStatusCodes.FOUND : toSafeInteger(statusParam);

  if (redirectStatus === undefined || !RedirectStatuses.has(redirectStatus)) {
    sendInvalidStatusError(res);
    return;
  }

  // codeql[js/server-side-unvalidated-url-redirection]
  res.redirect(redirectStatus, url);
});

export { redirectRouter };
