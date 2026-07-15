import { Router } from 'express';
import { HttpStatusCodes } from '../utils/http.js';

const redirectLoopRouter = Router();

redirectLoopRouter.all('/', (_req, res) => {
  res.redirect(HttpStatusCodes.FOUND, '/redirect-loop');
});

export { redirectLoopRouter };
