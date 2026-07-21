import { HttpStatusCodes } from '../utils/http.js';
import { toSafeInteger } from '../utils/number.js';

const DEFAULT_ETAG = 'http-playground';
const MAX_MAX_AGE = 31_536_000;

// Printable ASCII without spaces or double quotes, so the value is safe inside a quoted ETag
const etagPattern = /^[\x21\x23-\x7e]+$/;

type CacheResult =
  | {
      ok: true;
      status: number;
      headers?: Record<string, string>;
      body?: { etag: string; lastModified: string };
    }
  | { ok: false; status: number; body: { error: { message: string } } };

type CacheControlResult =
  | { ok: true; status: number; headers: Record<string, string>; body: { cacheControl: string } }
  | { ok: false; status: number; body: { error: { message: string } } };

/**
 * Simulates a cacheable response: returns ETag and Last-Modified headers, or a
 * 304 Not Modified when the request carries a conditional header.
 *
 * @param ifNoneMatch - The If-None-Match request header value.
 * @param ifModifiedSince - The If-Modified-Since request header value.
 * @param etagParam - The etag query parameter value used as the ETag (unquoted).
 * @param now - The current time used as the Last-Modified value.
 * @returns A 304 result when a conditional header is present, a 200 result with
 *   cache headers otherwise, or an error response for an invalid etag.
 */
export const cache = (
  ifNoneMatch: string | undefined,
  ifModifiedSince: string | undefined,
  etagParam: unknown,
  now: Date,
): CacheResult => {
  if (etagParam !== undefined && (typeof etagParam !== 'string' || !etagPattern.test(etagParam))) {
    return {
      ok: false,
      status: HttpStatusCodes.BAD_REQUEST,
      body: {
        error: {
          message:
            'Invalid etag. Must be a non-empty printable ASCII string without spaces or double quotes.',
        },
      },
    };
  }

  if (ifNoneMatch !== undefined || ifModifiedSince !== undefined) {
    return { ok: true, status: HttpStatusCodes.NOT_MODIFIED };
  }

  const etag = `"${etagParam ?? DEFAULT_ETAG}"`;
  const lastModified = now.toUTCString();

  return {
    ok: true,
    status: HttpStatusCodes.OK,
    headers: { ETag: etag, 'Last-Modified': lastModified },
    body: { etag, lastModified },
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
