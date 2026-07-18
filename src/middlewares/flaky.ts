import { Request, Response, NextFunction } from 'express';
import { flaky } from '../services/flaky.js';
import { HttpStatusCodes } from '../utils/http.js';

/**
 * Middleware to inject probabilistic failures into any endpoint via the
 * `flaky` query parameter (failure probability between 0 and 1).
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const flakyMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const rateParam = req.query['flaky'];

  if (rateParam === undefined) {
    next();
    return;
  }

  const result = flaky(rateParam, Math.random());

  if (result.status === HttpStatusCodes.OK) {
    next();
    return;
  }

  res.status(result.status).json(result.body);
};
