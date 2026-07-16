import express from 'express';
import request from 'supertest';
import { gzipRouter } from '../../../src/routes/gzip.js';

const app = express();
app.use('/gzip', gzipRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('gzipRouter', () => {
  it.each(HTTP_METHODS)('should return a gzip-compressed JSON body via %s', async (method) => {
    const response = await request(app)[method]('/gzip');

    expect(response.status).toBe(200);
    expect(response.headers['content-encoding']).toBe('gzip');
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
    if (method !== 'head') {
      expect(response.body).toEqual({
        gzipped: true,
        message: 'This body is gzip-compressed',
      });
    }
  });
});
