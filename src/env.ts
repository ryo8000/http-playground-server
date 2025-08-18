import { toSafeInteger } from './utils/number.js';

const parseEnvInteger = (envVar: string, defaultValue: number): number => {
  const value = process.env[envVar];
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = toSafeInteger(value);
  if (parsed === undefined) {
    throw new Error(`Invalid ${envVar} environment variable: "${value}" is not a valid integer`);
  }
  return parsed;
};

const headersTimeout = parseEnvInteger('HEADERS_TIMEOUT', 10000);
const requestTimeout = parseEnvInteger('REQUEST_TIMEOUT', 30000);
const keepAliveTimeout = parseEnvInteger('KEEP_ALIVE_TIMEOUT', 5000);

if (headersTimeout <= keepAliveTimeout) {
  throw new Error(
    `Invalid timeout configuration: headersTimeout (${headersTimeout}ms) must be greater than keepAliveTimeout (${keepAliveTimeout}ms)`
  );
}

if (requestTimeout <= headersTimeout) {
  throw new Error(
    `Invalid timeout configuration: requestTimeout (${requestTimeout}ms) must be greater than headersTimeout (${headersTimeout}ms)`
  );
}

export const environment = {
  enableShutdown: process.env['ENABLE_SHUTDOWN'] === 'true',
  headersTimeout,
  keepAliveTimeout,
  logLevel: process.env['LOG_LEVEL'] || 'info',
  maxDelay: parseEnvInteger('MAX_DELAY', 10000),
  nodeEnv: process.env['NODE_ENV'] || 'development',
  origin: process.env['ORIGIN'] || '*',
  port: parseEnvInteger('PORT', 8000),
  requestTimeout,
};
