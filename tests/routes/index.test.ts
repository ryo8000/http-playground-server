import express from 'express';
import request from 'supertest';
import { indexRouter } from '../../src/routes/index';

const app = express();
app.use('/', indexRouter);

describe('GET /', () => {
  it('should respond with status 200', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: 200,
      message: 'OK',
    });
  });
});

describe('POST /', () => {
  it('should respond with status 200', async () => {
    const response = await request(app).post('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: 200,
      message: 'OK',
    });
  });
});

describe('PUT /', () => {
  it('should respond with status 200', async () => {
    const response = await request(app).put('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: 200,
      message: 'OK',
    });
  });
});

describe('DELETE /', () => {
  it('should respond with status 200', async () => {
    const response = await request(app).delete('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: 200,
      message: 'OK',
    });
  });
});
