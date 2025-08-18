import type { Server } from 'http';

// Mock timers
jest.useFakeTimers();

describe('shutdown utils', () => {
  let mockServer: jest.Mocked<Server>;
  let mockExit: jest.SpyInstance;
  let mockConsole: {
    warn: jest.SpyInstance;
    info: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(async () => {
    // Clear all timers
    jest.clearAllTimers();

    // Mock server
    mockServer = {
      close: jest.fn(),
    } as unknown as jest.Mocked<Server>;

    // Mock process.exit
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    // Mock console methods
    mockConsole = {
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
    };

    // Clear any global shutdown handler
    const { setGlobalShutdownHandler: initialSetGlobalShutdownHandler } = await import('../../../src/utils/shutdown.js');
    initialSetGlobalShutdownHandler(null as any);

    // Reset the shutdown utility module's state by re-importing
    jest.resetModules();
  });  afterEach(() => {
    mockExit.mockRestore();
    mockConsole.warn.mockRestore();
    mockConsole.info.mockRestore();
    mockConsole.error.mockRestore();
    jest.clearAllTimers();
  });

  describe('gracefulShutdown', () => {
    it('should log shutdown message and close server successfully', async () => {
      const { gracefulShutdown: freshGracefulShutdown } = await import('../../../src/utils/shutdown.js');

      // Mock successful server close
      mockServer.close.mockImplementation((callback) => {
        callback && callback();
        return mockServer;
      });

      expect(() => freshGracefulShutdown(mockServer, 'test')).toThrow('process.exit called');

      expect(mockConsole.info).toHaveBeenCalledWith('test signal received: closing HTTP server');
      expect(mockServer.close).toHaveBeenCalled();
      expect(mockConsole.info).toHaveBeenCalledWith('HTTP server closed');
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('should handle server close error', async () => {
      const { gracefulShutdown: freshGracefulShutdown } = await import('../../../src/utils/shutdown.js');
      const testError = new Error('Server close failed');

      // Mock server close with error
      mockServer.close.mockImplementation((callback) => {
        callback && callback(testError);
        return mockServer;
      });

      expect(() => freshGracefulShutdown(mockServer, 'test')).toThrow('process.exit called');

      expect(mockConsole.error).toHaveBeenCalledWith('Error during server close:', testError);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should prevent multiple shutdown attempts', async () => {
      const { gracefulShutdown: freshGracefulShutdown } = await import('../../../src/utils/shutdown.js');

      // Mock server close that doesn't call callback immediately
      mockServer.close.mockImplementation(() => mockServer);

      // First call should proceed
      try {
        freshGracefulShutdown(mockServer, 'first');
      } catch {
        // Expected to throw due to mock
      }

      expect(mockConsole.info).toHaveBeenCalledWith('first signal received: closing HTTP server');
      expect(mockServer.close).toHaveBeenCalledTimes(1);

      // Second call should be prevented
      expect(() => freshGracefulShutdown(mockServer, 'second')).not.toThrow();

      expect(mockConsole.warn).toHaveBeenCalledWith('Shutdown already in progress...');
      expect(mockServer.close).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should force exit after timeout', async () => {
      const { gracefulShutdown: freshGracefulShutdown } = await import('../../../src/utils/shutdown.js');

      // Mock server close that never calls callback
      mockServer.close.mockImplementation(() => mockServer);

      try {
        freshGracefulShutdown(mockServer, 'timeout test');
      } catch {
        // Expected initial process.exit call, but we'll ignore it
      }

      // Fast-forward time to trigger timeout (10 seconds)
      expect(() => {
        jest.advanceTimersByTime(10000);
      }).toThrow('process.exit called');

      expect(mockConsole.error).toHaveBeenCalledWith('Server close timed out, forcing exit');
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('createShutdownHandler', () => {
    it('should create a function that calls gracefulShutdown', async () => {
      const { createShutdownHandler: freshCreateShutdownHandler } = await import('../../../src/utils/shutdown.js');

      mockServer.close.mockImplementation((callback) => {
        callback && callback();
        return mockServer;
      });

      const handler = freshCreateShutdownHandler(mockServer);

      expect(() => handler('test reason')).toThrow('process.exit called');
      expect(mockConsole.info).toHaveBeenCalledWith('test reason signal received: closing HTTP server');
    });

    it('should use default reason when none provided', async () => {
      const { createShutdownHandler: freshCreateShutdownHandler } = await import('../../../src/utils/shutdown.js');

      mockServer.close.mockImplementation((callback) => {
        callback && callback();
        return mockServer;
      });

      const handler = freshCreateShutdownHandler(mockServer);

      expect(() => handler()).toThrow('process.exit called');
      expect(mockConsole.info).toHaveBeenCalledWith('shutdown signal received: closing HTTP server');
    });
  });

  describe('setGlobalShutdownHandler and triggerShutdown', () => {
    it('should use global handler when set', async () => {
      const { setGlobalShutdownHandler: freshSetGlobalShutdownHandler, triggerShutdown: freshTriggerShutdown } = await import('../../../src/utils/shutdown.js');

      const mockHandler = jest.fn();
      freshSetGlobalShutdownHandler(mockHandler);

      expect(() => freshTriggerShutdown('custom reason')).not.toThrow();

      expect(mockHandler).toHaveBeenCalledWith('custom reason');
      expect(mockExit).not.toHaveBeenCalled();
    });

    it('should fallback to process.exit when no global handler is set', async () => {
      const { triggerShutdown: freshTriggerShutdown } = await import('../../../src/utils/shutdown.js');

      expect(() => freshTriggerShutdown('fallback test')).toThrow('process.exit called');
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('should use default reason when none provided', async () => {
      const { setGlobalShutdownHandler: freshSetGlobalShutdownHandler, triggerShutdown: freshTriggerShutdown } = await import('../../../src/utils/shutdown.js');

      const mockHandler = jest.fn();
      freshSetGlobalShutdownHandler(mockHandler);

      expect(() => freshTriggerShutdown()).not.toThrow();

      expect(mockHandler).toHaveBeenCalledWith('Manual shutdown');
    });
  });
});
