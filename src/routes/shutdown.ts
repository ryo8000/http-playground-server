import { Router } from 'express';
import { environment } from '../env.js';
import { shutdown } from '../services/shutdown.js';

const shutdownRouter = Router();

shutdownRouter.all('/', (_req, res) => {
  const result = shutdown(environment.enableShutdown);

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  res.json(result.body);
  process.exit(0);
});

export { shutdownRouter };
