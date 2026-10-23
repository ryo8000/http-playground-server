import { ServerResponse } from 'node:http';
import express from 'express';
import request from 'supertest';
import { sseRouter } from '../../../src/routes/sse.js';

const app = express();
app.use('/sse', sseRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('sseRouter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(HTTP_METHODS)('should stream the requested number of events via %s', async (method) => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    const response = await request(app)[method]('/sse?count=2&interval=1');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/event-stream; charset=utf-8');
    expect(response.headers['cache-control']).toBe('no-cache');
    if (method === 'head') {
      expect(setIntervalSpy).not.toHaveBeenCalled();
    } else {
      expect(response.text).toMatch(
        /^id: 1\ndata: \{"index":1,"timestamp":"[^"]+"\}\n\nid: 2\ndata: \{"index":2,"timestamp":"[^"]+"\}\n\n$/,
      );
    }
  });

  it('should end without starting the interval for a single event', async () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    const response = await request(app).get('/sse?count=1&interval=10000');

    expect(response.status).toBe(200);
    expect(response.text).toMatch(/^id: 1\ndata: \{"index":1,"timestamp":"[^"]+"\}\n\n$/);
    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it('should send the first event before starting the interval', async () => {
    const writeSpy = jest.spyOn(ServerResponse.prototype, 'write');
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    const response = await request(app).get('/sse?count=2&interval=1');

    expect(response.status).toBe(200);
    expect(writeSpy.mock.calls[0]?.[0]).toMatch(/^id: 1\n/);
    expect(writeSpy.mock.invocationCallOrder[0]).toBeLessThan(
      setIntervalSpy.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it('should not start the interval when the client has already disconnected', async () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');
    const abortedApp = express();
    const handled = new Promise<void>((resolve) => {
      abortedApp.use(
        '/sse',
        (req, res, next) => {
          res.on('close', () => {
            next();
            resolve();
          });
          req.socket.destroy();
        },
        sseRouter,
      );
    });

    await request(abortedApp)
      .get('/sse?count=2&interval=1')
      .catch(() => undefined);
    await handled;

    expect(setIntervalSpy).not.toHaveBeenCalled();
  });

  it('should resume after the Last-Event-ID', async () => {
    const response = await request(app).get('/sse?count=2&interval=1').set('Last-Event-ID', '1');

    expect(response.status).toBe(200);
    expect(response.text).toMatch(/^id: 2\ndata: \{"index":2,"timestamp":"[^"]+"\}\n\n$/);
  });

  it('should return 204 when the Last-Event-ID has reached the count', async () => {
    const response = await request(app).get('/sse?count=2').set('Last-Event-ID', '2');

    expect(response.status).toBe(204);
  });

  it.each(HTTP_METHODS)('should return 400 for an invalid count via %s', async (method) => {
    const response = await request(app)[method]('/sse?count=101');

    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({
        error: { message: 'Invalid count. Must be an integer between 1 and 100.' },
      });
    }
  });
});
