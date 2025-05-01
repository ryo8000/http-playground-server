
import { app } from './app';
import { environment } from './env';

const server = app.listen(environment.port, () => {
  console.log(`Server is running on http://localhost:${environment.port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');

  server.close((err) => {
    if (err) {
      console.error('Error during server close:', err);
      process.exit(1);
    }

    console.log('HTTP server closed');
    process.exit(0);
  });
});
