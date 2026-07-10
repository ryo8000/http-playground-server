import express from 'express';
import request from 'supertest';
import { basicAuthRouter } from '../../../src/routes/basic-auth.js';

const app = express();
app.use('/basic-auth', basicAuthRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('basicAuthRouter', () => {
  it.each(HTTP_METHODS)('should return 200 when credentials match via %s', async (method) => {
    const response = await request(app)
      [method]('/basic-auth?user=testuser&password=testpass')
      .auth('testuser', 'testpass');
    expect(response.status).toBe(200);
    if (method !== 'head') {
      expect(response.body).toEqual({ authenticated: true, message: 'Authentication successful' });
    }
  });

  it.each(HTTP_METHODS)(
    'should return 401 with WWW-Authenticate header when auth header is missing via %s',
    async (method) => {
      const response = await request(app)[method]('/basic-auth?user=testuser&password=testpass');
      expect(response.status).toBe(401);
      expect(response.headers['www-authenticate']).toBe('Basic realm="Access to /basic-auth"');
      if (method !== 'head') {
        expect(response.body).toEqual({ authenticated: false, message: 'Authentication required' });
      }
    },
  );

  it.each(HTTP_METHODS)(
    'should return 400 when user parameter is missing via %s',
    async (method) => {
      const response = await request(app)[method]('/basic-auth?password=testpass');
      expect(response.status).toBe(400);
      if (method !== 'head') {
        expect(response.body).toEqual({
          error: { message: 'Missing user or password query parameter' },
        });
      }
    },
  );
});
