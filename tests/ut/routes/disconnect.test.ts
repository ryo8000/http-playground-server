import express from 'express';
import request from 'supertest';
import { disconnectRouter } from '../../../src/routes/disconnect.js';

const app = express();
app.use('/disconnect', disconnectRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('disconnectRouter', () => {
  // Network disconnection and timeout are difficult to test in unit tests, so we do minimal verification
  it.each(HTTP_METHODS)('should close the connection without a response via %s', async (method) => {
    await expect(request(app)[method]('/disconnect')).rejects.toMatchObject({
      code: 'ECONNRESET',
    });
  });
});
