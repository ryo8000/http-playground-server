import { drip } from '../../../src/services/drip.js';

describe('drip', () => {
  it('should default to 10 bytes at 1000 ms intervals', () => {
    expect(drip(undefined, undefined)).toEqual({ ok: true, size: 10, interval: 1000 });
  });

  it('should resolve explicit size and interval values', () => {
    expect(drip('3', '10')).toEqual({ ok: true, size: 3, interval: 10 });
  });

  it.each([
    { size: '0', reason: 'below valid range' },
    { size: '1025', reason: 'above valid range' },
    { size: 'abc', reason: 'non-numeric string' },
    { size: ['1', '2'], reason: 'multiple values' },
  ])('should return 400 for invalid size $size ($reason)', ({ size }) => {
    expect(drip(size, undefined)).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: 'Invalid size. Must be an integer between 1 and 1024.' } },
    });
  });

  it.each([
    { interval: '0', reason: 'below valid range' },
    { interval: '10001', reason: 'above valid range' },
    { interval: 'abc', reason: 'non-numeric string' },
    { interval: ['10', '20'], reason: 'multiple values' },
  ])('should return 400 for invalid interval $interval ($reason)', ({ interval }) => {
    expect(drip(undefined, interval)).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: 'Invalid interval. Must be an integer between 1 and 10000.' } },
    });
  });
});
