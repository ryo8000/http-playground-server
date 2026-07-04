import { status } from '../../../src/services/status.js';

describe('status', () => {
  it('should return ok with status 200', () => {
    const result = status('200');
    expect(result).toEqual({ ok: true, status: 200 });
  });

  it('should return ok with status 599', () => {
    const result = status('599');
    expect(result).toEqual({ ok: true, status: 599 });
  });

  it.each([
    { code: '199', reason: 'below valid range' },
    { code: '600', reason: 'above valid range' },
    { code: 'abc', reason: 'non-numeric string' },
    { code: '1.5', reason: 'floating point number' },
    { code: '2e1', reason: 'scientific notation' },
  ])('should return 400 for invalid code $code ($reason)', ({ code }) => {
    const result = status(code);
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
