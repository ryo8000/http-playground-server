import { Router } from 'express';
import { HttpStatusCodes } from '../utils/http.js';

const base64Router = Router();

/**
 * Extracts value from request body, handling different content types
 * @param body - Express request body
 * @returns The extracted string value or null if invalid
 */
function extractValueFromBody(body: unknown): string | null {
  if (typeof body === 'string') {
    return body;
  }
  if (
    body &&
    typeof body === 'object' &&
    'value' in body &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof (body as any).value === 'string'
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (body as any).value;
  }
  return null;
}

base64Router.all('/encode', (req, res) => {
  const valueToEncode = extractValueFromBody(req.body);

  if (valueToEncode === null) {
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
  const valueToDecode = extractValueFromBody(req.body);

  if (valueToDecode === null) {
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
  } catch {
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
      error: { message: 'An unexpected error occurred during decoding.' },
    });
  }
});

export { base64Router };
