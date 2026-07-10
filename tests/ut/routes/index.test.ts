import express from 'express';
import request from 'supertest';
import { indexRouter } from '../../../src/routes/index.js';

const app = express();
app.use('/', indexRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('indexRouter', () => {
  it.each(HTTP_METHODS)('should respond with status 200 via %s', async (method) => {
    const response = await request(app)[method]('/');
    expect(response.status).toBe(200);
  });
});
