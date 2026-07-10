import express from 'express';
import request from 'supertest';

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('shutdownRouter', () => {
  let app: express.Express;
  let mockKill: jest.SpyInstance;
  let mockEnableShutdown: boolean;

  const createApp = async (): Promise<express.Express> => {
    const newApp = express();
    newApp.use(express.json());

    jest.resetModules();

    jest.doMock('../../../src/env.js', () => ({
      environment: {
        enableShutdown: mockEnableShutdown,
      },
    }));

    const { shutdownRouter } = await import('../../../src/routes/shutdown.js');
    newApp.use('/shutdown', shutdownRouter);

    return newApp;
  };

  beforeEach(() => {
    mockKill = jest.spyOn(process, 'kill').mockImplementation(() => true);
  });

  afterEach(() => {
    mockKill.mockRestore();
  });

  describe('when shutdown is disabled', () => {
    beforeEach(async () => {
      mockEnableShutdown = false;
      app = await createApp();
    });

    it.each(HTTP_METHODS)('should return 403 via %s', async (method) => {
      const response = await request(app)[method]('/shutdown');
      expect(response.status).toBe(403);
      if (method !== 'head') {
        expect(response.body).toEqual({ error: { message: 'Shutdown is not enabled' } });
      }
      expect(mockKill).not.toHaveBeenCalled();
    });
  });

  describe('when shutdown is enabled', () => {
    beforeEach(async () => {
      mockEnableShutdown = true;
      app = await createApp();
    });

    it.each(HTTP_METHODS)('should return 200 and send SIGTERM via %s', async (method) => {
      const response = await request(app)[method]('/shutdown');
      expect(response.status).toBe(200);
      if (method !== 'head') {
        expect(response.body).toEqual({ message: 'Server shutting down' });
      }
      expect(mockKill).toHaveBeenCalledWith(process.pid, 'SIGTERM');
    });
  });
});
