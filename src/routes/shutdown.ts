import { Router } from 'express';
import { environment } from '../env';
import { createStatusResponse } from '../models/statusResponse';

const shutdownRouter = Router();

shutdownRouter.post('/', (_req, res) => {
  if (!environment.enableShutdown) {
    res.status(403).json(createStatusResponse(403, { errorMessage: 'Shutdown is not enabled' }));
    return;
  }

  res.status(200).json(createStatusResponse(200, { message: 'Server shutting down' }));
  process.exit(0);
});

export { shutdownRouter };
