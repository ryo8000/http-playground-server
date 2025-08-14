import pino from 'pino';
import { environment } from './env.js';

const logger = pino(
  environment.nodeEnv === 'development'
    ? {
        level: environment.logLevel,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        level: environment.logLevel,
      }
);

export const log = {
  fatal: logger.fatal.bind(logger),
  error: logger.error.bind(logger),
  warn: logger.warn.bind(logger),
  info: logger.info.bind(logger),
  debug: logger.debug.bind(logger),
  trace: logger.trace.bind(logger),
};
