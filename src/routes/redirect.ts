import { Router } from 'express';
import { HttpStatusCodes, RedirectStatuses } from '../utils/http';
import { toSafeInteger } from '../utils/number';

const redirectRouter = Router();

redirectRouter.all('/:url', (req, res) => {
  const { url } = req.params;
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

  if (!RedirectStatuses.has(redirectStatus)) {
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
