import http from 'http';
import type { AddressInfo } from 'net';
import express from 'express';
import { fakeGzipRouter } from '../../../src/routes/fake-gzip.js';

const app = express();
app.use('/fake-gzip', fakeGzipRouter);

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const;

// supertest (superagent) always gunzips responses declaring Content-Encoding: gzip and
// fails on the intentionally uncompressed body, so assert the raw response via node:http.
const rawRequest = (
  port: number,
  method: string,
): Promise<{ status: number | undefined; headers: http.IncomingHttpHeaders; body: string }> =>
  new Promise((resolve, reject) => {
    const req = http.request({ port, path: '/fake-gzip', method }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () =>
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString(),
        }),
      );
    });
    req.on('error', reject);
    req.end();
  });

describe('fakeGzipRouter', () => {
  let server: http.Server;
  let port: number;

  beforeAll(async () => {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    port = (server.address() as AddressInfo).port;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it.each(HTTP_METHODS)(
    'should declare gzip encoding with an uncompressed body via %s',
    async (method) => {
      const response = await rawRequest(port, method);
      expect(response.status).toBe(200);
      expect(response.headers['content-encoding']).toBe('gzip');
      expect(response.headers['content-type']).toBe('application/json; charset=utf-8');
      expect(response.body).toBe(
        method === 'HEAD' ? '' : '{"message":"This body is not actually gzip-compressed"}',
      );
    },
  );
});
