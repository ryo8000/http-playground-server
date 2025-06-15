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

    it('should return 400 and corresponding message for out-of-range status code', async () => {
      const response1 = await request(app)[method]('/status/199');
      expect(response1.status).toBe(400);
      if (method !== 'head') {
        expect(response1.body).toEqual({
          error: {
            message: 'Invalid status',
          },
        });
      }
      const response2 = await request(app)[method]('/status/600');
      expect(response2.status).toBe(400);
      if (method !== 'head') {
        expect(response2.body).toEqual({
          error: {
            message: 'Invalid status',
          },
        });
      }
    });

    it('should return 400 and corresponding message for non-numeric status code', async () => {
      const response = await request(app)[method]('/status/2e1');
      expect(response.status).toBe(400);
      if (method !== 'head') {
        expect(response.body).toEqual({
          error: {
            message: 'Invalid status',
          },
        });
      }
    });
  });
});
