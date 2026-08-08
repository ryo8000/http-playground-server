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
 * Parsed here rather than with the usual cookie/cookie-parser middleware: those
 * drop a cookie named '__proto__' and turn 'j:'-prefixed values into objects, so
 * an endpoint would not report what the client actually sent.
 *
 * `cookie` v1.0.0 fixed the '__proto__' half upstream by returning a
 * null-prototype object, but express 5.2.1 depends on `cookie` ^0.7.1, which
 * still drops it. Once express moves to `cookie` 2.x, drop this function and
 * call that `parse` instead — the tests in tests/ut/utils/cookies.test.ts
 * describe the behavior it has to keep.
 *
 * @param header - The raw Cookie header, absent when the request sent none.
 * @returns One entry per cookie, the first occurrence of a name winning.
 */
export const parseCookieHeader = (header: string | undefined): Record<string, string> => {
  // Null-prototype so a cookie named '__proto__' is stored instead of silently
  // hitting Object.prototype's setter.
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

  return cookies;
};
