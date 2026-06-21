import express from 'express';
import request from 'supertest';

describe('shutdownRouter', () => {
  let app: express.Express;
  let mockKill: jest.SpyInstance;

  const createApp = async (): Promise<express.Express> => {
    const app = express();
    app.use(express.json());

    jest.resetModules();

    jest.doMock('../../../src/env.js', () => ({
      environment: {
        enableShutdown: mockEnableShutdown,
      },
    }));

    const { shutdownRouter } = await import('../../../src/routes/shutdown.js');
    app.use('/shutdown', shutdownRouter);

    return app;
  };

  let mockEnableShutdown: boolean;

  beforeEach(() => {
    mockKill = jest.spyOn(process, 'kill').mockImplementation(() => true);
  });

  afterEach(() => {
    mockKill.mockRestore();
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
        expect(mockKill).not.toHaveBeenCalled();
      });
    });

    describe('when shutdown is enabled', () => {
      beforeEach(async () => {
        mockEnableShutdown = true;
        app = await createApp();
      });

      it('should return 200 OK and send SIGTERM', async () => {
        const response = await request(app)[method]('/shutdown');
        expect(response.status).toBe(200);
        if (method !== 'head') {
          expect(response.body).toEqual({
            message: 'Server shutting down',
          });
        }
        expect(mockKill).toHaveBeenCalledWith(process.pid, 'SIGTERM');
      });
    });
  });
});
