import { HttpStatusCodes, RedirectStatuses } from '../utils/http.js';
import { toSafeInteger } from '../utils/number.js';

type RedirectResult =
  | { ok: true; status: number; url: string }
  | { ok: false; status: number; body: { error: { message: string } } };

const INVALID_STATUS_MESSAGE =
  'Invalid redirect status code. Supported statuses are 301, 302, 303, 307 and 308';

/**
 * Creates a 400 Bad Request error result with the given message.
 *
 * @param message - The error message to include in the response body.
 * @returns A failed RedirectResult with BAD_REQUEST status.
 */
const badRequest = (message: string): RedirectResult => ({
  ok: false,
  status: HttpStatusCodes.BAD_REQUEST,
  body: { error: { message } },
});

/**
 * Validates redirect query parameters and resolves the target URL and status code.
 *
 * @param urlParam - The url query parameter value.
 * @param statusParam - The status query parameter value (optional).
 * @returns A result with the redirect URL and status code, or an error response.
 */
export const redirect = (urlParam: unknown, statusParam: unknown): RedirectResult => {
  const url = typeof urlParam === 'string' ? urlParam : undefined;

  if (!url) {
    return badRequest('Missing `url` query parameter');
  }

  if (statusParam !== undefined && typeof statusParam !== 'string') {
    return badRequest(INVALID_STATUS_MESSAGE);
  }

  const redirectStatus =
    statusParam === undefined ? HttpStatusCodes.FOUND : toSafeInteger(statusParam);

  if (redirectStatus === undefined || !RedirectStatuses.has(redirectStatus)) {
    return badRequest(INVALID_STATUS_MESSAGE);
  }

  return { ok: true, status: redirectStatus, url };
};
