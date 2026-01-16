import express from 'express';
import request from 'supertest';
import { statusRouter } from '../../../src/routes/status.js';

const app = express();
app.use('/status', statusRouter);

describe('statusRouter', () => {
  const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

  describe.each(httpMethods)('%s method', (method) => {
    it('should return the corresponding code and message for valid status code', async () => {
      const response = await request(app)[method]('/status/200');
      expect(response.status).toBe(200);
    });

    it('should return the corresponding code and unknown message for valid non-standard status code', async () => {
      const response = await request(app)[method]('/status/599');
      expect(response.status).toBe(599);
    });

    it.each(['199', '600', '2e1', 'abc', '1.2'])(
      'should return 400 for invalid status code %s',
      async (statusCode) => {
        const response = await request(app)[method](`/status/${statusCode}`);
        expect(response.status).toBe(400);
        if (method !== 'head') {
          expect(response.body).toEqual({
            error: {
              message: 'Invalid status',
            },
          });
        }
      },
    );
  });
});
