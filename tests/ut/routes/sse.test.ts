import express from 'express';
import request from 'supertest';
import { sseRouter } from '../../../src/routes/sse.js';

const app = express();
app.use('/sse', sseRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('sseRouter', () => {
  it.each(HTTP_METHODS)('should stream the requested number of events via %s', async (method) => {
    const response = await request(app)[method]('/sse?count=2&interval=1');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('text/event-stream; charset=utf-8');
    expect(response.headers['cache-control']).toBe('no-cache');
    if (method !== 'head') {
      expect(response.text).toContain('id: 1');
      expect(response.text).toContain('id: 2');
      expect(response.text).toContain('data: {"index":1,');
      expect(response.text).not.toContain('id: 3');
    }
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

  it.each(HTTP_METHODS)('should return 400 for an invalid interval via %s', async (method) => {
    const response = await request(app)[method]('/sse?interval=0');

    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({
        error: { message: 'Invalid interval. Must be an integer between 1 and 10000.' },
      });
    }
  });
});
