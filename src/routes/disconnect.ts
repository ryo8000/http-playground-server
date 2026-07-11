import { Router } from 'express';

const disconnectRouter = Router();

disconnectRouter.all('/', (req) => {
  // Close the connection with a FIN by destroying the socket (see /fault/reset for a TCP RST)
  req.socket.destroy();
  return;
});

export { disconnectRouter };
