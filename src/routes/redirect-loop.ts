import { Router } from 'express';
import { HttpStatusCodes } from '../utils/http.js';

const redirectLoopRouter = Router();

redirectLoopRouter.all('/', (req, res) => {
  // Redirect to the same URL (including query params) so middleware like `delay`
  // stays applied on every hop of the loop.
  res.redirect(HttpStatusCodes.FOUND, req.originalUrl);
});

export { redirectLoopRouter };
