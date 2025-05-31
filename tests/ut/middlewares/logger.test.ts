import { Request, Response, NextFunction } from 'express';
import { loggerMiddleware } from '../../../src/middlewares/logger';
import { log } from '../../../src/logger';

jest.mock('../../../src/logger', () => ({
  log: {
    debug: jest.fn(),
  },
}));

describe('LoggerMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      method: 'POST',
      url: '/test',
      query: { param: 'value' },
      headers: { 'content-type': 'application/json' },
      body: { data: 'test' },
    };
    mockResponse = {
      statusCode: 200,
      getHeaders: jest.fn().mockReturnValue({ 'content-type': 'application/json' }),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should log request and response information', () => {
    const originalJson = jest.fn().mockReturnThis();
    mockResponse.json = originalJson;

    loggerMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(log.debug).toHaveBeenCalledWith(
      {
        type: 'request',
        method: 'POST',
        url: '/test',
        query: { param: 'value' },
        headers: { 'content-type': 'application/json' },
        body: { data: 'test' },
      },
      'Incoming request'
    );

    const responseBody = { result: 'success' };
    mockResponse.json(responseBody);

    expect(originalJson).toHaveBeenCalledWith(responseBody);
    expect(log.debug).toHaveBeenCalledWith(
      {
        type: 'response',
        statusCode: 200,
        headers: { 'content-type': 'application/json' },
        body: responseBody,
      },
      'Outgoing response'
    );

    expect(mockNext).toHaveBeenCalled();
  });

  it('should log empty body for requests with empty request body.', () => {
    mockRequest.body = undefined;

    loggerMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(log.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {},
      }),
      'Incoming request'
    );
  });

  it('should log empty body for GET requests', () => {
    mockRequest.method = 'GET';

    loggerMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(log.debug).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {},
      }),
      'Incoming request'
    );
  });
});
