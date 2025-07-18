import { Request, Response, NextFunction } from 'express';
import { toSafeInteger } from '../utils/number.js';
import { environment } from '../env.js';

/**
 * Middleware to add artificial delay to responses.
 *
 * @param {Request} req - Express request object
 * @param {Response} _res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const delayMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const delay = toSafeInteger(req.query['delay']?.toString()) ?? 0;
  const actualDelay = Math.min(delay, environment.maxDelay);
  if (actualDelay > 0) {
    await new Promise((resolve) => setTimeout(resolve, actualDelay));
  }
  next();
};
