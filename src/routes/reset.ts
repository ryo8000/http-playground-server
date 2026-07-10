import { Router } from 'express';

const resetRouter = Router();

resetRouter.all('/', (req) => {
  // Send a TCP RST instead of a response (unlike /error/network, which sends a FIN)
  req.socket.resetAndDestroy();
});

export { resetRouter };
