import { toSafeInteger } from './utils/number.js';

const headersTimeoutValue = process.env['HEADERS_TIMEOUT'];
const requestTimeoutValue = process.env['REQUEST_TIMEOUT'];
const keepAliveTimeoutValue = process.env['KEEP_ALIVE_TIMEOUT'];
const maxDelayValue = process.env['MAX_DELAY'];
const portValue = process.env['PORT'];

// Convert environment variables with error handling
const headersTimeout =
  headersTimeoutValue !== undefined
    ? (() => {
        const parsed = toSafeInteger(headersTimeoutValue);
        if (parsed === undefined) {
          throw new Error(
            `Invalid HEADERS_TIMEOUT value: "${headersTimeoutValue}". Must be a valid integer.`
          );
        }
        return parsed;
      })()
    : 10000;

const requestTimeout =
  requestTimeoutValue !== undefined
    ? (() => {
        const parsed = toSafeInteger(requestTimeoutValue);
        if (parsed === undefined) {
          throw new Error(
            `Invalid REQUEST_TIMEOUT value: "${requestTimeoutValue}". Must be a valid integer.`
          );
        }
        return parsed;
      })()
    : 30000;

const keepAliveTimeout =
  keepAliveTimeoutValue !== undefined
    ? (() => {
        const parsed = toSafeInteger(keepAliveTimeoutValue);
        if (parsed === undefined) {
          throw new Error(
            `Invalid KEEP_ALIVE_TIMEOUT value: "${keepAliveTimeoutValue}". Must be a valid integer.`
          );
        }
        return parsed;
      })()
    : 5000;

const maxDelay =
  maxDelayValue !== undefined
    ? (() => {
        const parsed = toSafeInteger(maxDelayValue);
        if (parsed === undefined) {
          throw new Error(`Invalid MAX_DELAY value: "${maxDelayValue}". Must be a valid integer.`);
        }
        return parsed;
      })()
    : 10000;

const port =
  portValue !== undefined
    ? (() => {
        const parsed = toSafeInteger(portValue);
        if (parsed === undefined) {
          throw new Error(`Invalid PORT value: "${portValue}". Must be a valid integer.`);
        }
        return parsed;
      })()
    : 8000;

if (headersTimeout <= keepAliveTimeout) {
  throw new Error(
    `Invalid timeout configuration: headersTimeout (${headersTimeout}ms) must be greater than keepAliveTimeout (${keepAliveTimeout}ms)`,
  );
}

if (requestTimeout <= headersTimeout) {
  throw new Error(
    `Invalid timeout configuration: requestTimeout (${requestTimeout}ms) must be greater than headersTimeout (${headersTimeout}ms)`,
  );
}

export const environment = {
  enableShutdown: process.env['ENABLE_SHUTDOWN'] === 'true',
  headersTimeout,
  keepAliveTimeout,
  logLevel: process.env['LOG_LEVEL'] || 'info',
  maxDelay,
  nodeEnv: process.env['NODE_ENV'] || 'development',
  origin: process.env['ORIGIN'] || '*',
  port,
  requestTimeout,
};
