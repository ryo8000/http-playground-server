import { Router } from 'express';

const timeoutRouter = Router();

timeoutRouter.all('/', () => {
  // Simulate a timeout by never sending a response
  return;
});

export { timeoutRouter };
