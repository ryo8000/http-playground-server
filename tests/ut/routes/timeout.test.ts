import express from 'express';
import request from 'supertest';
import { timeoutRouter } from '../../../src/routes/timeout.js';

const app = express();
app.use('/timeout', timeoutRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('timeoutRouter', () => {
  // Timeout is hard to test precisely, so we do minimal verification
  it.each(HTTP_METHODS)('should time out by never sending a response via %s', async (method) => {
    const response = await request(app)
      [method]('/timeout')
      .timeout({ deadline: 1000 })
      .catch((err) => err);
    expect(response.timeout).toBeTruthy();
  });
});
