import { Router } from 'express';
import { environment } from '../env';
import { HttpStatusCodes } from '../utils/http';

const shutdownRouter = Router();

shutdownRouter.all('/', (_req, res) => {
  if (!environment.enableShutdown) {
    res.status(HttpStatusCodes.FORBIDDEN).json({
      error: {
        message: 'Shutdown is not enabled',
      },
    });
    return;
  }

  res.json({ message: 'Server shutting down' });
  process.exit(0);
});

export { shutdownRouter };
