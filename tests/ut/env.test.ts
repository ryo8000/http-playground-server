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
    delete process.env.NODE_ENV;
    delete process.env.LOG_LEVEL;
    delete process.env.PORT;
    delete process.env.KEEP_ALIVE_TIMEOUT;
    delete process.env.HEADERS_TIMEOUT;
    delete process.env.REQUEST_TIMEOUT;
    delete process.env.ORIGIN;
    delete process.env.MAX_DELAY;
    delete process.env.ENABLE_CRASH;
    delete process.env.ENABLE_SHUTDOWN;

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

  it('should correctly load values from environment variables', async () => {
    process.env.NODE_ENV = 'production';
    process.env.LOG_LEVEL = 'debug';
    process.env.PORT = '9000';
    process.env.KEEP_ALIVE_TIMEOUT = '5000';
    process.env.HEADERS_TIMEOUT = '11000';
    process.env.REQUEST_TIMEOUT = '40000';
    process.env.ORIGIN = 'https://example.com';
    process.env.MAX_DELAY = '15000';
    process.env.ENABLE_CRASH = 'true';
    process.env.ENABLE_SHUTDOWN = 'true';

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

  it('should fall back to the default value if an integer variable is empty', async () => {
    process.env.PORT = '';

    expect((await loadEnv()).port).toBe(8000);
  });

  it('should accept 0 for integer variables', async () => {
    process.env.PORT = '0';
    process.env.KEEP_ALIVE_TIMEOUT = '0';
    process.env.HEADERS_TIMEOUT = '0';
    process.env.REQUEST_TIMEOUT = '0';
    process.env.MAX_DELAY = '0';

    expect(await loadEnv()).toMatchObject({
      headersTimeout: 0,
      keepAliveTimeout: 0,
      maxDelay: 0,
      port: 0,
      requestTimeout: 0,
    });
  });

  it('should accept integer variables at their largest allowed values', async () => {
    process.env.PORT = '65535';
    process.env.KEEP_ALIVE_TIMEOUT = String(2 ** 31 - 1 - 1000);
    process.env.HEADERS_TIMEOUT = String(Number.MAX_SAFE_INTEGER);
    process.env.REQUEST_TIMEOUT = String(Number.MAX_SAFE_INTEGER);
    process.env.MAX_DELAY = String(2 ** 31 - 1);

    expect(await loadEnv()).toMatchObject({
      headersTimeout: Number.MAX_SAFE_INTEGER,
      keepAliveTimeout: 2 ** 31 - 1 - 1000,
      maxDelay: 2 ** 31 - 1,
      port: 65535,
      requestTimeout: Number.MAX_SAFE_INTEGER,
    });
  });

  it('should skip the timeout ordering check if REQUEST_TIMEOUT is 0', async () => {
    process.env.HEADERS_TIMEOUT = '10000';
    process.env.REQUEST_TIMEOUT = '0';

    expect(await loadEnv()).toMatchObject({ headersTimeout: 10000, requestTimeout: 0 });
  });

  it.each(['abc', '-1', '65536'])('should throw an error if PORT is %j', async (value) => {
    process.env.PORT = value;

    await expect(loadEnv()).rejects.toThrow(`PORT=${JSON.stringify(value)}`);
  });

  it.each([
    ['KEEP_ALIVE_TIMEOUT', 2 ** 31 - 1 - 1000],
    ['MAX_DELAY', 2 ** 31 - 1],
  ])('should throw an error if %s exceeds %d', async (name, max) => {
    process.env[name] = String(max + 1);

    await expect(loadEnv()).rejects.toThrow(
      `${name}="${max + 1}" must be an integer between 0 and ${max}`,
    );
  });

  it('should throw an error if HEADERS_TIMEOUT > a nonzero REQUEST_TIMEOUT', async () => {
    process.env.HEADERS_TIMEOUT = '10000';
    process.env.REQUEST_TIMEOUT = '9999';

    await expect(loadEnv()).rejects.toThrow(
      'HEADERS_TIMEOUT=10000 must be less than or equal to REQUEST_TIMEOUT=9999 unless either is 0',
    );
  });

  it('should skip the timeout ordering check if REQUEST_TIMEOUT is invalid', async () => {
    process.env.HEADERS_TIMEOUT = '10000';
    process.env.REQUEST_TIMEOUT = '-1';

    await expect(loadEnv()).rejects.toThrow(
      new Error(
        'Invalid environment configuration:\n' +
          `  - REQUEST_TIMEOUT="-1" must be an integer between 0 and ${Number.MAX_SAFE_INTEGER}`,
      ),
    );
  });

  it('should report all errors at once', async () => {
    process.env.PORT = 'abc';
    process.env.HEADERS_TIMEOUT = '10000';
    process.env.REQUEST_TIMEOUT = '9999';

    await expect(loadEnv()).rejects.toThrow(
      new Error(
        'Invalid environment configuration:\n' +
          '  - PORT="abc" must be an integer between 0 and 65535\n' +
          '  - HEADERS_TIMEOUT=10000 must be less than or equal to REQUEST_TIMEOUT=9999 unless either is 0',
      ),
    );
  });
});
