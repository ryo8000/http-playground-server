import { HttpStatusCodes } from '../utils/http.js';

type DateResult =
  | { ok: true; status: number; headers: Record<string, string>; body: { date: string } }
  | { ok: false; status: number; body: { error: { message: string } } };

/**
 * Checks whether a string is a valid HTTP header value (tab or printable
 * latin-1 characters; no control characters).
 *
 * @param value - The candidate header value.
 * @returns True if every character is allowed in a header value.
 */
const isValidHeaderValue = (value: string): boolean => {
  for (const char of value) {
    const code = char.codePointAt(0) as number;
    if ((code < 0x20 && code !== 0x09) || code === 0x7f || code > 0xff) {
      return false;
    }
  }
  return true;
};

/**
 * Validates the value query parameter to be used as an arbitrary Date response header.
 *
 * @param valueParam - The value query parameter value.
 * @returns A result with the Date response header and body, or an error response when missing or invalid.
 */
export const date = (valueParam: unknown): DateResult => {
  if (valueParam === undefined) {
    return {
      ok: false,
      status: HttpStatusCodes.BAD_REQUEST,
      body: { error: { message: 'Missing `value` query parameter' } },
    };
  }

  if (typeof valueParam !== 'string' || valueParam === '' || !isValidHeaderValue(valueParam)) {
    return {
      ok: false,
      status: HttpStatusCodes.BAD_REQUEST,
      body: {
        error: {
          message: 'Invalid value. Must be a single non-empty string without control characters.',
        },
      },
    };
  }

  return {
    ok: true,
    status: HttpStatusCodes.OK,
    headers: { Date: valueParam },
    body: { date: valueParam },
  };
};
