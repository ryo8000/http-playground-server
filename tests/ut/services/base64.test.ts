import { encodeBase64, decodeBase64 } from '../../../src/services/base64.js';

describe('encodeBase64', () => {
  describe('valid body', () => {
    it('should encode a string from object body', () => {
      const result = encodeBase64({ value: 'Hello, World!' });
      expect(result).toEqual({ status: 200, body: { encoded: 'SGVsbG8sIFdvcmxkIQ==' } });
    });

    it('should encode a plain string body', () => {
      const result = encodeBase64('Hello, World!');
      expect(result).toEqual({ status: 200, body: { encoded: 'SGVsbG8sIFdvcmxkIQ==' } });
    });

    it('should encode an empty string', () => {
      const result = encodeBase64({ value: '' });
      expect(result).toEqual({ status: 200, body: { encoded: '' } });
    });

    it('should encode special characters', () => {
      const expected = Buffer.from('🚀 Hello!', 'utf8').toString('base64');
      const result = encodeBase64({ value: '🚀 Hello!' });
      expect(result).toEqual({ status: 200, body: { encoded: expected } });
    });
  });

  describe('invalid body', () => {
    it.each([
      { body: {}, reason: 'missing value in object body' },
      { body: null, reason: 'null body' },
      { body: 42, reason: 'numeric body' },
      { body: { value: 123 }, reason: 'value is not a string' },
    ])('should return 400 for $reason', ({ body }) => {
      const result = encodeBase64(body);
      expect(result).toEqual({
        status: 400,
        body: { error: { message: "Missing 'value' in request body or invalid format" } },
      });
    });
  });
});

describe('decodeBase64', () => {
  describe('valid body', () => {
    it('should decode a Base64 string from object body', () => {
      const result = decodeBase64({ value: 'SGVsbG8sIFdvcmxkIQ==' });
      expect(result).toEqual({ status: 200, body: { decoded: 'Hello, World!' } });
    });

    it('should decode a plain Base64 string body', () => {
      const result = decodeBase64('SGVsbG8sIFdvcmxkIQ==');
      expect(result).toEqual({ status: 200, body: { decoded: 'Hello, World!' } });
    });

    it('should decode an empty string', () => {
      const result = decodeBase64({ value: '' });
      expect(result).toEqual({ status: 200, body: { decoded: '' } });
    });

    it('should decode special characters', () => {
      const encoded = Buffer.from('🚀 Hello!', 'utf8').toString('base64');
      const result = decodeBase64({ value: encoded });
      expect(result).toEqual({ status: 200, body: { decoded: '🚀 Hello!' } });
    });

    it('should decode unpadded Base64', () => {
      // 'Hello' encodes to 'SGVsbG8=' but unpadded form 'SGVsbG8' is also valid
      const result = decodeBase64({ value: 'SGVsbG8' });
      expect(result).toEqual({ status: 200, body: { decoded: 'Hello' } });
    });
  });

  describe('invalid body', () => {
    it('should return 400 for invalid Base64 format', () => {
      const result = decodeBase64({ value: 'invalid-base64!' });
      expect(result).toEqual({
        status: 400,
        body: { error: { message: 'Invalid Base64 format' } },
      });
    });

    it.each([
      { body: {}, reason: 'missing value in object body' },
      { body: null, reason: 'null body' },
      { body: 42, reason: 'numeric body' },
      { body: { value: 123 }, reason: 'value is not a string' },
    ])('should return 400 for $reason', ({ body }) => {
      const result = decodeBase64(body);
      expect(result).toEqual({
        status: 400,
        body: { error: { message: "Missing 'value' in request body or invalid format" } },
      });
    });
  });

  it('should encode and decode back to the original value', () => {
    const original = 'Test string with special chars: 🎉 @#$%';
    const encodeResult = encodeBase64({ value: original });
    expect(encodeResult.status).toBe(200);
    const encoded = (encodeResult.body as { encoded: string }).encoded;

    const decodeResult = decodeBase64({ value: encoded });
    expect(decodeResult).toEqual({ status: 200, body: { decoded: original } });
  });
});
