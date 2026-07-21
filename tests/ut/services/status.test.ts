import { status } from '../../../src/services/status.js';

describe('status', () => {
  it('should return ok with status 200', () => {
    const result = status('200', 0);
    expect(result).toEqual({ ok: true, status: 200 });
  });

  it('should return ok with status 599', () => {
    const result = status('599', 0.99);
    expect(result).toEqual({ ok: true, status: 599 });
  });

  it('should choose the first code from a comma-separated list for a low roll', () => {
    const result = status('200,500', 0);
    expect(result).toEqual({ ok: true, status: 200 });
  });

  it('should choose the last code from a comma-separated list for a high roll', () => {
    const result = status('200,404,500', 0.99);
    expect(result).toEqual({ ok: true, status: 500 });
  });

  it.each([
    { code: '199', reason: 'below valid range' },
    { code: '600', reason: 'above valid range' },
    { code: 'abc', reason: 'non-numeric string' },
    { code: '1.5', reason: 'floating point number' },
    { code: '2e1', reason: 'scientific notation' },
    { code: '200,600', reason: 'list containing an out-of-range code' },
    { code: '200,', reason: 'trailing comma' },
    { code: ',', reason: 'comma only' },
  ])('should return 400 for invalid code $code ($reason)', ({ code }) => {
    const result = status(code, 0);
    expect(result).toEqual({
      ok: false,
      status: 400,
      body: {
        error: {
          message: 'Invalid status code. Must be an integer between 200 and 599.',
        },
      },
    });
  });
});
