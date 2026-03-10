import type { Server } from 'http';

let isShuttingDown = false;

/**
 * Gracefully shuts down the HTTP server
 * @param server - The HTTP server instance to shutdown
 * @param reason - Optional reason for the shutdown (for logging)
 */
export function gracefulShutdown(server: Server, reason = 'shutdown'): void {
  if (isShuttingDown) {
    console.warn('Shutdown already in progress...');
    return;
  }
  isShuttingDown = true;

  console.info(`${reason} signal received: closing HTTP server`);

  const forceExitTimeout = setTimeout(() => {
    console.error('Server close timed out, forcing exit');
    process.exit(1);
  }, 10_000);

  server.close((err) => {
    clearTimeout(forceExitTimeout);

    if (err) {
      console.error('Error during server close:', err);
      process.exit(1);
    }

    console.info('HTTP server closed');
    process.exit(0);
  });
}

/**
 * Creates a shutdown function that can be called to gracefully shutdown the server
 * @param server - The HTTP server instance to shutdown
 * @returns A function that when called will gracefully shutdown the server
 */
export function createShutdownHandler(server: Server) {
  return (reason = 'shutdown') => gracefulShutdown(server, reason);
}

// Global shutdown handler that can be set by the server
let globalShutdownHandler: ((reason?: string) => void) | null = null;

/**
 * Sets the global shutdown handler
 */
export function setGlobalShutdownHandler(handler: (reason?: string) => void): void {
  globalShutdownHandler = handler;
}

/**
 * Triggers shutdown using the global handler if available, otherwise falls back to process.exit(0)
 */
export function triggerShutdown(reason = 'Manual shutdown'): void {
  if (globalShutdownHandler) {
    globalShutdownHandler(reason);
  } else {
    // Fallback for when no global handler is set (e.g., in tests)
    process.exit(0);
  }
}
