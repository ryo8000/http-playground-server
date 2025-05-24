import express from 'express';
import request from 'supertest';
import { errorRouter } from '../../src/routes/error';

const app = express();
app.use('/error', errorRouter);
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ message: err.message });
});

describe('errorRouter', () => {
  const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

  describe.each(httpMethods)('%s method', (method) => {
    it('should return 500 when error is thrown', async () => {
      const response = await request(app)[method]('/error');
      expect(response.status).toBe(500);
      if (method !== 'head') {
        expect(response.body).toEqual({ message: 'Intentional error' });
      }
    });
  });
});
