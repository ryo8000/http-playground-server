import { Request, Response, NextFunction } from 'express';
import { toSafeInteger } from '../utils/numberUtils';

export const delayMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const delay = toSafeInteger(req.query['delay'] as string);
  if (delay > 0) {
    setTimeout(() => next(), delay);
  } else {
    next();
  }
};
