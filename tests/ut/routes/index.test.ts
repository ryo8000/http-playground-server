import express from 'express';
import request from 'supertest';
import { indexRouter } from '../../../src/routes/index.js';

const app = express();
app.use('/', indexRouter);

describe('indexRouter', () => {
  const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

  describe.each(httpMethods)('%s method', (method) => {
    it('should respond with status 200', async () => {
      const response = await request(app)[method]('/');

      expect(response.status).toBe(200);
      expect(response.text).toBe('OK');
    });
  });
});
