import { Router } from 'express';
import { sse } from '../services/sse.js';
import { HttpStatusCodes } from '../utils/http.js';

const sseRouter = Router();

sseRouter.all('/', (req, res) => {
  const result = sse(req.query['count'], req.query['interval'], req.get('Last-Event-ID'));

  if (!result.ok) {
    res.status(result.status).json(result.body);
    return;
  }

  // 204 stops EventSource from reconnecting.
  if (result.lastEventId >= result.count) {
    res.status(HttpStatusCodes.NO_CONTENT).end();
    return;
  }

  res
    .status(HttpStatusCodes.OK)
    .set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
  res.flushHeaders();

  // HEAD has no body to stream; end after the headers so the timer never runs.
  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  let sent = result.lastEventId;
  /**
   * Writes the next event to the stream and ends it once all events are sent.
   *
   * @returns Whether the stream has ended.
   */
  const sendEvent = () => {
    sent += 1;
    res.write(
      `id: ${sent}\ndata: ${JSON.stringify({ index: sent, timestamp: new Date().toISOString() })}\n\n`,
    );
    if (sent < result.count) {
      return false;
    }
    res.end();
    return true;
  };

  // 'close' may have already fired (e.g. client aborted during ?delay=), so the listener below would never clear the timer.
  if (sendEvent() || res.closed) {
    return;
  }

  const timer = setInterval(() => {
    if (sendEvent()) {
      clearInterval(timer);
    }
  }, result.interval);
  res.on('close', () => clearInterval(timer));
});

export { sseRouter };
