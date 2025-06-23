import { Request, Response, NextFunction } from 'express';
import { delayMiddleware } from '../../../src/middlewares/delay.js';

describe('delayMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const measureExecutionTime = async (request: Partial<Request>): Promise<number> => {
    const start = Date.now();
    await delayMiddleware(request as Request, mockResponse as Response, mockNext);
    return Date.now() - start;
  };

  beforeEach(() => {
    mockRequest = {
      query: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  describe('with valid delay values', () => {
    it('should delay the specified amount of time', async () => {
      const delayMs = 500;
      mockRequest.query = { delay: delayMs.toString() };
      const duration = await measureExecutionTime(mockRequest);

      expect(duration).toBeGreaterThanOrEqual(delayMs);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('with no delay specified', () => {
    it('should call next() immediately', async () => {
      const duration = await measureExecutionTime(mockRequest);

      expect(duration).toBeLessThan(50);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('with invalid delay values', () => {
    const invalidDelayValues = [
      { value: undefined, description: 'no delay specified' },
      { value: 'invalid', description: 'non-numeric string' },
      { value: '-100', description: 'negative number' },
      { value: '0', description: 'zero' },
      { value: '100.5', description: 'non-integer numeric string' },
      { value: '1e2', description: 'scientific notation' },
      { value: '', description: 'empty string' },
      { value: ' ', description: 'whitespace only' },
    ];

    it.each(invalidDelayValues)(
      'should ignore $description ($value) and call next() immediately',
      async ({ value }) => {
        mockRequest.query = { delay: value };
        const duration = await measureExecutionTime(mockRequest);

        expect(duration).toBeLessThan(50);
        expect(mockNext).toHaveBeenCalledTimes(1);
      }
    );
  });
});
