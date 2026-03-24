import { HttpStatusCodes } from '../utils/http.js';
import { toSafeInteger } from '../utils/number.js';

const MIN_VALID_STATUS_CODE = 200;
const MAX_VALID_STATUS_CODE = 599;

type StatusResult =
  | { ok: true; status: number }
  | { ok: false; status: number; body: { error: { message: string } } };

/**
 * Validates a status code parameter and returns a result object.
 *
 * @param statusParam - The raw status code string from the route parameter.
 * @returns A result indicating success with the parsed status code, or failure with an error body.
 */
export function status(statusParam: string): StatusResult {
  const statusCode = toSafeInteger(statusParam);

  if (
    statusCode === undefined ||
    statusCode < MIN_VALID_STATUS_CODE ||
    statusCode > MAX_VALID_STATUS_CODE
  ) {
    return {
      ok: false,
      status: HttpStatusCodes.BAD_REQUEST,
      body: {
        error: {
          message: `Invalid status code. Must be an integer between ${MIN_VALID_STATUS_CODE} and ${MAX_VALID_STATUS_CODE}.`,
        },
      },
    };
  }

  return { ok: true, status: statusCode };
}
