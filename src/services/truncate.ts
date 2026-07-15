import { HttpStatusCodes } from '../utils/http.js';
import { toSafeInteger } from '../utils/number.js';

const DEFAULT_SIZE = 1024;
const MAX_SIZE = 1_048_576;

const INVALID_SIZE_MESSAGE = `Invalid size. Must be an integer between 1 and ${MAX_SIZE}.`;
const INVALID_SEND_MESSAGE = 'Invalid send. Must be an integer between 0 and size - 1.';

type TruncateResult =
  | { ok: true; size: number; send: number; chunked: boolean }
  | { ok: false; status: number; body: { error: { message: string } } };

/**
 * Creates a 400 Bad Request error result with the given message.
 *
 * @param message - The error message to include in the response body.
 * @returns A failed TruncateResult with BAD_REQUEST status.
 */
const badRequest = (message: string): TruncateResult => ({
  ok: false,
  status: HttpStatusCodes.BAD_REQUEST,
  body: { error: { message } },
});

/**
 * Validates truncate query parameters and resolves the declared body size,
 * the number of bytes to actually send, and the transfer mode.
 *
 * @param sizeParam - The size query parameter value (declared body size in bytes).
 * @param sendParam - The send query parameter value (bytes sent before cutting; defaults to half of size).
 * @param chunkedParam - The chunked query parameter value ('true' switches to chunked transfer).
 * @returns A result with the resolved values, or an error response.
 */
export const truncate = (
  sizeParam: unknown,
  sendParam: unknown,
  chunkedParam: unknown,
): TruncateResult => {
  if (sizeParam !== undefined && typeof sizeParam !== 'string') {
    return badRequest(INVALID_SIZE_MESSAGE);
  }

  const size = sizeParam === undefined ? DEFAULT_SIZE : toSafeInteger(sizeParam);

  if (size === undefined || size < 1 || size > MAX_SIZE) {
    return badRequest(INVALID_SIZE_MESSAGE);
  }

  if (sendParam !== undefined && typeof sendParam !== 'string') {
    return badRequest(INVALID_SEND_MESSAGE);
  }

  const send = sendParam === undefined ? Math.floor(size / 2) : toSafeInteger(sendParam);

  if (send === undefined || send < 0 || send >= size) {
    return badRequest(INVALID_SEND_MESSAGE);
  }

  return { ok: true, size, send, chunked: chunkedParam === 'true' };
};
