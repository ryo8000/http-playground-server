import { Router } from 'express';

const mirrorRouter = Router();

mirrorRouter.all('/', (req, res) => {
  res.json({
    'method': req.method,
    'query': req.query,
    'headers': req.headers,
    'body': req.method === 'GET' || req.body === undefined ? {} : req.body
  });
});

export { mirrorRouter };
