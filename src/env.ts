import { toSafeInteger } from './utils/number.js';

/**
 * Parses an environment variable as a non-negative integer, falling back to a default when unset or zero.
 *
 * @param {string} name - The environment variable name.
 * @param {number} defaultValue - The value used when the variable is unset, empty, or zero.
 * @returns {number} The parsed integer, or `defaultValue`.
 */
const parseIntegerEnv = (name: string, defaultValue: number): number => {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return defaultValue;
  }

  const value = toSafeInteger(raw);
  if (value === undefined || value < 0) {
    throw new Error(`Invalid ${name}: ${raw} must be a non-negative integer`);
  }

  return value || defaultValue;
};

const headersTimeout = parseIntegerEnv('HEADERS_TIMEOUT', 10000);
const requestTimeout = parseIntegerEnv('REQUEST_TIMEOUT', 30000);
const keepAliveTimeout = parseIntegerEnv('KEEP_ALIVE_TIMEOUT', 5000);

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
  enableCrash: process.env['ENABLE_CRASH'] === 'true',
  enableShutdown: process.env['ENABLE_SHUTDOWN'] === 'true',
  headersTimeout,
  keepAliveTimeout,
  logLevel: process.env['LOG_LEVEL'] || 'info',
  maxDelay: parseIntegerEnv('MAX_DELAY', 10000),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  origin: process.env['ORIGIN'] || '*',
  port: parseIntegerEnv('PORT', 8000),
  requestTimeout,
};
