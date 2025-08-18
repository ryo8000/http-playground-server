import express from 'express';
import request from 'supertest';

describe('shutdownRouter', () => {
  let app: express.Express;
  let mockExit: jest.SpyInstance;
  let mockTriggerShutdown: jest.SpyInstance;

  const createApp = async (): Promise<express.Express> => {
    const app = express();
    app.use(express.json());

    jest.resetModules();

    jest.doMock('../../../src/env.js', () => ({
      environment: {
        enableShutdown: mockEnableShutdown,
      },
    }));

    // Mock the triggerShutdown function
    jest.doMock('../../../src/utils/shutdown.js', () => ({
      triggerShutdown: mockTriggerShutdown,
    }));

    const { shutdownRouter } = await import('../../../src/routes/shutdown.js');
    app.use('/shutdown', shutdownRouter);

    return app;
  };

  let mockEnableShutdown: boolean;

  beforeEach(() => {
    // Mock process.exit for fallback scenarios
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    // Mock triggerShutdown
    mockTriggerShutdown = jest.fn();
  });

  afterEach(() => {
    mockExit.mockRestore();
    mockTriggerShutdown.mockRestore();
  });

  const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

  describe.each(httpMethods)('%s method', (method) => {
    describe('when shutdown is disabled', () => {
      beforeEach(async () => {
        mockEnableShutdown = false;
        app = await createApp();
      });

      it('should return 403 Forbidden', async () => {
        const response = await request(app)[method]('/shutdown');
        expect(response.status).toBe(403);
        if (method !== 'head') {
          expect(response.body).toEqual({
            error: {
              message: 'Shutdown is not enabled',
            },
          });
        }
        expect(mockTriggerShutdown).not.toHaveBeenCalled();
        expect(mockExit).not.toHaveBeenCalled();
      });
    });

    describe('when shutdown is enabled', () => {
      beforeEach(async () => {
        mockEnableShutdown = true;
        app = await createApp();
      });

      it('should return 200 OK and trigger shutdown', async () => {
        const response = await request(app)[method]('/shutdown');
        expect(response.status).toBe(200);
        if (method !== 'head') {
          expect(response.body).toEqual({
            message: 'Server shutting down',
          });
        }
        expect(mockTriggerShutdown).toHaveBeenCalledWith('Manual shutdown');
      });
    });
  });
});
