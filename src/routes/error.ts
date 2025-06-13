import { Router } from 'express';

const errorRouter = Router();

errorRouter.all('/timeout', () => {
  // Simulate a timeout by never sending a response
  return;
});

errorRouter.all('/network', (req) => {
  // Intentionally destroy the connection
  req.socket.destroy();
  return;
});

errorRouter.all('/malformed-json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send('{"invalid-json": true, missingQuotes: value'); // Missing closing brace and quotes
  return;
});

errorRouter.all('/error', () => {
  throw new Error('Intentional error');
});

export { errorRouter };
