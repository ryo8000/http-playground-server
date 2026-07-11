import { Router } from 'express';
import { HttpStatusCodes } from '../utils/http.js';

const CHUNK_SIZE_BYTES = 1024;
const WRITE_INTERVAL_MS = 100;

const infiniteRouter = Router();

infiniteRouter.all('/', (req, res) => {
  res.status(HttpStatusCodes.OK).type('application/octet-stream');
  res.flushHeaders();

  // Drop writes while the socket buffer is full so a slow client can't grow memory unboundedly
  const chunk = Buffer.alloc(CHUNK_SIZE_BYTES, 'a');
  const timer = setInterval(() => {
    if (!res.writableNeedDrain) {
      res.write(chunk);
    }
  }, WRITE_INTERVAL_MS);
  res.on('close', () => clearInterval(timer));
});

export { infiniteRouter };
