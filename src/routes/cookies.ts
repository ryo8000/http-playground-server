import { Router } from 'express';
import { deleteCookies, readCookies, setCookies } from '../services/cookies.js';

const cookiesRouter = Router();

cookiesRouter.all('/', (req, res) => {
  const result = readCookies(req.headers.cookie);

  res.status(result.status).json(result.body);
});

cookiesRouter.all('/set', (req, res) => {
  const result = setCookies(req.query);

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  for (const [name, value] of Object.entries(result.body.cookies)) {
    res.cookie(name, value);
  }

  res.status(result.status).json(result.body);
});

cookiesRouter.all('/delete', (req, res) => {
  const result = deleteCookies(req.query);

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  for (const name of result.body.deleted) {
    res.clearCookie(name);
  }

  res.status(result.status).json(result.body);
});

export { cookiesRouter };
