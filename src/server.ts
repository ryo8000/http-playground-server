import { app } from './app';
import { environment } from './env';

const server = app.listen(environment.port, () => {
  console.log(`Server is running on http://localhost:${environment.port}`);
});

let isShuttingDown = false;

process.on('SIGTERM', () => {
  if (isShuttingDown) {
    console.warn('Shutdown already in progress...');
    return;
  }
  isShuttingDown = true;

  console.log('SIGTERM signal received: closing HTTP server');

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

    console.log('HTTP server closed');
    process.exit(0);
  });
});
