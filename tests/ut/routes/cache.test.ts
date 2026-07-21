import express from 'express';
import request from 'supertest';
import { cacheRouter } from '../../../src/routes/cache.js';

const app = express();
app.use('/cache', cacheRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('cacheRouter', () => {
  it.each(HTTP_METHODS)(
    'should return cache headers when no conditional headers are present via %s',
    async (method) => {
      const response = await request(app)[method]('/cache');

      expect(response.status).toBe(200);
      expect(response.headers['etag']).toBe('"http-playground"');
      expect(response.headers['last-modified']).toBeDefined();
      if (method !== 'head') {
        expect(response.body).toEqual({
          etag: '"http-playground"',
          lastModified: response.headers['last-modified'],
        });
      }
    },
  );

  it.each(HTTP_METHODS)('should use the etag query parameter via %s', async (method) => {
    const response = await request(app)[method]('/cache?etag=my-tag');

    expect(response.status).toBe(200);
    expect(response.headers['etag']).toBe('"my-tag"');
  });

  it.each(HTTP_METHODS)(
    'should return 304 when If-None-Match is present via %s',
    async (method) => {
      const response = await request(app)
        [method]('/cache')
        .set('If-None-Match', '"http-playground"');

      expect(response.status).toBe(304);
      expect(response.text ?? '').toBe('');
    },
  );

  it.each(HTTP_METHODS)(
    'should return 304 when If-Modified-Since is present via %s',
    async (method) => {
      const response = await request(app)
        [method]('/cache')
        .set('If-Modified-Since', 'Fri, 02 Jan 2026 03:04:05 GMT');

      expect(response.status).toBe(304);
    },
  );

  it.each(HTTP_METHODS)('should return 400 for an invalid etag via %s', async (method) => {
    const response = await request(app)[method]('/cache?etag=');

    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({
        error: {
          message:
            'Invalid etag. Must be a non-empty printable ASCII string without spaces or double quotes.',
        },
      });
    }
  });

  it.each(HTTP_METHODS)(
    'should return a Cache-Control header for /cache/{seconds} via %s',
    async (method) => {
      const response = await request(app)[method]('/cache/60');

      expect(response.status).toBe(200);
      expect(response.headers['cache-control']).toBe('public, max-age=60');
      if (method !== 'head') {
        expect(response.body).toEqual({ cacheControl: 'public, max-age=60' });
      }
    },
  );

  it.each(HTTP_METHODS)('should return 400 for invalid seconds via %s', async (method) => {
    const response = await request(app)[method]('/cache/abc');

    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({
        error: {
          message: 'Invalid seconds. Must be an integer between 0 and 31536000.',
        },
      });
    }
  });
});
