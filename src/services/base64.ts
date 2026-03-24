import { HttpStatusCodes } from '../utils/http.js';

type Base64EncodeResult = {
  status: number;
  body: { encoded: string } | { error: { message: string } };
};

type Base64DecodeResult = {
  status: number;
  body: { decoded: string } | { error: { message: string } };
};

/**
 * Extracts value from request body, handling different content types
 * @param body - Express request body
 * @returns The extracted string value or null if invalid
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
 * Encodes a value from the request body to Base64.
 *
 * @param body - The raw request body.
 * @returns A result with the encoded string, or failure with an error body.
 */
export function base64Encode(body: unknown): Base64EncodeResult {
  const valueToEncode = extractValueFromBody(body);

  if (valueToEncode === null) {
    return {
      status: HttpStatusCodes.BAD_REQUEST,
      body: { error: { message: "Missing 'value' in request body or invalid format" } },
    };
  }

  const encoded = Buffer.from(valueToEncode, 'utf8').toString('base64');
  return { status: HttpStatusCodes.OK, body: { encoded } };
}

/**
 * Decodes a Base64 value from the request body.
 *
 * @param body - The raw request body.
 * @returns A result with the decoded string, or failure with an error body.
 */
export function base64Decode(body: unknown): Base64DecodeResult {
  const valueToDecode = extractValueFromBody(body);

  if (valueToDecode === null) {
    return {
      status: HttpStatusCodes.BAD_REQUEST,
      body: { error: { message: "Missing 'value' in request body or invalid format" } },
    };
  }

  const decodedBuffer = Buffer.from(valueToDecode, 'base64');

  // Validate Base64 format
  if (decodedBuffer.toString('base64') !== valueToDecode) {
    return {
      status: HttpStatusCodes.BAD_REQUEST,
      body: { error: { message: 'Invalid Base64 format' } },
    };
  }

  const decoded = decodedBuffer.toString('utf8');
  return { status: HttpStatusCodes.OK, body: { decoded } };
}
