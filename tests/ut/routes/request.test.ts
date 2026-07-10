import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { requestRouter } from '../../../src/routes/request.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/request', requestRouter);

const BODY_METHODS = ['post', 'put', 'delete', 'patch', 'options'] as const;

describe('requestRouter', () => {
  const testCookie = 'sessionId=abc123';
  const testHeaders = {
    'content-type': 'application/json',
    cookie: testCookie,
  };
  const testQuery = { param1: 'value1', param2: 'value2' };
  const testBody = { message: 'Hello' };

  it.each(BODY_METHODS)('should respond with request info via %s', async (method) => {
    const res = await request(app)
      [method]('/request')
      .set(testHeaders)
      .query(testQuery)
      .send(testBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      method: method.toUpperCase(),
      cookies: { sessionId: 'abc123' },
      headers: expect.objectContaining(testHeaders),
      query: testQuery,
      body: testBody,
      ip: expect.any(String),
      httpVersion: expect.any(String),
      protocol: expect.any(String),
      host: expect.any(String),
    });
  });

  it('should respond with empty body field when no body is sent', async () => {
    const res = await request(app).post('/request');
    expect(res.status).toBe(200);
    expect(res.body.body).toEqual({});
  });

  it('should respond without request body for get', async () => {
    const res = await request(app).get('/request').set(testHeaders).query(testQuery);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      method: 'GET',
      cookies: { sessionId: 'abc123' },
      headers: expect.objectContaining(testHeaders),
      query: testQuery,
      body: {},
      ip: expect.any(String),
      httpVersion: expect.any(String),
      protocol: expect.any(String),
      host: expect.any(String),
    });
  });

  it('should return 200 for head', async () => {
    const res = await request(app).head('/request');
    expect(res.status).toBe(200);
  });
});
