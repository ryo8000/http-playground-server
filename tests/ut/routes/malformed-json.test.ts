import express from 'express';
import request from 'supertest';
import { malformedJsonRouter } from '../../../src/routes/malformed-json.js';

const app = express();
app.use('/malformed-json', malformedJsonRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('malformedJsonRouter', () => {
  it.each(HTTP_METHODS)('should return malformed JSON via %s', async (method) => {
    if (method === 'head') {
      const response = await request(app).head('/malformed-json');
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toMatch(/application\/json/);
    } else {
      await expect(request(app)[method]('/malformed-json')).rejects.toMatchObject({
        message: expect.stringMatching(/Expected double-quoted property name in JSON/),
      });
    }
  });
});
