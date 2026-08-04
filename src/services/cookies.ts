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
 * Decodes a cookie value, unwrapping the optional double quotes around it.
 *
 * @param value - The raw value from the Cookie header.
 * @returns The decoded value, or the raw one when the percent-encoding is
 *   malformed (`decodeURIComponent` throws on e.g. '%zz').
 */
const decodeCookieValue = (value: string): string => {
  const unquoted = value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;

  try {
    return decodeURIComponent(unquoted);
  } catch {
    return unquoted;
  }
};

/**
 * Parses a Cookie request header into the name/value pairs it carries.
 *
 * Deliberately parsed here rather than read from cookie-parser's `req.cookies`:
 * that drops a cookie named '__proto__' and turns 'j:'-prefixed values into
 * objects, so the endpoint would not report what the client actually sent.
 *
 * @param header - The raw Cookie header, absent when the request sent none.
 * @returns A result with one entry per cookie, the first occurrence winning.
 */
export const readCookies = (header: string | undefined): ReadCookiesResult => {
  const cookies: Record<string, string> = Object.create(null);

  for (const pair of header?.split(';') ?? []) {
    const separator = pair.indexOf('=');

    if (separator < 0) {
      continue;
    }

    const name = pair.slice(0, separator).trim();

    if (name === '' || Object.prototype.hasOwnProperty.call(cookies, name)) {
      continue;
    }

    cookies[name] = decodeCookieValue(pair.slice(separator + 1).trim());
  }

  return { status: HttpStatusCodes.OK, body: { cookies } };
};

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
