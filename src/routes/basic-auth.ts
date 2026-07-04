import { Router } from 'express';
import { basicAuth } from '../services/basic-auth.js';

const basicAuthRouter = Router();

basicAuthRouter.all('/', (req, res) => {
  const result = basicAuth(req.query['user'], req.query['password'], req.headers.authorization);

  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }
  }

  res.status(result.status).json(result.body);
});

export { basicAuthRouter };
