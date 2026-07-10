import express from 'express';
import request from 'supertest';
import { mirrorRouter } from '../../../src/routes/mirror.js';

const app = express();
app.use(express.json());
app.use('/mirror', mirrorRouter);

const BODY_METHODS = ['post', 'put', 'delete', 'patch', 'options'] as const;

describe('mirrorRouter', () => {
  const testBody = { message: 'Hello' };

  it.each(BODY_METHODS)('should return request body via %s', async (method) => {
    const response = await request(app)[method]('/mirror').send(testBody);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(testBody);
  });

  it('should return empty object when no body is sent', async () => {
    const response = await request(app).post('/mirror');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({});
  });

  it('should return empty object for get', async () => {
    const response = await request(app).get('/mirror');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({});
  });

  it('should return 200 for head', async () => {
    const response = await request(app).head('/mirror');
    expect(response.status).toBe(200);
  });
});
