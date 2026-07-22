import { Router } from 'express';
import { bearerAuth } from '../services/bearer-auth.js';

const bearerAuthRouter = Router();

bearerAuthRouter.all('/', (req, res) => {
  const result = bearerAuth(req.query['token'], req.headers.authorization);

  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }
  }

  res.status(result.status).json(result.body);
});

export { bearerAuthRouter };
