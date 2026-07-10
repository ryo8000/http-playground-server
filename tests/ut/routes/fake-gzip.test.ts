import express from 'express';
import request from 'supertest';
import { fakeGzipRouter } from '../../../src/routes/fake-gzip.js';

const app = express();
app.use('/fake-gzip', fakeGzipRouter);

describe('fakeGzipRouter', () => {
  const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

  describe.each(HTTP_METHODS)('%s method', (method) => {
    // The client attempts to gunzip the plain body and fails; HEAD has no body to decompress
    it('should declare gzip encoding with an uncompressed body', async () => {
      const response = await request(app)
        [method]('/fake-gzip')
        .catch((err) => err);
      if (method === 'head') {
        expect(response.status).toBe(200);
        expect(response.headers['content-encoding']).toBe('gzip');
      } else {
        expect(response.message).toMatch(/incorrect header check|unexpected end of file/);
      }
    });
  });
});
