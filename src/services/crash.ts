import { HttpStatusCodes } from '../utils/http.js';

type CrashResult =
  | { ok: true; status: number; body: { message: string } }
  | { ok: false; status: number; body: { error: { message: string } } };

/**
 * Validates whether a server crash is permitted.
 *
 * @param enableCrash - Whether crashing is enabled via environment configuration.
 * @returns A result indicating success, or a forbidden error if crashing is disabled.
 */
export const crash = (enableCrash: boolean): CrashResult => {
  if (!enableCrash) {
    return {
      ok: false,
      status: HttpStatusCodes.FORBIDDEN,
      body: { error: { message: 'Crash is not enabled' } },
    };
  }

  return { ok: true, status: HttpStatusCodes.OK, body: { message: 'Server crashing' } };
};
