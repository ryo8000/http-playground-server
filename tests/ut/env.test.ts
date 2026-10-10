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
    delete process.env.ENABLE_CRASH;
    delete process.env.ENABLE_SHUTDOWN;
    delete process.env.LOG_LEVEL;
    delete process.env.MAX_DELAY;
    delete process.env.NODE_ENV;
    delete process.env.ORIGIN;
    delete process.env.PORT;

    expect(await loadEnv()).toEqual({
      enableCrash: false,
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

  it.each(['0', ''])(
    'should fall back to the default value if an integer variable is %j',
    async (value) => {
      process.env.PORT = value;

      expect((await loadEnv()).port).toBe(8000);
    },
  );

  it.each(['abc', '-1', '65536'])('should throw an error if PORT is %j', async (value) => {
    process.env.PORT = value;

    await expect(loadEnv()).rejects.toThrow(`PORT=${JSON.stringify(value)}`);
  });

  it('should accept integer variables at their largest allowed values', async () => {
    process.env.KEEP_ALIVE_TIMEOUT = String(2 ** 31 - 1 - 1000);
    process.env.HEADERS_TIMEOUT = String(Number.MAX_SAFE_INTEGER - 1);
    process.env.REQUEST_TIMEOUT = String(Number.MAX_SAFE_INTEGER);
    process.env.MAX_DELAY = String(2 ** 31 - 1);
    process.env.PORT = '65535';

    expect(await loadEnv()).toMatchObject({
      headersTimeout: Number.MAX_SAFE_INTEGER - 1,
      keepAliveTimeout: 2 ** 31 - 1 - 1000,
      maxDelay: 2 ** 31 - 1,
      port: 65535,
      requestTimeout: Number.MAX_SAFE_INTEGER,
    });
  });

  it('should throw an error if HEADERS_TIMEOUT <= KEEP_ALIVE_TIMEOUT', async () => {
    process.env.HEADERS_TIMEOUT = '5000';
    process.env.KEEP_ALIVE_TIMEOUT = '5000';

    await expect(loadEnv()).rejects.toThrow(
      'HEADERS_TIMEOUT=5000 must be greater than KEEP_ALIVE_TIMEOUT=5000',
    );
  });

  it('should throw an error if REQUEST_TIMEOUT <= HEADERS_TIMEOUT', async () => {
    process.env.HEADERS_TIMEOUT = '10000';
    process.env.REQUEST_TIMEOUT = '10000';

    await expect(loadEnv()).rejects.toThrow(
      'REQUEST_TIMEOUT=10000 must be greater than HEADERS_TIMEOUT=10000',
    );
  });

  it('should skip timeout ordering checks against an invalid value', async () => {
    process.env.KEEP_ALIVE_TIMEOUT = String(2 ** 31 - 1 - 1000 + 1);
    process.env.HEADERS_TIMEOUT = '10000';

    await expect(loadEnv()).rejects.toThrow(
      new Error(
        'Invalid environment configuration:\n' +
          `  - KEEP_ALIVE_TIMEOUT="${2 ** 31 - 1 - 1000 + 1}" must be an integer between 1 and ${2 ** 31 - 1 - 1000}, or 0 for the default`,
      ),
    );
  });

  it('should report all errors at once', async () => {
    process.env.PORT = 'abc';
    process.env.HEADERS_TIMEOUT = '5000';
    process.env.KEEP_ALIVE_TIMEOUT = '5000';

    await expect(loadEnv()).rejects.toThrow(
      new Error(
        'Invalid environment configuration:\n' +
          '  - PORT="abc" must be an integer between 1 and 65535, or 0 for the default\n' +
          '  - HEADERS_TIMEOUT=5000 must be greater than KEEP_ALIVE_TIMEOUT=5000',
      ),
    );
  });

  it('should correctly load values from environment variables', async () => {
    process.env.HEADERS_TIMEOUT = '11000';
    process.env.REQUEST_TIMEOUT = '40000';
    process.env.KEEP_ALIVE_TIMEOUT = '5000';
    process.env.ENABLE_CRASH = 'true';
    process.env.ENABLE_SHUTDOWN = 'true';
    process.env.LOG_LEVEL = 'debug';
    process.env.MAX_DELAY = '15000';
    process.env.NODE_ENV = 'production';
    process.env.ORIGIN = 'https://example.com';
    process.env.PORT = '9000';

    expect(await loadEnv()).toEqual({
      enableCrash: true,
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
