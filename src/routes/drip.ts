import { Router } from 'express';
import { drip } from '../services/drip.js';
import { HttpStatusCodes } from '../utils/http.js';

const dripRouter = Router();

dripRouter.all('/', (req, res) => {
  const result = drip(req.query['size'], req.query['interval']);

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  res.status(HttpStatusCodes.OK).type('application/octet-stream');
  res.setHeader('Content-Length', result.size);
  res.flushHeaders();

  // HEAD has no body to drip; end after the headers so the timer never runs.
  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  let sent = 0;
  const timer = setInterval(() => {
    res.write('a');
    sent += 1;
    if (sent >= result.size) {
      clearInterval(timer);
      res.end();
    }
  }, result.interval);
  res.on('close', () => clearInterval(timer));
});

export { dripRouter };
