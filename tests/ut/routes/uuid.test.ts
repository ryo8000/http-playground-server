import request from 'supertest';
import { app } from '../../../src/app.js';

describe('uuidRouter', () => {
  describe('GET method', () => {
    it('should return a valid UUID', async () => {
      const response = await request(app).get('/uuid');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('uuid');
      expect(typeof response.body.uuid).toBe('string');

      // UUID v4 format validation
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(response.body.uuid).toMatch(uuidRegex);
    });

    it('should return different UUIDs on multiple requests', async () => {
      const response1 = await request(app).get('/uuid');
      const response2 = await request(app).get('/uuid');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.uuid).not.toBe(response2.body.uuid);
    });
  });
});
