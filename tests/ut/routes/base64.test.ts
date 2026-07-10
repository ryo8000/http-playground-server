import express from 'express';
import request from 'supertest';
import { base64Router } from '../../../src/routes/base64.js';

const app = express();
app.use(express.text());
app.use(express.json());
app.use('/base64', base64Router);

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'options'] as const;

describe('base64Router', () => {
  describe('encode', () => {
    it.each(HTTP_METHODS)('should encode JSON body to Base64 via %s', async (method) => {
      const response = await request(app)
        [method]('/base64/encode')
        .send({ value: 'Hello, World!' });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ encoded: 'SGVsbG8sIFdvcmxkIQ==' });
    });

    it.each(HTTP_METHODS)('should encode plain text body to Base64 via %s', async (method) => {
      const response = await request(app)
        [method]('/base64/encode')
        .set('Content-Type', 'text/plain')
        .send('Hello, World!');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ encoded: 'SGVsbG8sIFdvcmxkIQ==' });
    });

    it.each(HTTP_METHODS)('should return 400 for missing value via %s', async (method) => {
      const response = await request(app)[method]('/base64/encode').send({});
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: { message: "Missing 'value' in request body or invalid format" },
      });
    });

    it('should return 400 for head', async () => {
      const response = await request(app).head('/base64/encode');
      expect(response.status).toBe(400);
    });
  });

  describe('decode', () => {
    it.each(HTTP_METHODS)('should decode JSON body from Base64 via %s', async (method) => {
      const response = await request(app)
        [method]('/base64/decode')
        .send({ value: 'SGVsbG8sIFdvcmxkIQ==' });
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ decoded: 'Hello, World!' });
    });

    it.each(HTTP_METHODS)('should decode plain text body from Base64 via %s', async (method) => {
      const response = await request(app)
        [method]('/base64/decode')
        .set('Content-Type', 'text/plain')
        .send('SGVsbG8sIFdvcmxkIQ==');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ decoded: 'Hello, World!' });
    });

    it.each(HTTP_METHODS)('should return 400 for missing value via %s', async (method) => {
      const response = await request(app)[method]('/base64/decode').send({});
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: { message: "Missing 'value' in request body or invalid format" },
      });
    });

    it('should return 400 for head', async () => {
      const response = await request(app).head('/base64/decode');
      expect(response.status).toBe(400);
    });
  });
});
