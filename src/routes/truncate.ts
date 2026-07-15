import { Router } from 'express';
import { truncate } from '../services/truncate.js';
import { HttpStatusCodes } from '../utils/http.js';

const truncateRouter = Router();

truncateRouter.all('/', (req, res) => {
  const result = truncate(req.query['size'], req.query['send'], req.query['chunked']);

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  res.status(HttpStatusCodes.OK).type('application/octet-stream');
  if (!result.chunked) {
    // Declare the full size but send only part of it, so clients see a truncated body.
    res.setHeader('Content-Length', result.size);
  }
  res.flushHeaders();
  res.write(Buffer.alloc(result.send, 'a'), () => {
    req.socket.destroy();
  });
});

export { truncateRouter };
