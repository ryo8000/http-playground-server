import { toSafeInteger } from './utils/number.js';

const MAX_PORT = 65535;
const MAX_TIMER_MS = 2 ** 31 - 1;
// Node.js adds server.keepAliveTimeoutBuffer (1000ms by default) to keepAliveTimeout for the socket timeout, which must stay within MAX_TIMER_MS.
const MAX_KEEP_ALIVE_TIMEOUT_MS = MAX_TIMER_MS - 1000;

const errors: string[] = [];

/**
 * Parses an environment variable as a non-negative integer, falling back to a default when unset or zero.
 *
 * @param {string} name - The environment variable name.
 * @param {number} defaultValue - The value used when the variable is unset, empty, or zero.
 * @param {number} [max] - The largest allowed value.
 * @returns {number} The parsed integer, `defaultValue`, or `NaN` if invalid.
 */
const parseIntegerEnv = (
  name: string,
  defaultValue: number,
  max: number = Number.MAX_SAFE_INTEGER,
): number => {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return defaultValue;
  }

  const value = toSafeInteger(raw);
  if (value === undefined || value < 0 || value > max) {
    errors.push(
      `${name}=${JSON.stringify(raw)} must be an integer between 1 and ${max}, or 0 for the default`,
    );
    return Number.NaN;
  }

  return value || defaultValue;
};

const headersTimeout = parseIntegerEnv('HEADERS_TIMEOUT', 10000);
const requestTimeout = parseIntegerEnv('REQUEST_TIMEOUT', 30000);
const keepAliveTimeout = parseIntegerEnv('KEEP_ALIVE_TIMEOUT', 5000, MAX_KEEP_ALIVE_TIMEOUT_MS);
const maxDelay = parseIntegerEnv('MAX_DELAY', 10000, MAX_TIMER_MS);
const port = parseIntegerEnv('PORT', 8000, MAX_PORT);

if (headersTimeout <= keepAliveTimeout) {
  errors.push(
    `HEADERS_TIMEOUT=${headersTimeout} must be greater than KEEP_ALIVE_TIMEOUT=${keepAliveTimeout}`,
  );
}

if (requestTimeout <= headersTimeout) {
  errors.push(
    `REQUEST_TIMEOUT=${requestTimeout} must be greater than HEADERS_TIMEOUT=${headersTimeout}`,
  );
}

if (errors.length > 0) {
  throw new Error(
    `Invalid environment configuration:\n${errors.map((error) => `  - ${error}`).join('\n')}`,
  );
}

export const environment = {
  enableCrash: process.env['ENABLE_CRASH'] === 'true',
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
