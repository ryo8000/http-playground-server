import { Router } from 'express';
import { sse } from '../services/sse.js';
import { HttpStatusCodes } from '../utils/http.js';

const sseRouter = Router();

sseRouter.all('/', (req, res) => {
  const result = sse(req.query['count'], req.query['interval']);

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  res
    .status(HttpStatusCodes.OK)
    .set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
  res.flushHeaders();

  let sent = 0;
  const timer = setInterval(() => {
    sent += 1;
    res.write(`id: ${sent}\ndata: {"index":${sent},"timestamp":"${new Date().toISOString()}"}\n\n`);
    if (sent >= result.count) {
      clearInterval(timer);
      res.end();
    }
  }, result.interval);
  res.on('close', () => clearInterval(timer));
});

export { sseRouter };
