import { Request, Response, NextFunction } from 'express';
import { environment } from '../../src/env';
import { corsMiddleware } from '../../src/middlewares/cors';

describe('corsMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockEnvironment: typeof environment;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      header: jest.fn(),
    };
    mockNext = jest.fn();

    mockEnvironment = jest.mocked(environment);
    mockEnvironment.origin = '*';
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('should set CORS headers with custom origin when specified', () => {
    mockEnvironment.origin = 'http://localhost';

    corsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.header).toHaveBeenCalledWith({
      'Access-Control-Allow-Origin': 'http://localhost',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    expect(mockNext).toHaveBeenCalled();
  });

  it('should set CORS headers with "*" by default', () => {
    corsMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.header).toHaveBeenCalledWith({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    expect(mockNext).toHaveBeenCalled();
  });
});
