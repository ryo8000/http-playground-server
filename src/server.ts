import { app } from './app';
import { environment } from './env';
import { log } from './logger';

const server = app.listen(environment.port, () => {
  log.info(`Server is running on http://localhost:${environment.port}`);
});

server.headersTimeout = environment.headersTimeout;
server.requestTimeout = environment.requestTimeout;
server.keepAliveTimeout = environment.keepAliveTimeout;

let isShuttingDown = false;

process.on('SIGTERM', () => {
  if (isShuttingDown) {
    log.warn('Shutdown already in progress...');
    return;
  }
  isShuttingDown = true;

  log.info('SIGTERM signal received: closing HTTP server');

  const forceExitTimeout = setTimeout(() => {
    log.error('Server close timed out, forcing exit');
    process.exit(1);
  }, 10_000);

  server.close((err) => {
    clearTimeout(forceExitTimeout);

    if (err) {
      log.error({ err }, 'Error during server close');
      process.exit(1);
    }

    log.info('HTTP server closed');
    process.exit(0);
  });
});
