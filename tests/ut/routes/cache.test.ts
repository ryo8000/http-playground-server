import express from 'express';
import request from 'supertest';
import { cacheRouter } from '../../../src/routes/cache.js';

const app = express();
app.use('/cache', cacheRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;
// Conditional revalidation (Express's req.fresh) only applies to GET/HEAD
const CONDITIONAL_METHODS = ['get', 'head'] as const;
const UNSAFE_METHODS = ['post', 'put', 'delete', 'patch'] as const;

describe('cacheRouter', () => {
  it.each(HTTP_METHODS)(
    'should return cache headers when no conditional headers are present via %s',
    async (method) => {
      const response = await request(app)[method]('/cache');

      expect(response.status).toBe(200);
      expect(response.headers['etag']).toBe('"http-playground"');
      expect(response.headers['last-modified']).toBeDefined();
      expect(response.headers['cache-control']).toBe('no-cache');
      if (method !== 'head') {
        expect(response.body).toEqual({
          etag: 'http-playground',
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

  it.each(CONDITIONAL_METHODS)(
    'should return 304 when If-None-Match matches via %s',
    async (method) => {
      const response = await request(app)
        [method]('/cache')
        .set('If-None-Match', '"http-playground"');

      expect(response.status).toBe(304);
      expect(response.text ?? '').toBe('');
    },
  );

  it('should return 304 when the echoed etag is replayed as If-None-Match', async () => {
    const { body } = await request(app).get('/cache?etag=my-tag');
    const response = await request(app)
      .get('/cache?etag=my-tag')
      .set('If-None-Match', `"${body.etag}"`);

    expect(response.status).toBe(304);
  });

  it('should return 304 for a weak If-None-Match', async () => {
    const response = await request(app).get('/cache').set('If-None-Match', 'W/"http-playground"');

    expect(response.status).toBe(304);
  });

  it('should return 304 for a list-form If-None-Match containing the ETag', async () => {
    const response = await request(app)
      .get('/cache')
      .set('If-None-Match', '"x", "http-playground"');

    expect(response.status).toBe(304);
  });

  it.each(CONDITIONAL_METHODS)(
    'should return 304 when the resource is not modified since If-Modified-Since via %s',
    async (method) => {
      const response = await request(app)
        [method]('/cache')
        .set('If-Modified-Since', 'Fri, 02 Jan 2026 03:04:05 GMT');

      expect(response.status).toBe(304);
    },
  );

  it.each(HTTP_METHODS)(
    'should return 200 with a body when If-None-Match does not match via %s',
    async (method) => {
      const response = await request(app)[method]('/cache').set('If-None-Match', '"stale"');

      expect(response.status).toBe(200);
      expect(response.headers['etag']).toBe('"http-playground"');
      if (method !== 'head') {
        expect(response.body).toEqual({
          etag: 'http-playground',
          lastModified: response.headers['last-modified'],
        });
      }
    },
  );

  it.each(UNSAFE_METHODS)(
    'should return 200 (not 304) for a matching If-None-Match on the unsafe method %s',
    async (method) => {
      const response = await request(app)
        [method]('/cache')
        .set('If-None-Match', '"http-playground"');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        etag: 'http-playground',
        lastModified: response.headers['last-modified'],
      });
    },
  );

  it.each(HTTP_METHODS)('should return 400 for an invalid etag via %s', async (method) => {
    const response = await request(app)[method]('/cache?etag=');

    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({
        error: {
          message:
            'Invalid etag. Must be a printable ASCII string of 1 to 128 characters without spaces, double quotes, commas, or backslashes.',
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
