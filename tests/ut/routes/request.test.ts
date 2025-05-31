import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { requestRouter } from '../../../src/routes/request';

describe('requestRouter', () => {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use('/request', requestRouter);

  const testCookie = 'sessionId=abc123';
  const testHeaders = {
    'content-type': 'application/json',
    cookie: testCookie,
  };
  const testQuery = { param1: 'value1', param2: 'value2' };
  const testBody = { message: 'Hello' };

  const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'options'] as const;

  describe.each(httpMethods)('%s method', (method) => {
    it('should respond', async () => {
      const res = await request(app)
        [method]('/request')
        .set(testHeaders)
        .query(testQuery)
        .send(testBody);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        method: method.toUpperCase(),
        cookies: { sessionId: 'abc123' },
        headers: expect.objectContaining(testHeaders),
        query: testQuery,
      });
      expect(res.body).toHaveProperty('ip');
      expect(res.body).toHaveProperty('httpVersion');
      expect(res.body).toHaveProperty('protocol');
      expect(res.body).toHaveProperty('host');

      if (method === 'get') {
        expect(res.body.body).toEqual({});
      } else {
        expect(res.body.body).toEqual(testBody);
      }
    });
  });
});
