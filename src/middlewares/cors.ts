import { Request, Response, NextFunction } from 'express';
import { environment } from '../env.js';

/**
 * Middleware to handle CORS headers.
 *
 * @param {Request} _req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const corsMiddleware = (_req: Request, res: Response, next: NextFunction): void => {
  res.header({
    'Access-Control-Allow-Origin': environment.origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  next();
};
