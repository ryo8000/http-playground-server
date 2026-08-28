import { HttpStatusCodes } from '../utils/http.js';
import { toSafeInteger } from '../utils/number.js';

const DEFAULT_ETAG = 'http-playground';
const MAX_ETAG_LENGTH = 128;
const MAX_MAX_AGE = 31_536_000;

// Always revalidate, so the 200-vs-304 outcome stays observable
const CACHE_CONTROL = 'no-cache';

// Fixed, not a live "now", so conditional requests stay deterministic
const LAST_MODIFIED = new Date('2026-01-01T00:00:00Z').toUTCString();

// Excludes space, double quote, backslash, and comma so the value survives being
// quoted in an ETag and replayed in a comma-separated If-None-Match list
const etagPattern = /^[\x21\x23-\x2b\x2d-\x5b\x5d-\x7e]+$/;

type CacheResult =
  | {
      ok: true;
      status: number;
      headers: Record<string, string>;
      body: { etag: string; lastModified: string };
    }
  | { ok: false; status: number; body: { error: { message: string } } };

type CacheControlResult =
  | { ok: true; status: number; headers: Record<string, string>; body: { cacheControl: string } }
  | { ok: false; status: number; body: { error: { message: string } } };

/**
 * Builds a cacheable representation: an ETag, a fixed Last-Modified, and a body
 * echoing both. The 200-vs-304 decision is left to Express's `req.fresh`.
 *
 * @param etagParam - The etag query parameter value used as the ETag (unquoted).
 * @returns A 200 result with the cache headers and a body echoing the unquoted
 *   etag, or an error response for an invalid etag.
 */
export const cache = (etagParam: unknown): CacheResult => {
  if (
    etagParam !== undefined &&
    (typeof etagParam !== 'string' ||
      etagParam.length > MAX_ETAG_LENGTH ||
      !etagPattern.test(etagParam))
  ) {
    return {
      ok: false,
      status: HttpStatusCodes.BAD_REQUEST,
      body: {
        error: {
          message: `Invalid etag. Must be a printable ASCII string of 1 to ${MAX_ETAG_LENGTH} characters without spaces, double quotes, commas, or backslashes.`,
        },
      },
    };
  }

  const etag = etagParam ?? DEFAULT_ETAG;

  return {
    ok: true,
    status: HttpStatusCodes.OK,
    headers: {
      ETag: `"${etag}"`,
      'Last-Modified': LAST_MODIFIED,
      'Cache-Control': CACHE_CONTROL,
    },
    body: { etag, lastModified: LAST_MODIFIED },
  };
};

/**
 * Validates the seconds route parameter and builds a Cache-Control response.
 *
 * @param secondsParam - The raw seconds string from the route parameter (max-age value).
 * @returns A result with the Cache-Control header and body, or an error response.
 */
export const cacheControl = (secondsParam: string): CacheControlResult => {
  const seconds = toSafeInteger(secondsParam);

  if (seconds === undefined || seconds < 0 || seconds > MAX_MAX_AGE) {
    return {
      ok: false,
      status: HttpStatusCodes.BAD_REQUEST,
      body: {
        error: { message: `Invalid seconds. Must be an integer between 0 and ${MAX_MAX_AGE}.` },
      },
    };
  }

  const value = `public, max-age=${seconds}`;

  return {
    ok: true,
    status: HttpStatusCodes.OK,
    headers: { 'Cache-Control': value },
    body: { cacheControl: value },
  };
};
