import { Router } from 'express';
import { HttpStatusCodes } from '../utils/http.js';

const keepAliveCutRouter = Router();

keepAliveCutRouter.all('/', (req, res) => {
  // Promise a persistent connection, then reset it right after the response,
  // so clients reusing pooled connections hit ECONNRESET on their next request.
  res.setHeader('Connection', 'keep-alive');
  res.on('finish', () => {
    req.socket.resetAndDestroy();
  });
  res.status(HttpStatusCodes.OK).json({ message: 'Connection will be reset after this response' });
});

export { keepAliveCutRouter };
