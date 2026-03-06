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
  headersTimeout,
  keepAliveTimeout,
  logLevel: process.env['LOG_LEVEL'] || 'info',
  maxDelay: Number(process.env['MAX_DELAY']) || 10000,
  nodeEnv: process.env['NODE_ENV'] || 'development',
  origin: process.env['ORIGIN'] || '*',
  port: Number(process.env['PORT']) || 8000,
  requestTimeout,
};
