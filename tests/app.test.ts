import request from 'supertest';
import { app } from '../src/app';

describe('App', () => {
  describe('GET /', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /mirror', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/mirror');
      expect(response.status).toBe(200);
    });
  });

  describe('GET /request', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/request');
      expect(response.status).toBe(200);
    });
  });

  describe('POST /shutdown', () => {
    it('should return 403 when shutdown is not enabled', async () => {
      const response = await request(app).post('/shutdown');
      expect(response.status).toBe(403);
    });
  });

  describe('GET /status', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/status/200');
      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        code: 404,
        message: 'Not Found',
        error: {
          message: 'Resource not found',
        },
      });
    });

    it('should return 500 for server errors', async () => {
      const response = await request(app).get('/error');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        code: 500,
        message: 'Internal Server Error',
        error: {
          message: 'An unexpected error has occurred.',
        }
      });
    });
  });
});
