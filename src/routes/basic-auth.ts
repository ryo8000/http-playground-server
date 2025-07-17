import { Router, Response } from 'express';
import { HttpStatusCodes } from '../utils/http.js';

const basicAuthRouter = Router();

/**
 * Sends a standardized 401 Unauthorized response with Basic auth challenge
 * @param res - Express response object
 * @param message - Error message to include in the response
 */
const sendUnauthorized = (res: Response, message: string) => {
  res.setHeader('WWW-Authenticate', 'Basic realm="Access to /basic-auth"');
  res.status(HttpStatusCodes.UNAUTHORIZED).json({
    authenticated: false,
    message,
  });
};

basicAuthRouter.all('/', (req, res) => {
  const { user, password } = req.query;

  // Validate that both user and password are provided and non-empty
  if (
    !user ||
    !password ||
    typeof user !== 'string' ||
    typeof password !== 'string' ||
    user.trim() === '' ||
    password.trim() === ''
  ) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: {
        message: 'Missing user or password query parameter',
      },
    });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    sendUnauthorized(res, 'Authentication required');
    return;
  }

  const base64Credentials = authHeader.substring('Basic '.length);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [providedUser, ...passwordParts] = credentials.split(':');
  const providedPassword = passwordParts.join(':');

  if (providedUser === user && providedPassword === password) {
    res.status(HttpStatusCodes.OK).json({
      authenticated: true,
      message: 'Authentication successful',
    });
  } else {
    sendUnauthorized(res, 'Authentication failed');
  }
});

export { basicAuthRouter };
