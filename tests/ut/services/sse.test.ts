import { sse } from '../../../src/services/sse.js';

describe('sse', () => {
  it('should return defaults when no parameters are given', () => {
    const result = sse(undefined, undefined);
    expect(result).toEqual({ ok: true, count: 5, interval: 1000 });
  });

  it('should resolve the provided count and interval', () => {
    const result = sse('2', '10');
    expect(result).toEqual({ ok: true, count: 2, interval: 10 });
  });

  it.each([
    { count: '0', reason: 'below valid range' },
    { count: '101', reason: 'above valid range' },
    { count: 'abc', reason: 'non-numeric string' },
    { count: ['1', '2'], reason: 'repeated parameter' },
  ])('should return 400 for invalid count ($reason)', ({ count }) => {
    const result = sse(count, undefined);
    expect(result).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: 'Invalid count. Must be an integer between 1 and 100.' } },
    });
  });

  it.each([
    { interval: '0', reason: 'below valid range' },
    { interval: '10001', reason: 'above valid range' },
    { interval: 'abc', reason: 'non-numeric string' },
    { interval: ['1', '2'], reason: 'repeated parameter' },
  ])('should return 400 for invalid interval ($reason)', ({ interval }) => {
    const result = sse(undefined, interval);
    expect(result).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: 'Invalid interval. Must be an integer between 1 and 10000.' } },
    });
  });
});
