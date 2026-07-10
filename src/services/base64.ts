import { HttpStatusCodes } from '../utils/http.js';

type Base64EncodeResult =
  | { status: number; body: { encoded: string } }
  | { status: number; body: { error: { message: string } } };

type Base64DecodeResult =
  | { status: number; body: { decoded: string } }
  | { status: number; body: { error: { message: string } } };

/**
 * Creates a 400 Bad Request result for a missing or invalid request body value.
 *
 * @returns A result with BAD_REQUEST status and a descriptive error message.
 */
const missingValue = () => ({
  status: HttpStatusCodes.BAD_REQUEST,
  body: { error: { message: "Missing 'value' in request body or invalid format" } },
});

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
 * @returns A result with the encoded string, or an error response on missing value.
 */
export const encodeBase64 = (body: unknown): Base64EncodeResult => {
  const value = extractValueFromBody(body);

  if (value === null) {
    return missingValue();
  }

  const encoded = Buffer.from(value, 'utf8').toString('base64');
  return { status: HttpStatusCodes.OK, body: { encoded } };
};

/**
 * Decodes a Base64 string extracted from the request body to UTF-8.
 *
 * @param body - The raw request body.
 * @returns A result with the decoded string, or an error response on missing value or invalid format.
 */
export const decodeBase64 = (body: unknown): Base64DecodeResult => {
  const value = extractValueFromBody(body);

  if (value === null) {
    return missingValue();
  }

  const decodedBuffer = Buffer.from(value, 'base64');

  // Validate Base64 format (pad input to canonical form before comparison)
  const rem = value.length % 4;
  const paddedValue = rem === 0 ? value : value + '='.repeat(4 - rem);
  if (decodedBuffer.toString('base64') !== paddedValue) {
    return {
      status: HttpStatusCodes.BAD_REQUEST,
      body: { error: { message: 'Invalid Base64 format' } },
    };
  }

  const decoded = decodedBuffer.toString('utf8');
  return { status: HttpStatusCodes.OK, body: { decoded } };
};
