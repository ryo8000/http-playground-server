import express from 'express';
import request from 'supertest';
import { redirectLoopRouter } from '../../../src/routes/redirect-loop.js';

const app = express();
app.use('/redirect-loop', redirectLoopRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('redirectLoopRouter', () => {
  it.each(HTTP_METHODS)('should redirect to itself via %s', async (method) => {
    const response = await request(app)[method]('/redirect-loop').redirects(0);
    expect(response.status).toBe(302);
    expect(response.headers['location']).toBe('/redirect-loop');
  });
});
