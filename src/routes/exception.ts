import { Router } from 'express';

const exceptionRouter = Router();

exceptionRouter.all('/', () => {
  throw new Error('Intentional error');
});

export { exceptionRouter };
