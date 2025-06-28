import request from 'supertest';
import { app } from '../../../src/app.js';

describe('Base64 Encoding/Decoding', () => {
  describe('POST /base64/encode', () => {
    it('should encode JSON body value to Base64', async () => {
      const testData = { value: 'Hello, World!' };
      const response = await request(app).post('/base64/encode').send(testData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('encoded');
      expect(response.body.encoded).toBe('SGVsbG8sIFdvcmxkIQ==');
    });

    it('should encode plain text body to Base64', async () => {
      const response = await request(app)
        .post('/base64/encode')
        .set('Content-Type', 'text/plain')
        .send('Hello, World!');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('encoded');
      expect(response.body.encoded).toBe('SGVsbG8sIFdvcmxkIQ==');
    });

    it('should return 400 for missing value', async () => {
      const response = await request(app).post('/base64/encode').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain("Missing 'value'");
    });

    it('should encode empty string', async () => {
      const response = await request(app).post('/base64/encode').send({ value: '' });

      expect(response.status).toBe(200);
      expect(response.body.encoded).toBe('');
    });

    it('should encode special characters', async () => {
      const testData = { value: '🚀 Hello! @#$%^&*()' };
      const response = await request(app).post('/base64/encode').send(testData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('encoded');

      // Verify it can be decoded back
      const decoded = Buffer.from(response.body.encoded, 'base64').toString('utf8');
      expect(decoded).toBe('🚀 Hello! @#$%^&*()');
    });
  });

  describe('POST /base64/decode', () => {
    it('should decode JSON body value from Base64', async () => {
      const testData = { value: 'SGVsbG8sIFdvcmxkIQ==' };
      const response = await request(app).post('/base64/decode').send(testData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('decoded');
      expect(response.body.decoded).toBe('Hello, World!');
    });

    it('should decode plain text body from Base64', async () => {
      const response = await request(app)
        .post('/base64/decode')
        .set('Content-Type', 'text/plain')
        .send('SGVsbG8sIFdvcmxkIQ==');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('decoded');
      expect(response.body.decoded).toBe('Hello, World!');
    });

    it('should return 400 for missing value', async () => {
      const response = await request(app).post('/base64/decode').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toContain("Missing 'value'");
    });

    it('should return 400 for invalid Base64', async () => {
      const response = await request(app).post('/base64/decode').send({ value: 'invalid-base64!' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('Invalid Base64 format');
    });

    it('should decode empty Base64 string', async () => {
      const response = await request(app).post('/base64/decode').send({ value: '' });

      expect(response.status).toBe(200);
      expect(response.body.decoded).toBe('');
    });

    it('should decode special characters', async () => {
      // Base64 for '🚀 Hello! @#$%^&*()'
      const base64Value = '8J+agCBIZWxsbyEgQCMkJV4mKigp';
      const response = await request(app).post('/base64/decode').send({ value: base64Value });

      expect(response.status).toBe(200);
      expect(response.body.decoded).toBe('🚀 Hello! @#$%^&*()');
    });
  });

  describe('Roundtrip encoding/decoding', () => {
    it('should encode and decode back to original value', async () => {
      const originalValue = 'Test string with special chars: 🎉 @#$%';

      // Encode
      const encodeResponse = await request(app)
        .post('/base64/encode')
        .send({ value: originalValue });

      expect(encodeResponse.status).toBe(200);
      const encodedValue = encodeResponse.body.encoded;

      // Decode
      const decodeResponse = await request(app)
        .post('/base64/decode')
        .send({ value: encodedValue });

      expect(decodeResponse.status).toBe(200);
      expect(decodeResponse.body.decoded).toBe(originalValue);
    });
  });
});
