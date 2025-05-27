import request from 'supertest';
import express from 'express';
import { shutdownRouter } from '../../src/routes/shutdown';
import { environment } from '../../src/env';

const app = express();
app.use(express.json());
app.use('/shutdown', shutdownRouter);

const mockExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
  throw new Error(`process.exit(${code})`);
});

describe('GET /shutdown', () => {
  let mockEnvironment: typeof environment;

  beforeEach(() => {
    mockEnvironment = jest.mocked(environment);
    mockEnvironment.enableShutdown = false;
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('should return 403 Forbidden when shutdown is disabled', async () => {
    mockEnvironment.enableShutdown = false;

    const response = await request(app).post('/shutdown');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      code: 403,
      message: 'Forbidden',
      error: {
        message: 'Shutdown is not enabled',
      },
    });
    expect(mockExit).not.toHaveBeenCalled();
  });

  it('should return 200 OK and attempt to shutdown when shutdown is enabled', async () => {
    mockEnvironment.enableShutdown = true;

    const response = await request(app).post('/shutdown');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: 200,
      message: 'Server shutting down',
    });
    expect(mockExit).toHaveBeenCalledWith(0);
  });
});
