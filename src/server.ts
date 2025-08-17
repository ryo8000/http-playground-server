import { app } from './app.js';
import { environment } from './env.js';
import { log } from './logger.js';
import { gracefulShutdown, setServerInstance } from './utils/shutdown.js';

const server = app.listen(environment.port, () => {
  log.info(`Server is running on http://localhost:${environment.port}`);
});

server.headersTimeout = environment.headersTimeout;
server.requestTimeout = environment.requestTimeout;
server.keepAliveTimeout = environment.keepAliveTimeout;

// Set the server instance for shutdown operations
setServerInstance(server);

process.on('SIGTERM', () => {
  log.info('SIGTERM signal received');
  gracefulShutdown(server);
});
