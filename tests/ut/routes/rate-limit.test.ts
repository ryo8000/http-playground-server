import express from 'express';
import request from 'supertest';
import { rateLimitRouter } from '../../../src/routes/rate-limit.js';
import { resetRateLimitWindows } from '../../../src/services/rate-limit.js';

const app = express();
app.use('/rate-limit', rateLimitRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('rateLimitRouter', () => {
  beforeEach(() => {
    resetRateLimitWindows();
  });

  it.each(HTTP_METHODS)(
    'should allow requests up to the limit and then return 429 with Retry-After via %s',
    async (method) => {
      const first = await request(app)[method]('/rate-limit?limit=2&window=10&id=a');
      expect(first.status).toBe(200);
      expect(first.headers['x-ratelimit-limit']).toBe('2');
      expect(first.headers['x-ratelimit-remaining']).toBe('1');
      if (method !== 'head') {
        expect(first.body).toEqual({ message: 'Request 1 of 2 allowed' });
      }

      const second = await request(app)[method]('/rate-limit?limit=2&window=10&id=a');
      expect(second.status).toBe(200);
      expect(second.headers['x-ratelimit-remaining']).toBe('0');

      const third = await request(app)[method]('/rate-limit?limit=2&window=10&id=a');
      expect(third.status).toBe(429);
      expect(third.headers['retry-after']).toBe('10');
      if (method !== 'head') {
        expect(third.body).toEqual({
          error: { message: 'Rate limit exceeded. Retry after 10 second(s).' },
        });
      }
    },
  );

  it.each(HTTP_METHODS)('should return 400 for an invalid limit via %s', async (method) => {
    const response = await request(app)[method]('/rate-limit?limit=0');
    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({
        error: { message: 'Invalid limit. Must be an integer between 1 and 10000.' },
      });
    }
  });
});
