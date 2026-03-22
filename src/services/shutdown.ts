import { HttpStatusCodes } from '../utils/http.js';

type ShutdownResult =
  | { ok: true; body: { message: string } }
  | { ok: false; status: number; body: { error: { message: string } } };

/**
 * Checks whether the shutdown endpoint is permitted to execute.
 *
 * @param enableShutdown - Whether the shutdown feature is enabled via environment config.
 * @returns A result indicating whether shutdown is allowed, or failure with an error body.
 */
export function shutdown(enableShutdown: boolean): ShutdownResult {
  if (!enableShutdown) {
    return {
      ok: false,
      status: HttpStatusCodes.FORBIDDEN,
      body: { error: { message: 'Shutdown is not enabled' } },
    };
  }

  return { ok: true, body: { message: 'Server shutting down' } };
}
