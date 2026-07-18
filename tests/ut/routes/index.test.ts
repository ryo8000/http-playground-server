import express from 'express';
import request from 'supertest';
import { indexRouter } from '../../../src/routes/index.js';

const app = express();
app.use('/', indexRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('indexRouter', () => {
  it.each(HTTP_METHODS)('should respond with the endpoint list via %s', async (method) => {
    const response = await request(app)[method]('/');

    expect(response.status).toBe(200);
    if (method !== 'head') {
      expect(response.body.name).toBe('http-playground-server');
      expect(response.body.endpoints).toEqual(
        expect.arrayContaining([
          { path: '/', description: 'Returns this list of available endpoints.' },
          { path: '/uuid', description: 'Generates and returns a random UUID (version 4).' },
        ]),
      );
      for (const endpoint of response.body.endpoints) {
        expect(endpoint).toEqual({ path: expect.any(String), description: expect.any(String) });
      }
    }
  });
});
