import express from 'express';
import request from 'supertest';
import { dateRouter } from '../../../src/routes/date.js';

const app = express();
app.use('/date', dateRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('dateRouter', () => {
  it.each(HTTP_METHODS)('should respond with the given Date header via %s', async (method) => {
    const response = await request(app)
      [method]('/date')
      .query({ value: 'Wed, 21 Oct 2015 07:28:00 GMT' });
    expect(response.status).toBe(200);
    expect(response.headers['date']).toBe('Wed, 21 Oct 2015 07:28:00 GMT');
    if (method !== 'head') {
      expect(response.body).toEqual({ date: 'Wed, 21 Oct 2015 07:28:00 GMT' });
    }
  });

  it.each(HTTP_METHODS)('should return 400 when value is missing via %s', async (method) => {
    const response = await request(app)[method]('/date');
    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({
        error: { message: 'Missing `value` query parameter' },
      });
    }
  });

  it.each(HTTP_METHODS)(
    'should return 400 for a value containing control characters via %s',
    async (method) => {
      const response = await request(app)[method]('/date?value=a%0d%0ab');
      expect(response.status).toBe(400);
      if (method !== 'head') {
        expect(response.body).toEqual({
          error: {
            message: 'Invalid value. Must be a single non-empty string without control characters.',
          },
        });
      }
    },
  );
});
