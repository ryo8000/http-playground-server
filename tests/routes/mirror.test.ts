import express from 'express';
import request from 'supertest';
import { mirrorRouter } from '../../src/routes/mirror';

const app = express();
app.use(express.json());
app.use('/mirror', mirrorRouter);

const testQueryParams = { param1: 'value1', param2: 'value2' };
const testHeaders = {
  'content-type': 'application/json',
  'x-custom-header': 'test-value',
};
const testBody = { message: 'Hello' };

describe('GET /mirror', () => {
  it('should return method, query, headers and empty body', async () => {
    const response = await request(app)
      .get('/mirror')
      .query(testQueryParams)
      .set(testHeaders);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      method: 'GET',
      query: testQueryParams,
      headers: expect.objectContaining(testHeaders),
      body: {},
    });
  });
});

describe('POST /mirror', () => {
  it('should return the given method, query, headers and body when the query parameters and request body are not empty', async () => {
    const response = await request(app)
      .post('/mirror')
      .query(testQueryParams)
      .set(testHeaders)
      .send(testBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      method: 'POST',
      query: testQueryParams,
      headers: expect.objectContaining(testHeaders),
      body: testBody,
    });
  });

  it('should return an empty query and body when the query parameters and request body are empty', async () => {
    const response = await request(app).post('/mirror');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      method: 'POST',
      query: {},
      headers: expect.any(Object),
      body: {},
    });
  });
});
