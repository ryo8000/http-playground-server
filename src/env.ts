export const environment = {
  enableShutdown: process.env['ENABLE_SHUTDOWN'] === 'true',
  origin: process.env['ORIGIN'] || '*',
  port: Number(process.env['PORT']) || 8000,
};
