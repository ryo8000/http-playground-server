import { Router } from 'express';
import { cache, cacheControl } from '../services/cache.js';

const cacheRouter = Router();

cacheRouter.all('/', (req, res) => {
  const result = cache(
    req.headers['if-none-match'],
    req.headers['if-modified-since'],
    req.query['etag'],
    new Date(),
  );

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  if (result.headers) {
    res.set(result.headers);
  }

  if (result.body) {
    res.status(result.status).json(result.body);
  } else {
    res.status(result.status).end();
  }
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
