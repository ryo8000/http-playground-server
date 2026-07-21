import { HttpStatusCodes } from '../utils/http.js';
import { toSafeInteger } from '../utils/number.js';

const MIN_VALID_STATUS_CODE = 200;
const MAX_VALID_STATUS_CODE = 599;

type StatusResult =
  | { ok: true; status: number }
  | { ok: false; status: number; body: { error: { message: string } } };

/**
 * Validates a status code parameter and returns a result object. The parameter
 * may be a comma-separated list of codes, in which case one is chosen at random.
 *
 * @param statusParam - The raw status code string from the route parameter (e.g. `500` or `200,500`).
 * @param roll - A random number in [0, 1) used to choose from a comma-separated list.
 * @returns A result indicating success with the chosen status code, or failure with an error body.
 */
export const status = (statusParam: string, roll: number): StatusResult => {
  const statusCodes: number[] = [];

  for (const code of statusParam.split(',')) {
    const statusCode = toSafeInteger(code);

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

    statusCodes.push(statusCode);
  }

  // roll < 1 keeps the index in range; the fallback only satisfies the type checker
  const chosen = statusCodes[Math.floor(roll * statusCodes.length)] ?? MIN_VALID_STATUS_CODE;

  return { ok: true, status: chosen };
};
