import express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import request from 'supertest';
import { infiniteRouter } from '../../../src/routes/infinite.js';

const app = express();
app.use('/infinite', infiniteRouter);

// HEAD is excluded: it has no body to stream and is covered by a dedicated test
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] as const;

describe('infiniteRouter', () => {
  let server: http.Server;
  let port: number;

  beforeAll((done) => {
    server = app.listen(0, () => {
      port = (server.address() as AddressInfo).port;
      done();
    });
  });

  afterAll((done) => {
    server.closeAllConnections();
    server.close(done);
  });

  it.each(HTTP_METHODS)('should keep streaming data until the client aborts via %s', (method) => {
    return new Promise<void>((resolve, reject) => {
      const req = http.request({ port, path: '/infinite', method }, (res) => {
        expect(res.statusCode).toBe(200);
        let received = 0;
        res.on('data', (chunk: Buffer) => {
          received += chunk.length;
          if (received >= 2048) {
            req.destroy();
            resolve();
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  });

  // A HEAD response has no body, so the client sees a complete response at the headers
  it('should respond with only headers for HEAD requests', async () => {
    const response = await request(app).head('/infinite');
    expect(response.status).toBe(200);
  });
});
