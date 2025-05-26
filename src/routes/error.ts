import { Router, Response } from 'express';
import { createStatusResponse } from '../models/statusResponse';
import { HttpStatusCodes } from '../utils/http';

const errorRouter = Router();

/**
 * Sends a 400 Bad Request response for invalid or unsupported error types.
 * Includes a list of supported error types in the response body.
 *
 * @param {Response} res - Express response object
 */
const sendInvalidTypeResponse = (res: Response) => {
  res
    .status(HttpStatusCodes.BAD_REQUEST)
    .json(
      createStatusResponse(HttpStatusCodes.BAD_REQUEST, {
        errorMessage:
          "Invalid error type. SupportedTypes are 'timeout', 'network', 'malformed-json' and 'error'",
      }),
    );
};

errorRouter.all('/:type', (req, res) => {
  const { type } = req.params;

  switch (type) {
    case 'timeout':
      // Simulate a timeout by never sending a response
      return;

    case 'network':
      // Intentionally destroy the connection
      req.socket.destroy();
      return;

    case 'malformed-json':
      // Return malformed JSON
      res.setHeader('Content-Type', 'application/json');
      res.send('{"invalid-json": true, missingQuotes: value'); // Missing closing brace and quotes
      return;

    case 'error':
      throw new Error('Intentional error');

    default:
      sendInvalidTypeResponse(res);
  }
});

errorRouter.all('/', (_req, res) => {
  sendInvalidTypeResponse(res);
});

export { errorRouter };
