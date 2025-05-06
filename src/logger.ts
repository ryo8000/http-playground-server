import pino from 'pino';
import { environment } from './env';

export const logger = pino({
  level: environment.logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
});

export const log = {
  fatal: logger.fatal.bind(logger),
  error: logger.error.bind(logger),
  warn: logger.warn.bind(logger),
  info: logger.info.bind(logger),
  debug: logger.debug.bind(logger),
  trace: logger.trace.bind(logger),
};
