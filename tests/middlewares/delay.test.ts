import { Request, Response, NextFunction } from 'express';
import { delayMiddleware } from '../../src/middlewares/delay';

describe('delayMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
  });

  it('should delay the specified amount of time', async () => {
    const delay = 100;
    mockRequest.query = { delay: delay.toString() };
    const start = Date.now();

    await delayMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    const duration = Date.now() - start;

    expect(duration).toBeGreaterThanOrEqual(delay);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should call next() immediately when no delay is specified', async () => {
    await delayMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should ignore invalid delay values', async () => {
    mockRequest.query = { delay: 'invalid' };
    await delayMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
