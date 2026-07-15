import express from 'express';
import request from 'supertest';
import { truncateRouter } from '../../../src/routes/truncate.js';

const app = express();
app.use('/truncate', truncateRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('truncateRouter', () => {
  // The truncated body cannot be observed with supertest, so we verify the connection error.
  // HEAD responses have no body, so the client sees a complete response instead of an error.
  it.each(HTTP_METHODS)(
    'should cut the connection before the declared Content-Length is reached via %s',
    async (method) => {
      const response = await request(app)
        [method]('/truncate?size=100&send=10')
        .catch((err) => err);
      if (method === 'head') {
        expect(response.status).toBe(200);
      } else {
        expect(response.message).toMatch(/aborted|socket hang up|ECONNRESET/);
      }
    },
  );

  it.each(HTTP_METHODS)(
    'should cut the connection mid-stream for chunked transfer via %s',
    async (method) => {
      const response = await request(app)
        [method]('/truncate?size=100&send=10&chunked=true')
        .catch((err) => err);
      if (method === 'head') {
        expect(response.status).toBe(200);
      } else {
        expect(response.message).toMatch(/aborted|socket hang up|ECONNRESET/);
      }
    },
  );

  it.each(HTTP_METHODS)('should return 400 for an invalid size via %s', async (method) => {
    const response = await request(app)[method]('/truncate?size=0');
    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({
        error: { message: 'Invalid size. Must be an integer between 1 and 1048576.' },
      });
    }
  });

  it.each(HTTP_METHODS)('should return 400 for an invalid send via %s', async (method) => {
    const response = await request(app)[method]('/truncate?size=100&send=100');
    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({
        error: { message: 'Invalid send. Must be an integer between 0 and size - 1.' },
      });
    }
  });
});
