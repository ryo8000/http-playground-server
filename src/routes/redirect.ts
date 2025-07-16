import { Router } from 'express';
import { HttpStatusCodes, RedirectStatuses } from '../utils/http.js';
import { toSafeInteger } from '../utils/number.js';

const redirectRouter = Router();

redirectRouter.all('/', (req, res) => {
  const url = req.query['url']?.toString();
  const reqRedirectStatus = req.query['status']?.toString();
  const redirectStatus = reqRedirectStatus
    ? toSafeInteger(reqRedirectStatus)
    : HttpStatusCodes.FOUND;

  if (!url) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: {
        message: 'Missing `url` query parameter',
      },
    });
    return;
  }

  if (redirectStatus === undefined || !RedirectStatuses.has(redirectStatus)) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: {
        message: 'Invalid redirect status code. Supported statuses are 301, 302, 303, 307 and 308',
      },
    });
    return;
  }

  res.redirect(redirectStatus, url);
});

export { redirectRouter };
