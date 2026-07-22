import express from 'express';
import request from 'supertest';
import { bearerAuthRouter } from '../../../src/routes/bearer-auth.js';

const app = express();
app.use('/bearer-auth', bearerAuthRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('bearerAuthRouter', () => {
  it.each(HTTP_METHODS)('should return 200 when the token matches via %s', async (method) => {
    const response = await request(app)
      [method]('/bearer-auth?token=secret-token')
      .set('Authorization', 'Bearer secret-token');

    expect(response.status).toBe(200);
    if (method !== 'head') {
      expect(response.body).toEqual({
        authenticated: true,
        message: 'Authentication successful',
      });
    }
  });

  it.each(HTTP_METHODS)(
    'should return 401 when the Authorization header is missing via %s',
    async (method) => {
      const response = await request(app)[method]('/bearer-auth?token=secret-token');

      expect(response.status).toBe(401);
      expect(response.headers['www-authenticate']).toBe('Bearer realm="Access to /bearer-auth"');
      if (method !== 'head') {
        expect(response.body).toEqual({
          authenticated: false,
          message: 'Authentication required',
        });
      }
    },
  );

  it.each(HTTP_METHODS)(
    'should return 401 when the token does not match via %s',
    async (method) => {
      const response = await request(app)
        [method]('/bearer-auth?token=secret-token')
        .set('Authorization', 'Bearer wrong-token');

      expect(response.status).toBe(401);
      expect(response.headers['www-authenticate']).toBe('Bearer realm="Access to /bearer-auth"');
      if (method !== 'head') {
        expect(response.body).toEqual({
          authenticated: false,
          message: 'Authentication failed',
        });
      }
    },
  );

  it.each(HTTP_METHODS)(
    'should return 400 when the token parameter is missing via %s',
    async (method) => {
      const response = await request(app)[method]('/bearer-auth');

      expect(response.status).toBe(400);
      if (method !== 'head') {
        expect(response.body).toEqual({
          error: { message: 'Missing token query parameter' },
        });
      }
    },
  );
});
