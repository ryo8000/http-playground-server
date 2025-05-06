export const environment = {
  enableShutdown: process.env['ENABLE_SHUTDOWN'] === 'true',
  logLevel: process.env['LOG_LEVEL'] || 'info',
  nodeEnv: process.env['NODE_ENV'] || 'development',
  origin: process.env['ORIGIN'] || '*',
  port: Number(process.env['PORT']) || 8000,
};
