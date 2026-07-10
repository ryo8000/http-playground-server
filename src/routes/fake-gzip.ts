import { Router } from 'express';
import { HttpStatusCodes } from '../utils/http.js';

const fakeGzipRouter = Router();

fakeGzipRouter.all('/', (_req, res) => {
  // Declare gzip but send an uncompressed body so client decompression fails
  res
    .status(HttpStatusCodes.OK)
    .set({ 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' })
    .send(Buffer.from('{"message":"This body is not actually gzip-compressed"}'));
});

export { fakeGzipRouter };
