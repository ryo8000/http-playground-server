import type { Server } from 'node:http';
import { gracefulShutdown, setServerInstance, resetShutdownState } from '../../../src/utils/shutdown.js';

// Mock the logger
jest.mock('../../../src/logger.js', () => ({
  log: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('shutdown utility', () => {
  let mockServer: jest.Mocked<Server>;
  let mockExit: jest.SpyInstance;
  let mockSetTimeout: jest.SpyInstance;
  let mockClearTimeout: jest.SpyInstance;

  beforeEach(() => {
    // Reset shutdown state
    resetShutdownState();

    // Mock server
    mockServer = {
      close: jest.fn(),
    } as unknown as jest.Mocked<Server>;

    // Mock process.exit
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });

    // Mock setTimeout and clearTimeout
    mockSetTimeout = jest.spyOn(global, 'setTimeout').mockImplementation(() => {
      return 'timeout-id' as unknown as NodeJS.Timeout;
    });

    mockClearTimeout = jest.spyOn(global, 'clearTimeout').mockImplementation(() => {});
  });

  afterEach(() => {
    mockExit.mockRestore();
    mockSetTimeout.mockRestore();
    mockClearTimeout.mockRestore();
    jest.clearAllMocks();
  });

  describe('gracefulShutdown', () => {
    it('should gracefully shutdown when server closes successfully', () => {
      // Mock successful server close
      mockServer.close.mockImplementation((callback) => {
        if (callback) {
          callback();
        }
        return mockServer;
      });

      expect(() => gracefulShutdown(mockServer)).toThrow('process.exit called');
      expect(mockServer.close).toHaveBeenCalledWith(expect.any(Function));
      expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 10_000);
      expect(mockClearTimeout).toHaveBeenCalledWith('timeout-id');
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('should force exit when server close has error', () => {
      const error = new Error('Server close error');

      // Mock server close with error
      mockServer.close.mockImplementation((callback) => {
        if (callback) {
          callback(error);
        }
        return mockServer;
      });

      expect(() => gracefulShutdown(mockServer)).toThrow('process.exit called');
      expect(mockServer.close).toHaveBeenCalledWith(expect.any(Function));
      expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 10_000);
      expect(mockClearTimeout).toHaveBeenCalledWith('timeout-id');
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should use stored server instance when no server provided', () => {
      setServerInstance(mockServer);

      // Mock successful server close
      mockServer.close.mockImplementation((callback) => {
        if (callback) {
          callback();
        }
        return mockServer;
      });

      expect(() => gracefulShutdown()).toThrow('process.exit called');
      expect(mockServer.close).toHaveBeenCalledWith(expect.any(Function));
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it('should exit with error when no server instance available', () => {
      // Don't set server instance
      expect(() => gracefulShutdown()).toThrow('process.exit called');
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should warn and return early if shutdown already in progress', () => {
      // Mock successful server close
      mockServer.close.mockImplementation((callback) => {
        if (callback) {
          callback();
        }
        return mockServer;
      });

      // First call should work
      expect(() => gracefulShutdown(mockServer)).toThrow('process.exit called');

      // Reset mocks to check second call
      jest.clearAllMocks();

      // Second call should warn and return early
      gracefulShutdown(mockServer);
      expect(mockServer.close).not.toHaveBeenCalled();
      expect(mockExit).not.toHaveBeenCalled();
    });
  });

  describe('setServerInstance', () => {
    it('should store the server instance', () => {
      setServerInstance(mockServer);

      // Mock successful server close
      mockServer.close.mockImplementation((callback) => {
        if (callback) {
          callback();
        }
        return mockServer;
      });

      // Should be able to shutdown without passing server
      expect(() => gracefulShutdown()).toThrow('process.exit called');
      expect(mockServer.close).toHaveBeenCalled();
    });
  });
});
