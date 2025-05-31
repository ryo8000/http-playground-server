import express from 'express';
import request from 'supertest';
import { redirectRouter } from '../../../src/routes/redirect';

describe('redirectRouter', () => {
  const app = express();
  app.use('/redirect', redirectRouter);

  const testUrl = 'http://localhost:8000';

  const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

  describe.each(httpMethods)('%s method', (method) => {
    it('should respond with 302 redirect when no status is provided', async () => {
      const response = await request(app)[method](`/redirect/${encodeURIComponent(testUrl)}`);

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(testUrl);
    });

    it('should respond with specific redirect status when status is valid', async () => {
      const statusCodes = [301, 302, 303, 307, 308];

      for (const status of statusCodes) {
        const response = await request(app)
          [method](`/redirect/${encodeURIComponent(testUrl)}`)
          .query({ status: status.toString() });

        expect(response.status).toBe(status);
        expect(response.headers.location).toBe(testUrl);
      }
    });

    it('should respond with 400 if status is invalid', async () => {
      const response = await request(app)
        [method](`/redirect/${encodeURIComponent(testUrl)}`)
        .query({ status: '300' });

      expect(response.status).toBe(400);
      if (method !== 'head') {
        expect(response.body).toEqual({
          error: {
            message:
              'Invalid redirect status code. Supported statuses are 301, 302, 303, 307 and 308',
          },
        });
      }
    });

    it('should respond with 404 when no url parameter provided', async () => {
      const response = await request(app)[method]('/redirect');

      expect(response.status).toBe(404);
    });
  });
});
