const ALLOWED_LOG_LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
type LogLevel = (typeof ALLOWED_LOG_LEVELS)[number];
const ALLOWED_NODE_ENVS = ['development', 'production', 'test'] as const;
type NodeEnv = (typeof ALLOWED_NODE_ENVS)[number];

const logLevel = process.env['LOG_LEVEL'] ?? 'info';
if (!(ALLOWED_LOG_LEVELS as readonly string[]).includes(logLevel)) {
  throw new Error(
    `Invalid configuration: LOG_LEVEL (${logLevel}) must be one of: ${ALLOWED_LOG_LEVELS.join(', ')}.`,
  );
}

const nodeEnv = process.env['NODE_ENV'] ?? 'development';
if (!(ALLOWED_NODE_ENVS as readonly string[]).includes(nodeEnv)) {
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
  logLevel: logLevel as LogLevel,
  nodeEnv: nodeEnv as NodeEnv,
  headersTimeout,
  keepAliveTimeout,
  maxDelay: Number(process.env['MAX_DELAY']) || 10000,
  origin: process.env['ORIGIN'] || '*',
  port: Number(process.env['PORT']) || 8000,
  requestTimeout,
};
