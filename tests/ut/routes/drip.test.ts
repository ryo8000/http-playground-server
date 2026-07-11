import express from 'express';
import request from 'supertest';
import { dripRouter } from '../../../src/routes/drip.js';

const app = express();
app.use('/drip', dripRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('dripRouter', () => {
  it.each(HTTP_METHODS)(
    'should drip the full body over the configured interval via %s',
    async (method) => {
      const response = await request(app)[method]('/drip?size=3&interval=10');
      expect(response.status).toBe(200);
      expect(response.headers['content-length']).toBe('3');
      if (method !== 'head') {
        expect(response.body).toEqual(Buffer.from('aaa'));
      }
    },
  );

  it.each(HTTP_METHODS)('should return 400 for an invalid size via %s', async (method) => {
    const response = await request(app)[method]('/drip?size=1025');
    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({
        error: { message: 'Invalid size. Must be an integer between 1 and 1024.' },
      });
    }
  });

  it.each(HTTP_METHODS)('should return 400 for an invalid interval via %s', async (method) => {
    const response = await request(app)[method]('/drip?interval=0');
    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({
        error: { message: 'Invalid interval. Must be an integer between 1 and 10000.' },
      });
    }
  });
});
