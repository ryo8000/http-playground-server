import { parseCookieHeader } from '../utils/cookies.js';
import { HttpStatusCodes } from '../utils/http.js';

// RFC 6265 cookie-name characters (HTTP token)
const cookieNamePattern = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

type InvalidCookieResult = { ok: false; status: number; body: { error: { message: string } } };

type ReadCookiesResult = { status: number; body: { cookies: Record<string, string> } };

type SetCookiesResult =
  { ok: true; status: number; body: { cookies: Record<string, string> } } | InvalidCookieResult;

type DeleteCookiesResult =
  { ok: true; status: number; body: { deleted: string[] } } | InvalidCookieResult;

/**
 * Creates a 400 Bad Request error result with the given message.
 *
 * @param message - The error message to include in the response body.
 * @returns A failed result with BAD_REQUEST status.
 */
const badRequest = (message: string): InvalidCookieResult => ({
  ok: false,
  status: HttpStatusCodes.BAD_REQUEST,
  body: { error: { message } },
});

/**
 * Reads the cookies carried by a Cookie request header.
 *
 * @param header - The raw Cookie header, absent when the request sent none.
 * @returns A result with one entry per cookie.
 */
export const readCookies = (header: string | undefined): ReadCookiesResult => ({
  status: HttpStatusCodes.OK,
  body: { cookies: parseCookieHeader(header) },
});

/**
 * Validates query parameters as cookie name/value pairs to set.
 *
 * @param query - The parsed query parameters (one cookie per parameter).
 * @returns A result with the validated cookie pairs, or an error response for
 *   an invalid cookie name or a non-string value (e.g. a repeated parameter).
 */
export const setCookies = (query: Record<string, unknown>): SetCookiesResult => {
  // Null-prototype so a cookie named '__proto__' is stored instead of silently
  // hitting Object.prototype's setter.
  const cookies: Record<string, string> = Object.create(null);

  for (const [name, value] of Object.entries(query)) {
    if (!cookieNamePattern.test(name)) {
      return badRequest(`Invalid cookie name '${name}'.`);
    }

    if (typeof value !== 'string') {
      return badRequest(`Invalid value for cookie '${name}'. Must be a single string.`);
    }

    cookies[name] = value;
  }

  return { ok: true, status: HttpStatusCodes.OK, body: { cookies } };
};

/**
 * Validates query parameter names as the cookies to expire.
 *
 * @param query - The parsed query parameters (one cookie name per parameter).
 * @returns A result with the validated cookie names, or an error response for an
 *   invalid cookie name.
 */
export const deleteCookies = (query: Record<string, unknown>): DeleteCookiesResult => {
  const deleted = Object.keys(query);

  for (const name of deleted) {
    if (!cookieNamePattern.test(name)) {
      return badRequest(`Invalid cookie name '${name}'.`);
    }
  }

  return { ok: true, status: HttpStatusCodes.OK, body: { deleted } };
};
