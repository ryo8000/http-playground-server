import { HttpStatusCodes } from '../utils/http.js';
import { toSafeInteger } from '../utils/number.js';

const DEFAULT_SIZE = 10;
const MAX_SIZE = 1024;
const DEFAULT_INTERVAL = 1000;
const MAX_INTERVAL = 10_000;

const INVALID_SIZE_MESSAGE = `Invalid size. Must be an integer between 1 and ${MAX_SIZE}.`;
const INVALID_INTERVAL_MESSAGE = `Invalid interval. Must be an integer between 1 and ${MAX_INTERVAL}.`;

type DripResult =
  | { ok: true; size: number; interval: number }
  | { ok: false; status: number; body: { error: { message: string } } };

/**
 * Creates a 400 Bad Request error result with the given message.
 *
 * @param message - The error message to include in the response body.
 * @returns A failed DripResult with BAD_REQUEST status.
 */
const badRequest = (message: string): DripResult => ({
  ok: false,
  status: HttpStatusCodes.BAD_REQUEST,
  body: { error: { message } },
});

/**
 * Validates drip query parameters and resolves the total body size and the
 * interval between dripped bytes.
 *
 * @param sizeParam - The size query parameter value (total body size in bytes).
 * @param intervalParam - The interval query parameter value (milliseconds between bytes).
 * @returns A result with the resolved values, or an error response.
 */
export const drip = (sizeParam: unknown, intervalParam: unknown): DripResult => {
  if (sizeParam !== undefined && typeof sizeParam !== 'string') {
    return badRequest(INVALID_SIZE_MESSAGE);
  }

  const size = sizeParam === undefined ? DEFAULT_SIZE : toSafeInteger(sizeParam);

  if (size === undefined || size < 1 || size > MAX_SIZE) {
    return badRequest(INVALID_SIZE_MESSAGE);
  }

  if (intervalParam !== undefined && typeof intervalParam !== 'string') {
    return badRequest(INVALID_INTERVAL_MESSAGE);
  }

  const interval = intervalParam === undefined ? DEFAULT_INTERVAL : toSafeInteger(intervalParam);

  if (interval === undefined || interval < 1 || interval > MAX_INTERVAL) {
    return badRequest(INVALID_INTERVAL_MESSAGE);
  }

  return { ok: true, size, interval };
};
