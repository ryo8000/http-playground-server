import { Router } from 'express';
import { environment } from '../env.js';
import { HttpStatusCodes } from '../utils/http.js';
import { gracefulShutdown } from '../utils/shutdown.js';

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
  gracefulShutdown();
});

export { shutdownRouter };
