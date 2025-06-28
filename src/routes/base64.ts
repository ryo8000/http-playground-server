import { Router } from 'express';
import { HttpStatusCodes } from '../utils/http.js';

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
  } catch {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: {
        message: 'Failed to encode value to Base64',
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
    // Validate Base64 format before decoding
    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(valueToDecode)) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({
        error: {
          message: 'Invalid Base64 format',
        },
      });
      return;
    }

    const decoded = Buffer.from(valueToDecode, 'base64').toString('utf8');
    res.status(HttpStatusCodes.OK).json({ decoded });
  } catch {
    res.status(HttpStatusCodes.BAD_REQUEST).json({
      error: {
        message: 'Invalid Base64 format',
      },
    });
  }
  return;
});

export { base64Router };
