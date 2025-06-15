import express from 'express';
import request from 'supertest';
import { mirrorRouter } from '../../../src/routes/mirror.js';

const app = express();
app.use(express.json());
app.use('/mirror', mirrorRouter);

describe('mirrorRouter', () => {
  const testBody = { message: 'Hello' };

  const httpMethods = ['post', 'put', 'delete', 'patch', 'options'] as const;

  describe.each(httpMethods)('%s method', (method) => {
    it('should return the request body as a response', async () => {
      const response = await request(app)[method]('/mirror').send(testBody);
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body).toEqual(testBody);
    });

    it('should return an empty body', async () => {
      const response = await request(app)[method]('/mirror');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });
  });

  describe('get method', () => {
    it('should return an empty body', async () => {
      const response = await request(app).get('/mirror');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });
  });
});
