import pino from 'pino';
import { environment } from './env.js';

export const log = pino(
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
      },
);
