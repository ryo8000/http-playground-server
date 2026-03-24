import { HttpStatusCodes } from '../utils/http.js';

type BasicAuthResult = {
  status: number;
  body: object;
  headers?: Record<string, string>;
};

/**
 * Validates Basic auth credentials against the Authorization header.
 *
 * @param user - The expected username from the query parameter.
 * @param password - The expected password from the query parameter.
 * @param authHeader - The Authorization header value from the request.
 * @returns A result indicating success or failure with appropriate status, body, and optional headers.
 */
export function basicAuth(
  user: unknown,
  password: unknown,
  authHeader: string | undefined,
): BasicAuthResult {

  // Validate that both user and password are provided and non-empty
  if (
    !user ||
    !password ||
    typeof user !== 'string' ||
    typeof password !== 'string' ||
    user.trim() === '' ||
    password.trim() === ''
  ) {
    return {
      status: HttpStatusCodes.BAD_REQUEST,
      body: { error: { message: 'Missing user or password query parameter' } },
    };
  }

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return {
      status: HttpStatusCodes.UNAUTHORIZED,
      body: { authenticated: false, message: 'Authentication required' },
      headers: { 'WWW-Authenticate': 'Basic realm="Access to /basic-auth"' },
    };
  }

  const base64Credentials = authHeader.substring('Basic '.length);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [providedUser, ...passwordParts] = credentials.split(':');
  const providedPassword = passwordParts.join(':');

  if (providedUser !== user || providedPassword !== password) {
    return {
      status: HttpStatusCodes.UNAUTHORIZED,
      body: { authenticated: false, message: 'Authentication failed' },
      headers: { 'WWW-Authenticate': 'Basic realm="Access to /basic-auth"' },
    };
  }

  return {
    status: HttpStatusCodes.OK,
    body: { authenticated: true, message: 'Authentication successful' },
  };
}
