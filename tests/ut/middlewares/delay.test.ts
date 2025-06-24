import { Request, Response, NextFunction } from 'express';
import { delayMiddleware } from '../../../src/middlewares/delay.js';
import { environment } from '../../../src/env.js';

describe('delayMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const originalMaxDelay = environment.maxDelay;

  beforeAll(() => {
    environment.maxDelay = 500;
  });

  afterAll(() => {
    environment.maxDelay = originalMaxDelay;
  });

  beforeEach(() => {
    mockRequest = { query: {} };
    mockResponse = {};
    mockNext = jest.fn();
  });

  const executeMiddleware = async (delayValue?: string): Promise<number> => {
    if (delayValue !== undefined) {
      mockRequest.query = { delay: delayValue };
    }
    const start = Date.now();
    await delayMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    return Date.now() - start;
  };

  const expectNoDelay = (duration: number): void => {
    expect(duration).toBeLessThan(50);
  };

  describe('with valid delay values', () => {
    it('should delay the specified amount of time', async () => {
      const delay = 100;
      const duration = await executeMiddleware(delay.toString());

      expect(duration).toBeGreaterThanOrEqual(delay);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it(
      'should respect maximum delay limit',
      async () => {
        const excessiveDelay = environment.maxDelay + 100;
        const duration = await executeMiddleware(excessiveDelay.toString());

        expect(duration).toBeGreaterThanOrEqual(environment.maxDelay);
        expect(duration).toBeLessThan(environment.maxDelay + 50);
        expect(mockNext).toHaveBeenCalledTimes(1);
      },
      environment.maxDelay + 500
    );
  });

  describe('with no delay specified', () => {
    it('should call next() immediately', async () => {
      const duration = await executeMiddleware();

      expectNoDelay(duration);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('with invalid delay values', () => {
    const invalidDelayTestCases = [
      { value: undefined, description: 'no delay specified' },
      { value: 'invalid', description: 'non-numeric string' },
      { value: '-100', description: 'negative number' },
      { value: '0', description: 'zero' },
      { value: '100.5', description: 'non-integer numeric string' },
      { value: '1e2', description: 'scientific notation' },
      { value: '', description: 'empty string' },
      { value: ' ', description: 'whitespace only' },
    ] as const;

    it.each(invalidDelayTestCases)(
      'should ignore $description ($value) and call next() immediately',
      async ({ value }) => {
        const duration = await executeMiddleware(value);

        expectNoDelay(duration);
        expect(mockNext).toHaveBeenCalledTimes(1);
      }
    );
  });
});
