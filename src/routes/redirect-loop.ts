import { Router } from 'express';
import { HttpStatusCodes } from '../utils/http.js';

const redirectLoopRouter = Router();

redirectLoopRouter.all('/', (req, res) => {
  // Redirect to this same route, preserving only the query string so middleware
  // like `delay` stays applied on every hop. The path is a literal (not
  // req.originalUrl) to avoid reflecting user input into the redirect target.
  const queryIndex = req.originalUrl.indexOf('?');
  const queryString = queryIndex === -1 ? '' : req.originalUrl.slice(queryIndex);
  res.redirect(HttpStatusCodes.FOUND, `/redirect-loop${queryString}`);
});

export { redirectLoopRouter };
