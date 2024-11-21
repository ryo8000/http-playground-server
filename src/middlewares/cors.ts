import { Request, Response, NextFunction } from 'express';
import { environment } from '../env';

/**
 * Middleware to handle CORS headers.
 *
 * @param {Request} _req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const corsMiddleware = (_req: Request, res: Response, next: NextFunction) => {
  res.header({
    'Access-Control-Allow-Origin': environment.origin,
  });
  next();
};
