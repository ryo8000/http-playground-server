import request from 'supertest';
import express from 'express';
import { mirrorRouter } from '../../src/routes/mirrorRoutes';

const app = express();
app.use(express.json());
app.use('/mirror', mirrorRouter);

describe('POST /mirror', () => {
  it('should return the request body as a response', async () => {
    const testData = { message: 'Hello' };

    const response = await request(app).post('/mirror').send(testData);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(testData);
  });
});
