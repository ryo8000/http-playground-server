import express from 'express';
import request from 'supertest';
import { statusRouter } from '../../src/routes/status';

const app = express();
app.use('/status', statusRouter);

describe('GET /status/:status', () => {
  it('should return the corresponding code and message for valid status code', async () => {
    const response = await request(app).get('/status/200');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: 200,
      message: 'OK',
    });
  });

  it('should return the corresponding code and unknown message for valid non-standard status code', async () => {
    const response = await request(app).get('/status/599');
    expect(response.status).toBe(599);
    expect(response.body).toEqual({
      code: 599,
      message: 'unknown',
    });
  });

  it('should return 400 and corresponding message for out-of-range status code', async () => {
    const response1 = await request(app).get('/status/199');
    expect(response1.status).toBe(400);
    expect(response1.body).toEqual({
      code: 400,
      message: 'Bad Request',
      error: {
        message: 'Invalid status'
      },
    });
    const response2 = await request(app).get('/status/600');
    expect(response2.status).toBe(400);
    expect(response2.body).toEqual({
      code: 400,
      message: 'Bad Request',
      error: {
        message: 'Invalid status'
      },
    });
  });

  it('should return 400 and corresponding message for non-numeric status code', async () => {
    const response = await request(app).get('/status/2e1');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      code: 400,
      message: 'Bad Request',
      error: {
        message: 'Invalid status'
      },
    });
  });
});
