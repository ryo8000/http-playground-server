import express from 'express';
import request from 'supertest';
import { uuidRouter } from '../../../src/routes/uuid.js';

const app = express();
app.use('/uuid', uuidRouter);

describe('uuidRouter', () => {
  const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;
  // UUID v4 format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  describe.each(httpMethods)('%s method', (method) => {
    it('should return a valid UUID', async () => {
      const response = await request(app)[method]('/uuid');

      expect(response.status).toBe(200);

      if (method !== 'head') {
        expect(response.body).toHaveProperty('uuid');
        expect(typeof response.body.uuid).toBe('string');
        expect(response.body.uuid).toMatch(uuidRegex);
      }
    });

    it('should return different UUIDs on multiple requests', async () => {
      const response1 = await request(app)[method]('/uuid');
      const response2 = await request(app)[method]('/uuid');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      if (method !== 'head') {
        expect(response1.body.uuid).not.toBe(response2.body.uuid);
      }
    });
  });
});
