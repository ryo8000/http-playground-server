import express from 'express';
import request from 'supertest';
import { statusRouter } from '../../../src/routes/status.js';

const app = express();
app.use('/status', statusRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('statusRouter', () => {
  it.each(HTTP_METHODS)('should respond with the specified status code via %s', async (method) => {
    const response = await request(app)[method]('/status/200');
    expect(response.status).toBe(200);
  });

  it.each(HTTP_METHODS)('should return 400 for an invalid input via %s', async (method) => {
    const response = await request(app)[method]('/status/abc');
    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({
        error: { message: 'Invalid status code. Must be an integer between 200 and 599.' },
      });
    }
  });
});
