import express from 'express';
import request from 'supertest';
import { failThenSucceedRouter } from '../../../src/routes/fail-then-succeed.js';
import { resetFailThenSucceedCounters } from '../../../src/services/fail-then-succeed.js';

const app = express();
app.use('/fail-then-succeed', failThenSucceedRouter);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('failThenSucceedRouter', () => {
  beforeEach(() => {
    resetFailThenSucceedCounters();
  });

  it.each(HTTP_METHODS)(
    'should fail the first `after` attempts and then succeed via %s',
    async (method) => {
      const first = await request(app)[method]('/fail-then-succeed?after=2&id=a');
      expect(first.status).toBe(500);
      if (method !== 'head') {
        expect(first.body).toEqual({
          error: { message: 'Attempt 1 failed (succeeds on attempt 3)' },
        });
      }

      const second = await request(app)[method]('/fail-then-succeed?after=2&id=a');
      expect(second.status).toBe(500);

      const third = await request(app)[method]('/fail-then-succeed?after=2&id=a');
      expect(third.status).toBe(200);
      if (method !== 'head') {
        expect(third.body).toEqual({ message: 'Attempt 3 succeeded after 2 failure(s)' });
      }
    },
  );

  it.each(HTTP_METHODS)('should return 400 for an invalid after via %s', async (method) => {
    const response = await request(app)[method]('/fail-then-succeed?after=abc');
    expect(response.status).toBe(400);
    if (method !== 'head') {
      expect(response.body).toEqual({
        error: { message: 'Invalid after. Must be an integer between 0 and 10000.' },
      });
    }
  });
});
