import express from 'express';
import request from 'supertest';
import { keepAliveCutRouter } from '../../../src/routes/keep-alive-cut.js';

const app = express();
app.use('/keep-alive-cut', keepAliveCutRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('keepAliveCutRouter', () => {
  // The reset fires after the response completes, so this only asserts the normal 200;
  // the reset itself is observable only over a reused connection (manual/curl verification).
  it.each(HTTP_METHODS)(
    'should respond normally while promising a persistent connection via %s',
    async (method) => {
      const response = await request(app)[method]('/keep-alive-cut');
      expect(response.status).toBe(200);
      expect(response.headers['connection']).toBe('keep-alive');
      if (method !== 'head') {
        expect(response.body).toEqual({ message: 'Connection will be reset after this response' });
      }
    },
  );
});
