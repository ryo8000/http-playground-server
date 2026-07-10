import express from 'express';
import request from 'supertest';
import { resetRouter } from '../../../src/routes/reset.js';

const app = express();
app.use('/reset', resetRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('resetRouter', () => {
  it.each(HTTP_METHODS)('should reset the connection without a response via %s', async (method) => {
    const response = await request(app)
      [method]('/reset')
      .catch((err) => err);
    expect(response.message).toMatch(/socket hang up|ECONNRESET/);
  });
});
