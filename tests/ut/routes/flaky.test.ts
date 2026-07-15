import express from 'express';
import request from 'supertest';
import { flakyRouter } from '../../../src/routes/flaky.js';

const app = express();
app.use('/flaky', flakyRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('flakyRouter', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each(HTTP_METHODS)(
    'should return 200 when the roll is at or above the rate via %s',
    async (method) => {
      jest.spyOn(Math, 'random').mockReturnValue(0.9);
      const response = await request(app)[method]('/flaky?rate=0.5');
      expect(response.status).toBe(200);
      if (method !== 'head') {
        expect(response.body).toEqual({ message: 'Succeeded (rate=0.5)' });
      }
    },
  );

  it.each(HTTP_METHODS)(
    'should return 500 when the roll is below the rate via %s',
    async (method) => {
      jest.spyOn(Math, 'random').mockReturnValue(0.1);
      const response = await request(app)[method]('/flaky?rate=0.5');
      expect(response.status).toBe(500);
      if (method !== 'head') {
        expect(response.body).toEqual({ error: { message: 'Simulated failure (rate=0.5)' } });
      }
    },
  );

  it.each(HTTP_METHODS)('should return 400 for an invalid rate via %s', async (method) => {
    const response = await request(app)[method]('/flaky?rate=2');
    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({
        error: { message: 'Invalid rate. Must be a number between 0 and 1.' },
      });
    }
  });
});
