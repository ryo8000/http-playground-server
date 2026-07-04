import { HttpStatusCodes } from '../utils/http.js';

type ShutdownResult =
  | { ok: true; status: number; body: { message: string } }
  | { ok: false; status: number; body: { error: { message: string } } };

/**
 * Validates whether a server shutdown is permitted.
 *
 * @param enableShutdown - Whether shutdown is enabled via environment configuration.
 * @returns A result indicating success, or a forbidden error if shutdown is disabled.
 */
export const shutdown = (enableShutdown: boolean): ShutdownResult => {
  if (!enableShutdown) {
    return {
      ok: false,
      status: HttpStatusCodes.FORBIDDEN,
      body: { error: { message: 'Shutdown is not enabled' } },
    };
  }

  return { ok: true, status: HttpStatusCodes.OK, body: { message: 'Server shutting down' } };
};
