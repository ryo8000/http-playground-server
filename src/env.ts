const ALLOWED_LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
const ALLOWED_NODE_ENVS = ['development', 'production', 'test'] as const;

/**
 * Returns true if value is one of the allowed literals, narrowing the type accordingly.
 *
 * @param value - The string value to check.
 * @param allowed - The tuple of allowed literal strings.
 * @returns Whether value is a member of allowed.
 */
const isOneOf = <T extends string>(value: string, allowed: readonly T[]): value is T =>
  (allowed as readonly string[]).includes(value);

const logLevel = process.env['LOG_LEVEL'] ?? 'info';
if (!isOneOf(logLevel, ALLOWED_LOG_LEVELS)) {
  throw new Error(
    `Invalid configuration: LOG_LEVEL (${logLevel}) must be one of: ${ALLOWED_LOG_LEVELS.join(', ')}.`,
  );
}

const nodeEnv = process.env['NODE_ENV'] ?? 'development';
if (!isOneOf(nodeEnv, ALLOWED_NODE_ENVS)) {
  throw new Error(
    `Invalid configuration: NODE_ENV (${nodeEnv}) must be one of: ${ALLOWED_NODE_ENVS.join(', ')}.`,
  );
}

const headersTimeout = Number(process.env['HEADERS_TIMEOUT']) || 10000;
const requestTimeout = Number(process.env['REQUEST_TIMEOUT']) || 30000;
const keepAliveTimeout = Number(process.env['KEEP_ALIVE_TIMEOUT']) || 5000;

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
  logLevel,
  nodeEnv,
  headersTimeout,
  keepAliveTimeout,
  maxDelay: Number(process.env['MAX_DELAY']) || 10000,
  origin: process.env['ORIGIN'] || '*',
  port: Number(process.env['PORT']) || 8000,
  requestTimeout,
};
