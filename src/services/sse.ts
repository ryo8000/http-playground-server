import { HttpStatusCodes } from '../utils/http.js';
import { toSafeInteger } from '../utils/number.js';

const DEFAULT_COUNT = 5;
const MAX_COUNT = 100;
const DEFAULT_INTERVAL = 1000;
const MAX_INTERVAL = 10_000;

const INVALID_COUNT_MESSAGE = `Invalid count. Must be an integer between 1 and ${MAX_COUNT}.`;
const INVALID_INTERVAL_MESSAGE = `Invalid interval. Must be an integer between 1 and ${MAX_INTERVAL}.`;

type SseResult =
  | { ok: true; count: number; interval: number }
  | { ok: false; status: number; body: { error: { message: string } } };

/**
 * Creates a 400 Bad Request error result with the given message.
 *
 * @param message - The error message to include in the response body.
 * @returns A failed SseResult with BAD_REQUEST status.
 */
const badRequest = (message: string): SseResult => ({
  ok: false,
  status: HttpStatusCodes.BAD_REQUEST,
  body: { error: { message } },
});

/**
 * Validates SSE query parameters and resolves the number of events and the
 * interval between them.
 *
 * @param countParam - The count query parameter value (number of events to send).
 * @param intervalParam - The interval query parameter value (milliseconds between events).
 * @returns A result with the resolved values, or an error response.
 */
export const sse = (countParam: unknown, intervalParam: unknown): SseResult => {
  if (countParam !== undefined && typeof countParam !== 'string') {
    return badRequest(INVALID_COUNT_MESSAGE);
  }

  const count = countParam === undefined ? DEFAULT_COUNT : toSafeInteger(countParam);

  if (count === undefined || count < 1 || count > MAX_COUNT) {
    return badRequest(INVALID_COUNT_MESSAGE);
  }

  if (intervalParam !== undefined && typeof intervalParam !== 'string') {
    return badRequest(INVALID_INTERVAL_MESSAGE);
  }

  const interval = intervalParam === undefined ? DEFAULT_INTERVAL : toSafeInteger(intervalParam);

  if (interval === undefined || interval < 1 || interval > MAX_INTERVAL) {
    return badRequest(INVALID_INTERVAL_MESSAGE);
  }

  return { ok: true, count, interval };
};
