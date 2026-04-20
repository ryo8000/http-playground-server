import type { Server } from 'node:http';
import { log } from '../logger.js';

let isShuttingDown = false;
let serverInstance: Server | null = null;

/**
 * Reset the shutdown state (for testing purposes)
 */
export function resetShutdownState(): void {
  isShuttingDown = false;
  serverInstance = null;
}

/**
 * Set the server instance for shutdown operations
 */
export function setServerInstance(server: Server): void {
  serverInstance = server;
}

/**
 * Gracefully shutdown the HTTP server
 */
export function gracefulShutdown(server?: Server): void {
  const targetServer = server || serverInstance;

  if (!targetServer) {
    log.error('No server instance available for shutdown');
    process.exit(1);
  }

  if (isShuttingDown) {
    log.warn('Shutdown already in progress...');
    return;
  }
  isShuttingDown = true;

  log.info('Shutdown initiated: closing HTTP server');

  const forceExitTimeout = setTimeout(() => {
    log.error('Server close timed out, forcing exit');
    process.exit(1);
  }, 10_000);

  targetServer.close((err) => {
    clearTimeout(forceExitTimeout);

    if (err) {
      log.error({ err }, 'Error during server close');
      process.exit(1);
    }

    log.info('HTTP server closed');
    process.exit(0);
  });
}
