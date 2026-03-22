import { HttpStatusCodes, RedirectStatuses } from '../utils/http.js';
import { toSafeInteger } from '../utils/number.js';

type RedirectResult =
  | { ok: true; status: number; url: string }
  | { ok: false; status: number; body: { error: { message: string } } };

/**
 * Validates redirect parameters and returns a result object.
 *
 * @param urlParam - The target URL from the query parameter.
 * @param statusParam - The optional redirect status code string from the query parameter.
 * @returns A result indicating success with url and status, or failure with an error body.
 */
export function redirect(
  urlParam: string | undefined,
  statusParam: string | undefined,
): RedirectResult {
  if (!urlParam) {
    return {
      ok: false,
      status: HttpStatusCodes.BAD_REQUEST,
      body: { error: { message: 'Missing `url` query parameter' } },
    };
  }

  const redirectStatus = statusParam ? toSafeInteger(statusParam) : HttpStatusCodes.FOUND;

  if (redirectStatus === undefined || !RedirectStatuses.has(redirectStatus)) {
    return {
      ok: false,
      status: HttpStatusCodes.BAD_REQUEST,
      body: {
        error: {
          message:
            'Invalid redirect status code. Supported statuses are 301, 302, 303, 307 and 308',
        },
      },
    };
  }

  return { ok: true, status: redirectStatus, url: urlParam };
}
