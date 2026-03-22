import { Router } from 'express';
import { redirect } from '../services/redirect.js';

const redirectRouter = Router();

redirectRouter.all('/', (req, res) => {
  const result = redirect(req.query['url']?.toString(), req.query['status']?.toString());

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  res.redirect(result.status, result.url);
});

export { redirectRouter };
