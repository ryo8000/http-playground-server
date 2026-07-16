import { Router } from 'express';

const malformedJsonRouter = Router();

malformedJsonRouter.all('/', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send('{"invalid-json": true, missingQuotes: value'); // Missing closing brace and quotes
  return;
});

export { malformedJsonRouter };
