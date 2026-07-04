import { HttpStatusCodes } from '../utils/http.js';
import { log } from '../logger.js';

type Base64EncodeResult =
  | { status: number; body: { encoded: string } }
  | { status: number; body: { error: { message: string } } };

type Base64DecodeResult =
  | { status: number; body: { decoded: string } }
  | { status: number; body: { error: { message: string } } };

const MISSING_VALUE_ERROR = "Missing 'value' in request body or invalid format";

/**
 * Extracts a string value from the request body, handling plain string and object formats.
 *
 * @param body - The raw request body.
 * @returns The extracted string value, or null if the format is invalid.
 */
const extractValueFromBody = (body: unknown): string | null => {
  if (typeof body === 'string') {
    return body;
  }

  if (
    typeof body === 'object' &&
    body !== null &&
    'value' in body &&
    typeof (body as { value: unknown }).value === 'string'
  ) {
    return (body as { value: string }).value;
  }

  return null;
};

/**
 * Encodes a UTF-8 string extracted from the request body to Base64.
 *
 * @param body - The raw request body.
 * @returns A result with the encoded string, or an error response on missing value or failure.
 */
export const encodeBase64 = (body: unknown): Base64EncodeResult => {
  const value = extractValueFromBody(body);

  if (value === null) {
    return {
      status: HttpStatusCodes.BAD_REQUEST,
      body: { error: { message: MISSING_VALUE_ERROR } },
    };
  }

  try {
    const encoded = Buffer.from(value, 'utf8').toString('base64');
    return { status: HttpStatusCodes.OK, body: { encoded } };
  } catch (err) {
    log.error({ err }, 'Failed to encode value to Base64');
    return {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: { error: { message: 'Failed to encode value to Base64' } },
    };
  }
};

/**
 * Decodes a Base64 string extracted from the request body to UTF-8.
 *
 * @param body - The raw request body.
 * @returns A result with the decoded string, or an error response on missing value, invalid format, or failure.
 */
export const decodeBase64 = (body: unknown): Base64DecodeResult => {
  const value = extractValueFromBody(body);

  if (value === null) {
    return {
      status: HttpStatusCodes.BAD_REQUEST,
      body: { error: { message: MISSING_VALUE_ERROR } },
    };
  }

  try {
    const decodedBuffer = Buffer.from(value, 'base64');

    // Validate Base64 format
    if (decodedBuffer.toString('base64') !== value) {
      return {
        status: HttpStatusCodes.BAD_REQUEST,
        body: { error: { message: 'Invalid Base64 format' } },
      };
    }

    const decoded = decodedBuffer.toString('utf8');
    return { status: HttpStatusCodes.OK, body: { decoded } };
  } catch (err) {
    log.error({ err }, 'An unexpected error occurred during decoding.');
    return {
      status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
      body: { error: { message: 'An unexpected error occurred during decoding.' } },
    };
  }
};
