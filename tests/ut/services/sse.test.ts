import { sse } from '../../../src/services/sse.js';

describe('sse', () => {
  it.each([
    { lastEventId: undefined, reason: 'absent' },
    { lastEventId: '', reason: 'empty' },
  ])('should return defaults when the last event ID is $reason', ({ lastEventId }) => {
    expect(sse(undefined, undefined, lastEventId)).toEqual({
      ok: true,
      count: 5,
      interval: 1000,
      lastEventId: 0,
    });
  });

  it('should resolve the provided count, interval, and last event ID', () => {
    expect(sse('2', '10', '1')).toEqual({ ok: true, count: 2, interval: 10, lastEventId: 1 });
  });

  it.each([
    { lastEventId: 'abc', reason: 'non-numeric string' },
    { lastEventId: '-1', reason: 'negative' },
  ])('should return 400 for invalid last event ID $lastEventId ($reason)', ({ lastEventId }) => {
    expect(sse(undefined, undefined, lastEventId)).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: 'Invalid Last-Event-ID. Must be a non-negative integer.' } },
    });
  });

  it.each([
    { count: '0', reason: 'below valid range' },
    { count: '101', reason: 'above valid range' },
    { count: 'abc', reason: 'non-numeric string' },
    { count: ['1', '2'], reason: 'multiple values' },
  ])('should return 400 for invalid count $count ($reason)', ({ count }) => {
    expect(sse(count, undefined, undefined)).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: 'Invalid count. Must be an integer between 1 and 100.' } },
    });
  });

  it.each([
    { interval: '0', reason: 'below valid range' },
    { interval: '10001', reason: 'above valid range' },
    { interval: 'abc', reason: 'non-numeric string' },
    { interval: ['1', '2'], reason: 'multiple values' },
  ])('should return 400 for invalid interval $interval ($reason)', ({ interval }) => {
    expect(sse(undefined, interval, undefined)).toEqual({
      ok: false,
      status: 400,
      body: { error: { message: 'Invalid interval. Must be an integer between 1 and 10000.' } },
    });
  });
});
