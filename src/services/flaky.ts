import { HttpStatusCodes } from '../utils/http.js';

const DEFAULT_RATE = 0.5;

type FlakyResult =
  | { status: number; body: { message: string } }
  | { status: number; body: { error: { message: string } } };

/**
 * Simulates a flaky endpoint that fails with the given probability.
 *
 * @param rateParam - The rate query parameter value (failure probability between 0 and 1).
 * @param roll - A random number in [0, 1) used to decide the outcome.
 * @returns A 500 error result when the roll is below the rate, a 200 success
 *   result otherwise, or a 400 error result for an invalid rate.
 */
export const flaky = (rateParam: unknown, roll: number): FlakyResult => {
  let rate = DEFAULT_RATE;

  if (rateParam !== undefined) {
    rate =
      typeof rateParam === 'string' && rateParam.trim() !== '' ? Number(rateParam) : Number.NaN;

    if (Number.isNaN(rate) || rate < 0 || rate > 1) {
      return {
        status: HttpStatusCodes.BAD_REQUEST,
        body: { error: { message: 'Invalid rate. Must be a number between 0 and 1.' } },
      };
    }
  }

  if (roll < rate) {
    return {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: { error: { message: `Simulated failure (rate=${rate})` } },
    };
  }

  return { status: HttpStatusCodes.OK, body: { message: `Succeeded (rate=${rate})` } };
};
