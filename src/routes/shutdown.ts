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

  // Use the finish event to ensure the response is sent before signaling shutdown.
  res.on('finish', () => {
    process.kill(process.pid, 'SIGTERM');
  });
  res.status(result.status).json(result.body);
});

export { shutdownRouter };
