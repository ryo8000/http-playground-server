import express from 'express';
import request from 'supertest';
import { statusRouter } from '../../../src/routes/status.js';

const app = express();
app.use('/status', statusRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

const INVALID_STATUS_CODES = [
  { code: '199', reason: 'below valid range' },
  { code: '600', reason: 'above valid range' },
  { code: '2e1', reason: 'scientific notation' },
  { code: 'abc', reason: 'non-numeric string' },
  { code: '1.2', reason: 'floating point number' },
  { code: '204,600', reason: 'list containing an out-of-range code' },
];

describe('statusRouter', () => {
  it.each(HTTP_METHODS)(
    'should return the corresponding code and message for valid status code via %s',
    async (method) => {
      const response = await request(app)[method]('/status/200');
      expect(response.status).toBe(200);
    },
  );

  it.each(HTTP_METHODS)(
    'should return the corresponding code and unknown message for valid non-standard status code via %s',
    async (method) => {
      const response = await request(app)[method]('/status/599');
      expect(response.status).toBe(599);
    },
  );

  it.each(HTTP_METHODS)(
    'should return one of the listed codes for a comma-separated list via %s',
    async (method) => {
      const response = await request(app)[method]('/status/204,205');
      expect([204, 205]).toContain(response.status);
    },
  );

  it.each(
    HTTP_METHODS.flatMap((method) =>
      INVALID_STATUS_CODES.map((testCase) => ({ method, ...testCase })),
    ),
  )(
    'should return 400 for invalid status code $code ($reason) via $method',
    async ({ method, code: statusCode }) => {
      const response = await request(app)[method](`/status/${statusCode}`);
      expect(response.status).toBe(400);
      if (method !== 'head') {
        expect(response.body).toEqual({
          error: {
            message: 'Invalid status code. Must be an integer between 200 and 599.',
          },
        });
      }
    },
  );
});
