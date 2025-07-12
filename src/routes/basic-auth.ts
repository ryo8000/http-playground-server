import { Router } from 'express';
import { HttpStatusCodes } from '../utils/http.js';

const basicAuthRouter = Router();

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
    res.setHeader('WWW-Authenticate', 'Basic realm="Access to /basic-auth"');
    res.status(HttpStatusCodes.UNAUTHORIZED).json({
      authenticated: false,
      message: 'Authentication required',
    });
    return;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials as string, 'base64').toString('utf-8');
  const [providedUser, providedPassword] = credentials.split(':');

  if (providedUser === user && providedPassword === password) {
    res.status(HttpStatusCodes.OK).json({
      authenticated: true,
      message: 'Authentication successful',
      user,
      password,
    });
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Access to /basic-auth"');
    res.status(HttpStatusCodes.UNAUTHORIZED).json({
      authenticated: false,
      message: 'Authentication failed',
      user: providedUser,
      password: providedPassword,
    });
  }
});

export { basicAuthRouter };
