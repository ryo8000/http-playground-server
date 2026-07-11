import express from 'express';
import request from 'supertest';
import { bigHeadersRouter } from '../../../src/routes/big-headers.js';

const app = express();
app.use('/big-headers', bigHeadersRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('bigHeadersRouter', () => {
  it.each(HTTP_METHODS)(
    'should send the requested number of headers of the requested size via %s',
    async (method) => {
      const response = await request(app)[method]('/big-headers?size=100&count=3');
      expect(response.status).toBe(200);
      expect(response.headers['x-big-header-1']).toBe('a'.repeat(100));
      expect(response.headers['x-big-header-2']).toBe('a'.repeat(100));
      expect(response.headers['x-big-header-3']).toBe('a'.repeat(100));
      if (method !== 'head') {
        expect(response.body).toEqual({ message: 'Sent 3 header(s) of 100 byte(s)' });
      }
    },
  );

  it.each(HTTP_METHODS)('should default to one 8192-byte header via %s', async (method) => {
    const response = await request(app)[method]('/big-headers');
    expect(response.status).toBe(200);
    expect(response.headers['x-big-header-1']).toHaveLength(8192);
    expect(response.headers['x-big-header-2']).toBeUndefined();
  });

  it.each(HTTP_METHODS)('should return 400 for an invalid size via %s', async (method) => {
    const response = await request(app)[method]('/big-headers?size=0');
    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({
        error: { message: 'Invalid size. Must be an integer between 1 and 1048576.' },
      });
    }
  });
});
