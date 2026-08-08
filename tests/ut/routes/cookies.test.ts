import express from 'express';
import request from 'supertest';
import { cookiesRouter } from '../../../src/routes/cookies.js';

const app = express();
app.use('/cookies', cookiesRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('cookiesRouter', () => {
  it.each(HTTP_METHODS)(
    'should return the cookies sent with the request via %s',
    async (method) => {
      const response = await request(app)[method]('/cookies').set('Cookie', 'a=1; b=2');

      expect(response.status).toBe(200);
      if (method !== 'head') {
        expect(response.body).toEqual({ cookies: { a: '1', b: '2' } });
      }
    },
  );

  it.each(HTTP_METHODS)(
    'should return an empty object when no cookies are sent via %s',
    async (method) => {
      const response = await request(app)[method]('/cookies');

      expect(response.status).toBe(200);
      if (method !== 'head') {
        expect(response.body).toEqual({ cookies: {} });
      }
    },
  );

  it.each(HTTP_METHODS)(
    'should return a __proto__ cookie and a j:-prefixed value unchanged via %s',
    async (method) => {
      const response = await request(app)
        [method]('/cookies')
        .set('Cookie', '__proto__=abc; a=j%3A%7B%22x%22%3A1%7D');

      expect(response.status).toBe(200);
      if (method !== 'head') {
        expect(response.body).toEqual({ cookies: { ['__proto__']: 'abc', a: 'j:{"x":1}' } });
      }
    },
  );

  it.each(HTTP_METHODS)('should set cookies from query parameters via %s', async (method) => {
    const response = await request(app)[method]('/cookies/set?flavor=chocolate&session=abc123');

    expect(response.status).toBe(200);
    expect(response.headers['set-cookie']).toEqual([
      expect.stringContaining('flavor=chocolate'),
      expect.stringContaining('session=abc123'),
    ]);
    if (method !== 'head') {
      expect(response.body).toEqual({ cookies: { flavor: 'chocolate', session: 'abc123' } });
    }
  });

  it.each(HTTP_METHODS)('should set a cookie named __proto__ via %s', async (method) => {
    const response = await request(app)[method]('/cookies/set?__proto__=abc');

    expect(response.status).toBe(200);
    expect(response.headers['set-cookie']).toEqual([expect.stringContaining('__proto__=abc')]);
    if (method !== 'head') {
      expect(response.body).toEqual({ cookies: { ['__proto__']: 'abc' } });
    }
  });

  it.each(HTTP_METHODS)(
    'should expire the cookies named by query parameters via %s',
    async (method) => {
      const response = await request(app)[method]('/cookies/delete?flavor=&session=');

      expect(response.status).toBe(200);
      expect(response.headers['set-cookie']).toEqual([
        expect.stringContaining('flavor=;'),
        expect.stringContaining('session=;'),
      ]);
      expect(response.headers['set-cookie']?.[0]).toContain('Expires=');
      if (method !== 'head') {
        expect(response.body).toEqual({ deleted: ['flavor', 'session'] });
      }
    },
  );

  it.each(HTTP_METHODS)(
    'should return 400 for a repeated parameter on /cookies/set via %s',
    async (method) => {
      const response = await request(app)[method]('/cookies/set?flavor=chocolate&flavor=vanilla');

      expect(response.status).toBe(400);
      if (method !== 'head') {
        expect(response.body).toEqual({
          error: {
            message: "Invalid value for cookie 'flavor'. Must be a single string.",
          },
        });
      }
    },
  );

  it.each(HTTP_METHODS)(
    'should return 400 for an invalid cookie name on /cookies/delete via %s',
    async (method) => {
      const response = await request(app)[method]('/cookies/delete?bad%20name=');

      expect(response.status).toBe(400);
      expect(response.headers['set-cookie']).toBeUndefined();
      if (method !== 'head') {
        expect(response.body).toEqual({
          error: { message: "Invalid cookie name 'bad name'." },
        });
      }
    },
  );
});
