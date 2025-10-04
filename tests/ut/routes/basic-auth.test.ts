import express from 'express';
import request from 'supertest';

describe('basicAuthRouter', () => {
  let app: express.Express;

  const createApp = async (): Promise<express.Express> => {
    const app = express();
    app.use(express.json());

    const { basicAuthRouter } = await import('../../../src/routes/basic-auth.js');
    app.use('/basic-auth', basicAuthRouter);

    return app;
  };

  beforeEach(async () => {
    app = await createApp();
  });

  const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head'] as const;

  describe.each(httpMethods)('%s method', (method) => {
    describe('when credentials match', () => {
      it('should return 200 with authentication success for matching user/password', async () => {
        const response = await request(app)
          [method]('/basic-auth?user=testuser&password=testpass')
          .auth('testuser', 'testpass');

        expect(response.status).toBe(200);
        if (method !== 'head') {
          expect(response.body).toEqual({
            authenticated: true,
            message: 'Authentication successful',
          });
        }
      });

      it('should authenticate when both parameters are the same complex string', async () => {
        const credentials = 'complex-P@ssw0rd!123';
        const response = await request(app)
          [method](
            `/basic-auth?user=${encodeURIComponent(credentials)}&password=${encodeURIComponent(credentials)}`,
          )
          .auth(credentials, credentials);

        expect(response.status).toBe(200);
        if (method !== 'head') {
          expect(response.body).toEqual({
            authenticated: true,
            message: 'Authentication successful',
          });
        }
      });

      it('should authenticate with special characters', async () => {
        const credentials = 'test@example.com';
        const response = await request(app)
          [method](
            `/basic-auth?user=${encodeURIComponent(credentials)}&password=${encodeURIComponent(credentials)}`,
          )
          .auth(credentials, credentials);

        expect(response.status).toBe(200);
        if (method !== 'head') {
          expect(response.body).toEqual({
            authenticated: true,
            message: 'Authentication successful',
          });
        }
      });
    });

    describe('when credentials do not match', () => {
      it('should return 401 when user and password are different', async () => {
        const response = await request(app)
          [method]('/basic-auth?user=expecteduser&password=expectedpass')
          .auth('provideduser', 'providedpass');

        expect(response.status).toBe(401);
        if (method !== 'head') {
          expect(response.body).toEqual({
            authenticated: false,
            message: 'Authentication failed',
          });
        }
      });

      it('should return 401 for case-sensitive mismatch', async () => {
        const response = await request(app)
          [method]('/basic-auth?user=TestUser&password=TestPass')
          .auth('testuser', 'testpass');

        expect(response.status).toBe(401);
        if (method !== 'head') {
          expect(response.body).toEqual({
            authenticated: false,
            message: 'Authentication failed',
          });
        }
      });
    });

    describe('when credentials are missing or invalid', () => {
      it('should return 400 when user parameter is missing', async () => {
        const response = await request(app)[method]('/basic-auth?password=testpass');

        expect(response.status).toBe(400);
        if (method !== 'head') {
          expect(response.body).toEqual({
            error: {
              message: 'Missing user or password query parameter',
            },
          });
        }
      });

      it('should return 400 when password parameter is missing', async () => {
        const response = await request(app)[method]('/basic-auth?user=testuser');

        expect(response.status).toBe(400);
        if (method !== 'head') {
          expect(response.body).toEqual({
            error: {
              message: 'Missing user or password query parameter',
            },
          });
        }
      });

      it('should return 400 when both parameters are missing', async () => {
        const response = await request(app)[method]('/basic-auth');

        expect(response.status).toBe(400);
        if (method !== 'head') {
          expect(response.body).toEqual({
            error: {
              message: 'Missing user or password query parameter',
            },
          });
        }
      });

      it('should return 400 when user parameter is empty', async () => {
        const response = await request(app)[method]('/basic-auth?user=&password=testpass');

        expect(response.status).toBe(400);
        if (method !== 'head') {
          expect(response.body).toEqual({
            error: {
              message: 'Missing user or password query parameter',
            },
          });
        }
      });

      it('should return 400 when password parameter is empty', async () => {
        const response = await request(app)[method]('/basic-auth?user=testuser&password=');

        expect(response.status).toBe(400);
        if (method !== 'head') {
          expect(response.body).toEqual({
            error: {
              message: 'Missing user or password query parameter',
            },
          });
        }
      });

      it('should return 400 when user parameter is only whitespace', async () => {
        const response = await request(app)[method]('/basic-auth?user=%20%20&password=testpass');

        expect(response.status).toBe(400);
        if (method !== 'head') {
          expect(response.body).toEqual({
            error: {
              message: 'Missing user or password query parameter',
            },
          });
        }
      });

      it('should return 400 when password parameter is only whitespace', async () => {
        const response = await request(app)[method]('/basic-auth?user=testuser&password=%20%20');

        expect(response.status).toBe(400);
        if (method !== 'head') {
          expect(response.body).toEqual({
            error: {
              message: 'Missing user or password query parameter',
            },
          });
        }
      });

      it('should return 401 when Authorization header is missing', async () => {
        const response = await request(app)[method]('/basic-auth?user=testuser&password=testpass');

        expect(response.status).toBe(401);
        expect(response.headers['www-authenticate']).toBe('Basic realm="Access to /basic-auth"');
        if (method !== 'head') {
          expect(response.body).toEqual({
            authenticated: false,
            message: 'Authentication required',
          });
        }
      });

      it('should return 401 when Authorization header is malformed', async () => {
        const response = await request(app)
          [method]('/basic-auth?user=testuser&password=testpass')
          .set('Authorization', 'Bearer token123');

        expect(response.status).toBe(401);
        expect(response.headers['www-authenticate']).toBe('Basic realm="Access to /basic-auth"');
        if (method !== 'head') {
          expect(response.body).toEqual({
            authenticated: false,
            message: 'Authentication required',
          });
        }
      });
    });

    describe('edge cases', () => {
      it('should handle numeric credentials when they match', async () => {
        const response = await request(app)
          [method]('/basic-auth?user=12345&password=67890')
          .auth('12345', '67890');

        expect(response.status).toBe(200);
        if (method !== 'head') {
          expect(response.body).toEqual({
            authenticated: true,
            message: 'Authentication successful',
          });
        }
      });

      it('should handle single character credentials', async () => {
        const response = await request(app)[method]('/basic-auth?user=a&password=a').auth('a', 'a');

        expect(response.status).toBe(200);
        if (method !== 'head') {
          expect(response.body).toEqual({
            authenticated: true,
            message: 'Authentication successful',
          });
        }
      });

      it('should handle unicode characters', async () => {
        const credentials = '测试用户';
        const encoded = encodeURIComponent(credentials);
        const response = await request(app)
          [method](`/basic-auth?user=${encoded}&password=${encoded}`)
          .auth(credentials, credentials);

        expect(response.status).toBe(200);
        if (method !== 'head') {
          expect(response.body).toEqual({
            authenticated: true,
            message: 'Authentication successful',
          });
        }
      });

      it('should handle passwords containing colons', async () => {
        const user = 'testuser';
        const passwordWithColons = 'pass:word:with:colons';
        const response = await request(app)
          [method](`/basic-auth?user=${user}&password=${encodeURIComponent(passwordWithColons)}`)
          .auth(user, passwordWithColons);

        expect(response.status).toBe(200);
        if (method !== 'head') {
          expect(response.body).toEqual({
            authenticated: true,
            message: 'Authentication successful',
          });
        }
      });
    });
  });

  describe('URL encoding', () => {
    it('should handle URL encoded special characters in credentials', async () => {
      const user = 'user+with spaces@domain.com';
      const password = 'user+with spaces@domain.com';
      const response = await request(app)
        .get(
          `/basic-auth?user=${encodeURIComponent(user)}&password=${encodeURIComponent(password)}`,
        )
        .auth(user, password);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        authenticated: true,
        message: 'Authentication successful',
      });
    });

    it('should fail authentication when encoding differs', async () => {
      const response = await request(app)
        .get('/basic-auth?user=test%2Buser&password=test+pass')
        .auth('test%2Buser', 'test+pass');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        authenticated: false,
        message: 'Authentication failed',
      });
    });
  });

  describe('with request body (POST method)', () => {
    it('should authenticate successfully with POST and body data', async () => {
      const response = await request(app)
        .post('/basic-auth?user=testuser&password=testpass')
        .auth('testuser', 'testpass')
        .send({ someData: 'ignored' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        authenticated: true,
        message: 'Authentication successful',
      });
    });
  });

  describe('query parameter handling', () => {
    it('should properly handle additional parameters without affecting authentication', async () => {
      const response = await request(app)
        .get('/basic-auth?user=test&password=test&additionalParam=value&anotherParam=123')
        .auth('test', 'test');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        authenticated: true,
        message: 'Authentication successful',
      });
    });
  });
});
