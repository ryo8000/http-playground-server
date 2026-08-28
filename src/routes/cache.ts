import { Router } from 'express';
import { cache, cacheControl } from '../services/cache.js';

const cacheRouter = Router();

cacheRouter.all('/', (req, res) => {
  const result = cache(req.query['etag']);

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  // Express's req.fresh turns this into a 304 when the validators match
  res.set(result.headers).status(result.status).json(result.body);
});

cacheRouter.all('/:seconds', (req, res) => {
  const result = cacheControl(req.params.seconds);

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  res.status(result.status).set(result.headers).json(result.body);
});

export { cacheRouter };
