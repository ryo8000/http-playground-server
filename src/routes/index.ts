import { Router } from 'express';
import { HttpStatusCodes } from '../utils/http.js';

const endpoints = [
  { path: '/', description: 'Returns this list of available endpoints.' },
  { path: '/base64/encode', description: 'Encodes a string value to Base64 format.' },
  { path: '/base64/decode', description: 'Decodes a Base64 string to its original format.' },
  {
    path: '/basic-auth',
    description: 'Tests HTTP Basic Authentication against user/password query parameters.',
  },
  {
    path: '/bearer-auth',
    description: 'Tests HTTP Bearer Authentication against the token query parameter.',
  },
  { path: '/big-headers', description: 'Responds with oversized response headers.' },
  {
    path: '/cache',
    description:
      'Returns ETag/Last-Modified headers, or 304 when conditional request headers are present.',
  },
  {
    path: '/cache/{seconds}',
    description: 'Responds with a Cache-Control: public, max-age={seconds} header.',
  },
  { path: '/cookies', description: 'Returns the cookies sent with the request.' },
  { path: '/cookies/set', description: 'Sets cookies from query parameters.' },
  { path: '/cookies/delete', description: 'Expires the cookies named by query parameters.' },
  {
    path: '/crash',
    description: 'Kills the server process without graceful shutdown. Requires ENABLE_CRASH=true.',
  },
  {
    path: '/date',
    description: 'Responds with an arbitrary Date header taken from the value query parameter.',
  },
  {
    path: '/drip',
    description: 'Drips the response body one byte per interval until size bytes are sent.',
  },
  { path: '/error/timeout', description: 'Simulates a timeout by never sending a response.' },
  { path: '/error/network', description: 'Simulates a network error by closing the connection.' },
  { path: '/error/malformed-json', description: 'Returns malformed JSON response.' },
  {
    path: '/error/error',
    description: 'Throws an unhandled exception to trigger Express error handler.',
  },
  { path: '/fail-then-succeed', description: 'Fails a number of times per id, then succeeds.' },
  { path: '/fake-gzip', description: 'Declares gzip encoding but returns an uncompressed body.' },
  {
    path: '/flaky',
    description: 'Randomly fails with a 500 response based on the rate query parameter.',
  },
  { path: '/gzip', description: 'Returns a gzip-compressed JSON body.' },
  {
    path: '/infinite',
    description: 'Streams an endless chunked response body until the connection is closed.',
  },
  {
    path: '/keep-alive-cut',
    description: 'Responds normally, then resets the connection (TCP RST).',
  },
  { path: '/mirror', description: 'Returns the request body as a response.' },
  {
    path: '/rate-limit',
    description: 'Allows limit requests per window seconds per id, then returns 429.',
  },
  {
    path: '/redirect',
    description: 'Returns a redirect response based on the status and url query parameters.',
  },
  { path: '/redirect-loop', description: 'Redirects to itself forever with a 302 response.' },
  { path: '/request', description: 'Returns a structured JSON dump of the incoming request.' },
  {
    path: '/reset',
    description: 'Cuts the connection with a TCP RST instead of sending a response.',
  },
  {
    path: '/shutdown',
    description: 'Triggers a shutdown of the server. Requires ENABLE_SHUTDOWN=true.',
  },
  { path: '/sse', description: 'Streams count Server-Sent Events every interval milliseconds.' },
  {
    path: '/status/{status}',
    description:
      'Responds with the given status code, or one chosen randomly from a comma-separated list.',
  },
  {
    path: '/truncate',
    description: 'Declares a size-byte body but sends only part before cutting the connection.',
  },
  { path: '/uuid', description: 'Generates and returns a random UUID (version 4).' },
];

const indexRouter = Router();

indexRouter.all('/', (_req, res) => {
  res.status(HttpStatusCodes.OK).json({ name: 'http-playground-server', endpoints });
});

export { indexRouter };
