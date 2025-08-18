import express from 'express';
import request from 'supertest';

describe('shutdownRouter', () => {
  let app: express.Express;
  let mockExit: jest.SpyInstance;
  let mockGracefulShutdown: jest.SpyInstance;

  const createApp = async (): Promise<express.Express> => {
    const app = express();
    app.use(express.json());

    jest.resetModules();

    jest.doMock('../../../src/env.js', () => ({
      environment: {
        enableShutdown: mockEnableShutdown,
      },
    }));

    jest.doMock('../../../src/utils/shutdown.js', () => ({
      gracefulShutdown: mockGracefulShutdown,
    }));

    const { shutdownRouter } = await import('../../../src/routes/shutdown.js');
    app.use('/shutdown', shutdownRouter);

    return app;
  };

  let mockEnableShutdown: boolean;

  beforeEach(() => {
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    mockGracefulShutdown = jest.fn();
  });

  afterEach(() => {
    mockExit.mockRestore();
    jest.clearAllMocks();
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
        expect(mockGracefulShutdown).not.toHaveBeenCalled();
      });
    });

    describe('when shutdown is enabled', () => {
      beforeEach(async () => {
        mockEnableShutdown = true;
        app = await createApp();
      });

      it('should return 200 OK and call gracefulShutdown', async () => {
        const response = await request(app)[method]('/shutdown');
        expect(response.status).toBe(200);
        if (method !== 'head') {
          expect(response.body).toEqual({
            message: 'Server shutting down',
          });
        }
        expect(mockGracefulShutdown).toHaveBeenCalledWith();
      });
    });
  });
});
