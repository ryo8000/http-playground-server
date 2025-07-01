import { Router } from 'express';
import { HttpStatusCodes } from '../utils/http.js';
import { log } from '../logger.js';

const base64Router = Router();

base64Router.all('/encode', (req, res) => {
  let valueToEncode: string;

  // Handle different content types
  if (typeof req.body === 'string') {
    valueToEncode = req.body;
  } else if (req.body && typeof req.body.value === 'string') {
    valueToEncode = req.body.value;
  } else {
    res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: {
        message: "Missing 'value' in request body or invalid format",
      },
    });
    return;
  }

  try {
    const encoded = Buffer.from(valueToEncode, 'utf8').toString('base64');
    res.status(HttpStatusCodes.OK).json({ encoded });
  } catch (error: unknown) {
    log.error(error, 'An unexpected error occurred during encoding.');
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'An unexpected error occurred during encoding.',
      },
    });
  }
});

base64Router.all('/decode', (req, res) => {
  let valueToDecode: string;

  // Handle different content types
  if (typeof req.body === 'string') {
    valueToDecode = req.body;
  } else if (req.body && typeof req.body.value === 'string') {
    valueToDecode = req.body.value;
  } else {
    res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: {
        message: "Missing 'value' in request body or invalid format",
      },
    });
    return;
  }

  try {
    const decodedBuffer = Buffer.from(valueToDecode, 'base64');

    // Validate Base64 format
    if (decodedBuffer.toString('base64') !== valueToDecode) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: { message: 'Invalid Base64 format' },
      });
      return;
    }

    const decoded = decodedBuffer.toString('utf8');
    res.status(HttpStatusCodes.OK).json({ decoded });
  } catch (error: unknown) {
    log.error(error, 'An unexpected error occurred during decoding.');
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: { message: 'An unexpected error occurred during decoding.' },
    });
  }
});

export { base64Router };
