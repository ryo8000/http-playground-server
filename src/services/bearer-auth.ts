import { HttpStatusCodes } from '../utils/http.js';

type BearerAuthResult = {
  status: number;
  body: { authenticated: boolean; message: string } | { error: { message: string } };
  headers?: Record<string, string>;
};

/**
 * Creates a 401 Unauthorized result with a WWW-Authenticate challenge.
 *
 * @param message - The authentication failure message.
 * @returns A BearerAuthResult with UNAUTHORIZED status and WWW-Authenticate header.
 */
const unauthorized = (message: string): BearerAuthResult => ({
  status: HttpStatusCodes.UNAUTHORIZED,
  body: { authenticated: false, message },
  headers: { 'WWW-Authenticate': 'Bearer realm="Access to /bearer-auth"' },
});

/**
 * Validates the token query parameter and the Bearer token from the Authorization header.
 *
 * @param tokenParam - The token query parameter value (the expected token).
 * @param authorizationHeader - The Authorization header value.
 * @returns A result with status and body, plus optional response headers for 401 cases.
 */
export const bearerAuth = (
  tokenParam: unknown,
  authorizationHeader: string | undefined,
): BearerAuthResult => {
  if (!tokenParam || typeof tokenParam !== 'string' || tokenParam.trim() === '') {
    return {
      status: HttpStatusCodes.BAD_REQUEST,
      body: { error: { message: 'Missing token query parameter' } },
    };
  }

  if (!authorizationHeader?.toLowerCase().startsWith('bearer ')) {
    return unauthorized('Authentication required');
  }

  const providedToken = authorizationHeader.slice(7).trim();

  if (providedToken !== tokenParam) {
    return unauthorized('Authentication failed');
  }

  return {
    status: HttpStatusCodes.OK,
    body: { authenticated: true, message: 'Authentication successful' },
  };
};
