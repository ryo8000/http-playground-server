import { HttpStatusCodes } from '../utils/http.js';

// RFC 6265 cookie-name characters (HTTP token)
const cookieNamePattern = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

type SetCookiesResult =
  | { ok: true; cookies: Record<string, string> }
  | { ok: false; status: number; body: { error: { message: string } } };

/**
 * Creates a 400 Bad Request error result with the given message.
 *
 * @param message - The error message to include in the response body.
 * @returns A failed SetCookiesResult with BAD_REQUEST status.
 */
const badRequest = (message: string): SetCookiesResult => ({
  ok: false,
  status: HttpStatusCodes.BAD_REQUEST,
  body: { error: { message } },
});

/**
 * Validates query parameters as cookie name/value pairs to set.
 *
 * @param query - The parsed query parameters (one cookie per parameter).
 * @returns A result with the validated cookie pairs, or an error response for
 *   an invalid cookie name or a non-string value (e.g. a repeated parameter).
 */
export const setCookies = (query: Record<string, unknown>): SetCookiesResult => {
  const cookies: Record<string, string> = {};

  for (const [name, value] of Object.entries(query)) {
    if (!cookieNamePattern.test(name)) {
      return badRequest(`Invalid cookie name '${name}'.`);
    }

    if (typeof value !== 'string') {
      return badRequest(`Invalid value for cookie '${name}'. Must be a single string.`);
    }

    cookies[name] = value;
  }

  return { ok: true, cookies };
};
