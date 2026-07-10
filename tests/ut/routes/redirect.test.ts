import express from 'express';
import request from 'supertest';
import { redirectRouter } from '../../../src/routes/redirect.js';

const app = express();
app.use('/redirect', redirectRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;
const TEST_URL = 'http://localhost:8000';

describe('redirectRouter', () => {
  it.each(HTTP_METHODS)(
    'should respond with 302 and Location header by default via %s',
    async (method) => {
      const response = await request(app)[method]('/redirect').query({ url: TEST_URL });
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(TEST_URL);
    },
  );

  it.each(HTTP_METHODS)(
    'should respond with specified redirect status and Location header via %s',
    async (method) => {
      const response = await request(app)
        [method]('/redirect')
        .query({ url: TEST_URL, status: '301' });
      expect(response.status).toBe(301);
      expect(response.headers.location).toBe(TEST_URL);
    },
  );

  it.each(HTTP_METHODS)('should return 400 when url is missing via %s', async (method) => {
    const response = await request(app)[method]('/redirect');
    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({ error: { message: 'Missing `url` query parameter' } });
    }
  });
});
