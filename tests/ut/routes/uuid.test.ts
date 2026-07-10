import express from 'express';
import request from 'supertest';
import { uuidRouter } from '../../../src/routes/uuid.js';

const app = express();
app.use('/uuid', uuidRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('uuidRouter', () => {
  it.each(HTTP_METHODS)('should return a valid UUID via %s', async (method) => {
    const response = await request(app)[method]('/uuid');
    expect(response.status).toBe(200);
    if (method !== 'head') {
      expect(response.body).toEqual({ uuid: expect.stringMatching(UUID_REGEX) });
    }
  });

  it('should return different UUIDs on multiple requests', async () => {
    const response1 = await request(app).get('/uuid');
    const response2 = await request(app).get('/uuid');
    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    expect(response1.body.uuid).not.toBe(response2.body.uuid);
  });
});
