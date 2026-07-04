import { HttpStatusCodes } from '../utils/http.js';

type BasicAuthResult = {
  status: number;
  body: { authenticated: boolean; message: string } | { error: { message: string } };
  headers?: Record<string, string>;
};

/**
 * Creates a 401 Unauthorized result with a WWW-Authenticate challenge.
 *
 * @param message - The authentication failure message.
 * @returns A BasicAuthResult with UNAUTHORIZED status and WWW-Authenticate header.
 */
const unauthorized = (message: string): BasicAuthResult => ({
  status: HttpStatusCodes.UNAUTHORIZED,
  body: { authenticated: false, message },
  headers: { 'WWW-Authenticate': 'Basic realm="Access to /basic-auth"' },
});

/**
 * Validates query parameters and Basic auth credentials against the Authorization header.
 *
 * @param userParam - The user query parameter value.
 * @param passwordParam - The password query parameter value.
 * @param authorizationHeader - The Authorization header value.
 * @returns A result with status and body, plus optional response headers for 401 cases.
 */
export const basicAuth = (
  userParam: unknown,
  passwordParam: unknown,
  authorizationHeader: string | undefined,
): BasicAuthResult => {
  // Validate that both user and password are provided and non-empty
  if (
    !userParam ||
    !passwordParam ||
    typeof userParam !== 'string' ||
    typeof passwordParam !== 'string' ||
    userParam.trim() === '' ||
    passwordParam.trim() === ''
  ) {
    return {
      status: HttpStatusCodes.BAD_REQUEST,
      body: { error: { message: 'Missing user or password query parameter' } },
    };
  }

  if (!authorizationHeader?.toLowerCase().startsWith('basic ')) {
    return unauthorized('Authentication required');
  }

  const base64Credentials = authorizationHeader.slice(6).trim();
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [providedUser, ...passwordParts] = credentials.split(':');
  const providedPassword = passwordParts.join(':');

  if (providedUser !== userParam || providedPassword !== passwordParam) {
    return unauthorized('Authentication failed');
  }

  return {
    status: HttpStatusCodes.OK,
    body: { authenticated: true, message: 'Authentication successful' },
  };
};
