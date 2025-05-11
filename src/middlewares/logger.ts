import { Request, Response, NextFunction } from 'express';
import { log } from '../logger';

/**
 * Middleware to log request and response contents.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  log.debug({
    type: 'request',
    method: req.method,
    url: req.url,
    query: req.query,
    headers: req.headers,
    body: req.method === 'GET' || req.body === undefined ? {} : req.body,
  }, 'Incoming request');

  // Store the original res.json method
  const originalJson = res.json;

  // Override res.json method to log response
  res.json = function (body: unknown) {
    log.debug({
      type: 'response',
      statusCode: res.statusCode,
      headers: res.getHeaders(),
      body,
    }, 'Outgoing response');

    // Call the original res.json method
    return originalJson.call(this, body);
  };

  next();
};
