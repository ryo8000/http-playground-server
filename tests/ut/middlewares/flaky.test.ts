import { Request, Response, NextFunction } from 'express';
import { flakyMiddleware } from '../../../src/middlewares/flaky.js';

describe('flakyMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRequest = { query: {} };
    mockResponse = { status: statusMock as unknown as Response['status'] };
    mockNext = jest.fn();
  });

  it('should call next() when the flaky parameter is absent', () => {
    flakyMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should call next() when flaky is 0', () => {
    mockRequest.query = { flaky: '0' };

    flakyMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should respond with 500 when flaky is 1', () => {
    mockRequest.query = { flaky: '1' };

    flakyMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ error: { message: 'Simulated failure (rate=1)' } });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should respond with 400 for an invalid flaky value', () => {
    mockRequest.query = { flaky: 'abc' };

    flakyMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      error: { message: 'Invalid rate. Must be a number between 0 and 1.' },
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
