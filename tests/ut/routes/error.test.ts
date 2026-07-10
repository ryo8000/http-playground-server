import express from 'express';
import request from 'supertest';
import { errorRouter } from '../../../src/routes/error.js';

const app = express();
app.use('/error', errorRouter);
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ error: { message: err.message } });
});

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('errorRouter', () => {
  // Network disconnection and timeout are difficult to test in unit tests, so we do minimal verification
  it.each(HTTP_METHODS)(
    'should cause connection reset for network error via %s',
    async (method) => {
      const response = await request(app)
        [method]('/error/network')
        .catch((err) => err);
      expect(response.message).toMatch(/socket hang up|ECONNRESET/);
    },
  );

  it.each(HTTP_METHODS)('should timeout for timeout error via %s', async (method) => {
    const response = await request(app)
      [method]('/error/timeout')
      .timeout({ deadline: 200 })
      .catch((err) => err);
    expect(response.timeout).toBeTruthy();
  });

  it.each(HTTP_METHODS)('should return malformed JSON via %s', async (method) => {
    if (method === 'head') {
      const response = await request(app).head('/error/malformed-json');
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toMatch(/application\/json/);
    } else {
      await expect(request(app)[method]('/error/malformed-json')).rejects.toMatchObject({
        message: expect.stringMatching(/Expected double-quoted property name in JSON/),
      });
    }
  });

  it.each(HTTP_METHODS)('should return 500 when an error is thrown via %s', async (method) => {
    const response = await request(app)[method]('/error/error');
    expect(response.status).toBe(500);
    if (method !== 'head') {
      expect(response.body).toEqual({ error: { message: 'Intentional error' } });
    }
  });
});
