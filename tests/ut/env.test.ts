describe('Environment configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const loadEnv = () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('../../src/env').environment;
  };

  it('should load default values when environment variables are not set', () => {
    delete process.env.HEADERS_TIMEOUT;
    delete process.env.REQUEST_TIMEOUT;
    delete process.env.KEEP_ALIVE_TIMEOUT;
    delete process.env.ENABLE_SHUTDOWN;
    delete process.env.LOG_LEVEL;
    delete process.env.NODE_ENV;
    delete process.env.ORIGIN;
    delete process.env.PORT;

    expect(loadEnv()).toEqual({
      enableShutdown: false,
      headersTimeout: 10000,
      keepAliveTimeout: 5000,
      logLevel: 'info',
      nodeEnv: 'development',
      origin: '*',
      port: 8000,
      requestTimeout: 30000,
    });
  });

  it('should throw an error if headersTimeout <= keepAliveTimeout', () => {
    process.env.HEADERS_TIMEOUT = '4000';
    process.env.KEEP_ALIVE_TIMEOUT = '5000';

    expect(() => loadEnv()).toThrow(
      /headersTimeout \(4000ms\) must be greater than keepAliveTimeout \(5000ms\)/
    );
  });

  it('should throw an error if requestTimeout <= headersTimeout', () => {
    process.env.HEADERS_TIMEOUT = '10000';
    process.env.REQUEST_TIMEOUT = '9000';

    expect(() => loadEnv()).toThrow(
      /requestTimeout \(9000ms\) must be greater than headersTimeout \(10000ms\)/
    );
  });

  it('should correctly load values from environment variables', () => {
    process.env.HEADERS_TIMEOUT = '11000';
    process.env.REQUEST_TIMEOUT = '40000';
    process.env.KEEP_ALIVE_TIMEOUT = '5000';
    process.env.ENABLE_SHUTDOWN = 'true';
    process.env.LOG_LEVEL = 'debug';
    process.env.NODE_ENV = 'production';
    process.env.ORIGIN = 'https://example.com';
    process.env.PORT = '9000';

    expect(loadEnv()).toEqual({
      enableShutdown: true,
      headersTimeout: 11000,
      keepAliveTimeout: 5000,
      logLevel: 'debug',
      nodeEnv: 'production',
      origin: 'https://example.com',
      port: 9000,
      requestTimeout: 40000,
    });
  });
});
