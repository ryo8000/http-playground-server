import { Router } from 'express';
import { setCookies } from '../services/cookies.js';
import { HttpStatusCodes } from '../utils/http.js';

const cookiesRouter = Router();

cookiesRouter.all('/set', (req, res) => {
  const result = setCookies(req.query);

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  for (const [name, value] of Object.entries(result.cookies)) {
    res.cookie(name, value);
  }

  res.status(HttpStatusCodes.OK).json({ cookies: result.cookies });
});

cookiesRouter.all('/delete', (req, res) => {
  const deleted = Object.keys(req.query);

  for (const name of deleted) {
    res.clearCookie(name);
  }

  res.status(HttpStatusCodes.OK).json({ deleted });
});

cookiesRouter.all('/', (req, res) => {
  res.status(HttpStatusCodes.OK).json({ cookies: req.cookies ?? {} });
});

export { cookiesRouter };
