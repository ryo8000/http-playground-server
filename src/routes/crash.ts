import { Router } from 'express';
import { environment } from '../env.js';
import { crash } from '../services/crash.js';

const crashRouter = Router();

crashRouter.all('/', (_req, res) => {
  const result = crash(environment.enableCrash);

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  // Exit abruptly after the response is sent, skipping graceful shutdown.
  res.on('finish', () => {
    process.exit(1);
  });
  res.status(result.status).json(result.body);
});

export { crashRouter };
