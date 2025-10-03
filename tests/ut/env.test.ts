describe('Environment configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const loadEnv = async () => {
    const envModule = await import('../../src/env.js');
    return envModule.environment;
  };

  it('should load default values when environment variables are not set', async () => {
    delete process.env.HEADERS_TIMEOUT;
    delete process.env.REQUEST_TIMEOUT;
    delete process.env.KEEP_ALIVE_TIMEOUT;
    delete process.env.ENABLE_SHUTDOWN;
    delete process.env.LOG_LEVEL;
    delete process.env.MAX_DELAY;
    delete process.env.NODE_ENV;
    delete process.env.ORIGIN;
    delete process.env.PORT;

    expect(await loadEnv()).toEqual({
      enableShutdown: false,
      headersTimeout: 10000,
      keepAliveTimeout: 5000,
      logLevel: 'info',
      maxDelay: 10000,
      nodeEnv: 'development',
      origin: '*',
      port: 8000,
      requestTimeout: 30000,
    });
  });

  it('should throw an error if headersTimeout <= keepAliveTimeout', async () => {
    process.env.HEADERS_TIMEOUT = '4000';
    process.env.KEEP_ALIVE_TIMEOUT = '5000';

    await expect(loadEnv()).rejects.toThrow(
      /headersTimeout \(4000ms\) must be greater than keepAliveTimeout \(5000ms\)/,
    );
  });

  it('should throw an error if requestTimeout <= headersTimeout', async () => {
    process.env.HEADERS_TIMEOUT = '10000';
    process.env.REQUEST_TIMEOUT = '9000';

    await expect(loadEnv()).rejects.toThrow(
      /requestTimeout \(9000ms\) must be greater than headersTimeout \(10000ms\)/,
    );
  });

  it('should correctly load values from environment variables', async () => {
    process.env.HEADERS_TIMEOUT = '11000';
    process.env.REQUEST_TIMEOUT = '40000';
    process.env.KEEP_ALIVE_TIMEOUT = '5000';
    process.env.ENABLE_SHUTDOWN = 'true';
    process.env.LOG_LEVEL = 'debug';
    process.env.MAX_DELAY = '15000';
    process.env.NODE_ENV = 'production';
    process.env.ORIGIN = 'https://example.com';
    process.env.PORT = '9000';

    expect(await loadEnv()).toEqual({
      enableShutdown: true,
      headersTimeout: 11000,
      keepAliveTimeout: 5000,
      logLevel: 'debug',
      maxDelay: 15000,
      nodeEnv: 'production',
      origin: 'https://example.com',
      port: 9000,
      requestTimeout: 40000,
    });
  });
});
