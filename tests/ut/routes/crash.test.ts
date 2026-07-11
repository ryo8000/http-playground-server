import express from 'express';
import request from 'supertest';

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

describe('crashRouter', () => {
  let app: express.Express;
  let mockExit: jest.SpyInstance;
  let mockEnableCrash: boolean;

  const createApp = async (): Promise<express.Express> => {
    const newApp = express();
    newApp.use(express.json());

    jest.resetModules();

    jest.doMock('../../../src/env.js', () => ({
      environment: {
        enableCrash: mockEnableCrash,
      },
    }));

    const { crashRouter } = await import('../../../src/routes/crash.js');
    newApp.use('/crash', crashRouter);

    return newApp;
  };

  beforeEach(() => {
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    mockExit.mockRestore();
  });

  describe('when crashing is disabled', () => {
    beforeEach(async () => {
      mockEnableCrash = false;
      app = await createApp();
    });

    it.each(HTTP_METHODS)('should return 403 Forbidden via %s', async (method) => {
      const response = await request(app)[method]('/crash');
      expect(response.status).toBe(403);
      if (method !== 'head') {
        expect(response.body).toEqual({ error: { message: 'Crash is not enabled' } });
      }
      expect(mockExit).not.toHaveBeenCalled();
    });
  });

  describe('when crashing is enabled', () => {
    beforeEach(async () => {
      mockEnableCrash = true;
      app = await createApp();
    });

    it.each(HTTP_METHODS)('should return 200 OK and exit the process via %s', async (method) => {
      const response = await request(app)[method]('/crash');
      expect(response.status).toBe(200);
      if (method !== 'head') {
        expect(response.body).toEqual({ message: 'Server crashing' });
      }
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
});
