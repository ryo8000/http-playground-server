import { HttpStatusCodes } from '../utils/http.js';
import { toSafeInteger } from '../utils/number.js';

// 8 KiB — the conventional per-header size limit in common HTTP servers
// (e.g. nginx large_client_header_buffers, Apache LimitRequestFieldSize).
const DEFAULT_SIZE = 8192;
const DEFAULT_COUNT = 1;
const MAX_COUNT = 100;
const MAX_TOTAL_BYTES = 1_048_576;

const INVALID_SIZE_MESSAGE = `Invalid size. Must be an integer between 1 and ${MAX_TOTAL_BYTES}.`;
const INVALID_COUNT_MESSAGE = `Invalid count. Must be an integer between 1 and ${MAX_COUNT}.`;

type BigHeadersResult =
  | { ok: true; status: number; headers: Record<string, string>; body: { message: string } }
  | { ok: false; status: number; body: { error: { message: string } } };

/**
 * Creates a 400 Bad Request error result with the given message.
 *
 * @param message - The error message to include in the response body.
 * @returns A failed BigHeadersResult with BAD_REQUEST status.
 */
const badRequest = (message: string): BigHeadersResult => ({
  ok: false,
  status: HttpStatusCodes.BAD_REQUEST,
  body: { error: { message } },
});

/**
 * Validates big-headers query parameters and builds the oversized response headers.
 *
 * @param sizeParam - The size query parameter value (bytes per header value).
 * @param countParam - The count query parameter value (number of headers).
 * @returns A result with the response headers and body, or an error response.
 */
export const bigHeaders = (sizeParam: unknown, countParam: unknown): BigHeadersResult => {
  if (sizeParam !== undefined && typeof sizeParam !== 'string') {
    return badRequest(INVALID_SIZE_MESSAGE);
  }

  const size = sizeParam === undefined ? DEFAULT_SIZE : toSafeInteger(sizeParam);

  if (size === undefined || size < 1 || size > MAX_TOTAL_BYTES) {
    return badRequest(INVALID_SIZE_MESSAGE);
  }

  if (countParam !== undefined && typeof countParam !== 'string') {
    return badRequest(INVALID_COUNT_MESSAGE);
  }

  const count = countParam === undefined ? DEFAULT_COUNT : toSafeInteger(countParam);

  if (count === undefined || count < 1 || count > MAX_COUNT) {
    return badRequest(INVALID_COUNT_MESSAGE);
  }

  if (size * count > MAX_TOTAL_BYTES) {
    return badRequest(
      `Invalid size and count combination. Total header bytes must not exceed ${MAX_TOTAL_BYTES}.`,
    );
  }

  const value = 'a'.repeat(size);
  const headers: Record<string, string> = {};
  for (let i = 1; i <= count; i++) {
    headers[`X-Big-Header-${i}`] = value;
  }

  return {
    ok: true,
    status: HttpStatusCodes.OK,
    headers,
    body: { message: `Sent ${count} header(s) of ${size} byte(s)` },
  };
};
