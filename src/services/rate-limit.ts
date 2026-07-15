import { HttpStatusCodes } from '../utils/http.js';
import { toSafeInteger } from '../utils/number.js';

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 10_000;
const DEFAULT_WINDOW = 10;
const MAX_WINDOW = 3600;
const DEFAULT_ID = 'default';
// Safety cap so arbitrary ids cannot grow the window map without bound.
const MAX_TRACKED_IDS = 10_000;

const INVALID_LIMIT_MESSAGE = `Invalid limit. Must be an integer between 1 and ${MAX_LIMIT}.`;
const INVALID_WINDOW_MESSAGE = `Invalid window. Must be an integer between 1 and ${MAX_WINDOW}.`;

const windows = new Map<string, { resetAt: number; count: number }>();

type RateLimitResult =
  | { status: number; headers: Record<string, string>; body: { message: string } }
  | { status: number; headers?: Record<string, string>; body: { error: { message: string } } };

/**
 * Creates a 400 Bad Request error result with the given message.
 *
 * @param message - The error message to include in the response body.
 * @returns A result with BAD_REQUEST status and the error body.
 */
const badRequest = (message: string): RateLimitResult => ({
  status: HttpStatusCodes.BAD_REQUEST,
  body: { error: { message } },
});

/**
 * Simulates a fixed-window rate limiter: allows `limit` requests per `window`
 * seconds per id, then returns 429 with a `Retry-After` header until the
 * window expires.
 *
 * @param limitParam - The limit query parameter value (allowed requests per window).
 * @param windowParam - The window query parameter value (window length in seconds).
 * @param idParam - The id query parameter value identifying the rate limit window.
 * @param now - The current time in milliseconds since the epoch.
 * @returns A 200 result with X-RateLimit-* headers, a 429 result once the limit
 *   is exceeded, or a 400 error result for invalid parameters.
 */
export const rateLimit = (
  limitParam: unknown,
  windowParam: unknown,
  idParam: unknown,
  now: number,
): RateLimitResult => {
  if (limitParam !== undefined && typeof limitParam !== 'string') {
    return badRequest(INVALID_LIMIT_MESSAGE);
  }

  const limit = limitParam === undefined ? DEFAULT_LIMIT : toSafeInteger(limitParam);

  if (limit === undefined || limit < 1 || limit > MAX_LIMIT) {
    return badRequest(INVALID_LIMIT_MESSAGE);
  }

  if (windowParam !== undefined && typeof windowParam !== 'string') {
    return badRequest(INVALID_WINDOW_MESSAGE);
  }

  const window = windowParam === undefined ? DEFAULT_WINDOW : toSafeInteger(windowParam);

  if (window === undefined || window < 1 || window > MAX_WINDOW) {
    return badRequest(INVALID_WINDOW_MESSAGE);
  }

  if (idParam !== undefined && typeof idParam !== 'string') {
    return badRequest('Invalid id. Must be a single string value.');
  }

  const id = idParam ?? DEFAULT_ID;

  if (!windows.has(id) && windows.size >= MAX_TRACKED_IDS) {
    // Evict the oldest entry. FIFO by first insertion: Map preserves insertion
    // order and set() on an existing key doesn't reorder it.
    const oldestKey = windows.keys().next().value;
    if (oldestKey !== undefined) {
      windows.delete(oldestKey);
    }
  }

  let entry = windows.get(id);
  if (!entry || now >= entry.resetAt) {
    entry = { resetAt: now + window * 1000, count: 0 };
  }
  entry.count += 1;
  windows.set(id, entry);

  const resetSeconds = Math.ceil((entry.resetAt - now) / 1000);
  const headers = {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(Math.max(limit - entry.count, 0)),
    'X-RateLimit-Reset': String(resetSeconds),
  };

  if (entry.count > limit) {
    return {
      status: HttpStatusCodes.TOO_MANY_REQUESTS,
      headers: { ...headers, 'Retry-After': String(resetSeconds) },
      body: { error: { message: `Rate limit exceeded. Retry after ${resetSeconds} second(s).` } },
    };
  }

  return {
    status: HttpStatusCodes.OK,
    headers,
    body: { message: `Request ${entry.count} of ${limit} allowed` },
  };
};

/**
 * Clears all tracked rate limit windows. Intended for tests.
 */
export const resetRateLimitWindows = (): void => {
  windows.clear();
};
