import { HttpStatusCodes } from '../utils/http.js';
import { toSafeInteger } from '../utils/number.js';

const DEFAULT_AFTER = 3;
const DEFAULT_ID = 'default';
// Safety cap so arbitrary ids cannot grow the counter map without bound.
const MAX_TRACKED_IDS = 10_000;

const attemptCounts = new Map<string, number>();

type FailThenSucceedResult =
  | { status: number; body: { message: string } }
  | { status: number; body: { error: { message: string } } };

/**
 * Creates a 400 Bad Request error result with the given message.
 *
 * @param message - The error message to include in the response body.
 * @returns A result with BAD_REQUEST status and the error body.
 */
const badRequest = (message: string): FailThenSucceedResult => ({
  status: HttpStatusCodes.BAD_REQUEST,
  body: { error: { message } },
});

/**
 * Simulates an endpoint that fails a fixed number of times before succeeding.
 * Attempts are counted per id; the counter resets on success so the cycle repeats.
 *
 * @param afterParam - The after query parameter value (number of failures before success).
 * @param idParam - The id query parameter value identifying the attempt counter.
 * @returns A 500 error result while attempts remain, then a 200 success result,
 *   or a 400 error result for invalid parameters.
 */
export const failThenSucceed = (afterParam: unknown, idParam: unknown): FailThenSucceedResult => {
  if (afterParam !== undefined && typeof afterParam !== 'string') {
    return badRequest('Invalid after. Must be an integer of 0 or more.');
  }

  const after = afterParam === undefined ? DEFAULT_AFTER : toSafeInteger(afterParam);

  if (after === undefined || after < 0) {
    return badRequest('Invalid after. Must be an integer of 0 or more.');
  }

  if (idParam !== undefined && typeof idParam !== 'string') {
    return badRequest('Invalid id. Must be a single string value.');
  }

  const id = idParam ?? DEFAULT_ID;

  if (!attemptCounts.has(id) && attemptCounts.size >= MAX_TRACKED_IDS) {
    attemptCounts.clear();
  }

  const attempt = (attemptCounts.get(id) ?? 0) + 1;

  if (attempt <= after) {
    attemptCounts.set(id, attempt);
    return {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: { error: { message: `Attempt ${attempt} failed (succeeds on attempt ${after + 1})` } },
    };
  }

  attemptCounts.delete(id);
  return {
    status: HttpStatusCodes.OK,
    body: { message: `Attempt ${attempt} succeeded after ${after} failure(s)` },
  };
};

/**
 * Clears all tracked attempt counters. Intended for tests.
 */
export const resetFailThenSucceedCounters = (): void => {
  attemptCounts.clear();
};
