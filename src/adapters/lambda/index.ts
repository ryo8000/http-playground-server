import http from 'node:http';
import { createServer } from 'node:http';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Handler,
} from 'aws-lambda';
import { app } from '../express/app.js';

/** Hop-by-hop headers that must not be forwarded to the loopback request. */
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'te',
  'trailer',
  'upgrade',
  'proxy-authorization',
  'proxy-authenticate',
]);

/**
 * Starts the Express app on a random loopback port and resolves with the port number.
 * Called once on cold start; subsequent invocations reuse the cached promise.
 */
const listeningPromise: Promise<number> = new Promise((resolve, reject) => {
  const server = createServer(app);
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    if (address === null || typeof address === 'string') {
      reject(new Error('Unexpected server address format'));
      return;
    }
    resolve(address.port);
  });
  server.on('error', reject);
});

/**
 * Converts an API Gateway HTTP API v2 event into a loopback HTTP request
 * against the locally running Express server, and maps the response back
 * to an API Gateway proxy result.
 *
 * @param event - The API Gateway v2 proxy event.
 * @returns A structured API Gateway proxy result.
 */
export const handler: Handler<APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2> = async (
  event,
) => {
  const port = await listeningPromise;

  const method = event.requestContext.http.method;
  const path = event.rawPath + (event.rawQueryString ? `?${event.rawQueryString}` : '');

  const bodyBuffer: Buffer = event.body
    ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf-8')
    : Buffer.alloc(0);

  // Build forwarded headers, skipping hop-by-hop headers and recalculating content-length.
  const forwardHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(event.headers ?? {})) {
    const lower = key.toLowerCase();
    if (!HOP_BY_HOP_HEADERS.has(lower) && value !== undefined) {
      forwardHeaders[lower] = value;
    }
  }
  if (bodyBuffer.length > 0) {
    forwardHeaders['content-length'] = String(bodyBuffer.length);
  }

  try {
    const { statusCode, headers, rawBody } = await new Promise<{
      statusCode: number;
      headers: Record<string, string | string[]>;
      rawBody: Buffer;
    }>((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          method,
          path,
          headers: forwardHeaders,
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => {
            const responseHeaders: Record<string, string | string[]> = {};
            for (const [key, value] of Object.entries(res.headers)) {
              if (value !== undefined) {
                responseHeaders[key] = value;
              }
            }
            resolve({
              statusCode: res.statusCode ?? 200,
              headers: responseHeaders,
              rawBody: Buffer.concat(chunks),
            });
          });
          res.on('error', reject);
        },
      );
      req.on('error', reject);
      if (bodyBuffer.length > 0) {
        req.write(bodyBuffer);
      }
      req.end();
    });

    // Extract Set-Cookie headers into the cookies array (API Gateway v2 requirement).
    const cookies: string[] = [];
    const responseHeaders: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === 'set-cookie') {
        const cookieValues = Array.isArray(value) ? value : [value];
        cookies.push(...cookieValues);
      } else {
        responseHeaders[key] = Array.isArray(value) ? value.join(', ') : value;
      }
    }

    return {
      statusCode,
      headers: responseHeaders,
      body: rawBody.toString('utf-8'),
      ...(cookies.length > 0 && { cookies }),
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: 'Internal server error' } }),
      headers: { 'content-type': 'application/json' },
    };
  }
};
