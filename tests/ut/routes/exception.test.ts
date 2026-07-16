import express from 'express';
import request from 'supertest';
import { exceptionRouter } from '../../../src/routes/exception.js';

const app = express();
app.use('/exception', exceptionRouter);
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ error: { message: err.message } });
});

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('exceptionRouter', () => {
  it.each(HTTP_METHODS)(
    'should throw and trigger the error handler with 500 via %s',
    async (method) => {
      const response = await request(app)[method]('/exception');
      expect(response.status).toBe(500);
      if (method !== 'head') {
        expect(response.body).toEqual({ error: { message: 'Intentional error' } });
      }
    },
  );
});
