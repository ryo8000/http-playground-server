import { Router } from 'express';
import { environment } from '../env';
import { createStatusResponse } from '../models/statusResponse';
import { HttpStatusCodes } from '../utils/http';

const shutdownRouter = Router();

shutdownRouter.post('/', (_req, res) => {
  if (!environment.enableShutdown) {
    res
      .status(HttpStatusCodes.FORBIDDEN)
      .json(
        createStatusResponse(HttpStatusCodes.FORBIDDEN, { errorMessage: 'Shutdown is not enabled' })
      );
    return;
  }

  res.json(createStatusResponse(HttpStatusCodes.OK, { message: 'Server shutting down' }));
  process.exit(0);
});

export { shutdownRouter };
