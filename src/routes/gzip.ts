import { gzipSync } from 'zlib';
import { Router } from 'express';
import { HttpStatusCodes } from '../utils/http.js';

const gzippedBody = gzipSync('{"gzipped":true,"message":"This body is gzip-compressed"}');

const gzipRouter = Router();

gzipRouter.all('/', (_req, res) => {
  res
    .status(HttpStatusCodes.OK)
    .set({ 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' })
    .send(gzippedBody);
});

export { gzipRouter };
