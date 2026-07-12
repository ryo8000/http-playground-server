import {
  failThenSucceed,
  resetFailThenSucceedCounters,
} from '../../../src/services/fail-then-succeed.js';

describe('failThenSucceed', () => {
  beforeEach(() => {
    resetFailThenSucceedCounters();
  });

  it('should fail the first `after` attempts and then succeed', () => {
    expect(failThenSucceed('2', 'a')).toEqual({
      status: 500,
      body: { error: { message: 'Attempt 1 failed (succeeds on attempt 3)' } },
    });
    expect(failThenSucceed('2', 'a')).toEqual({
      status: 500,
      body: { error: { message: 'Attempt 2 failed (succeeds on attempt 3)' } },
    });
    expect(failThenSucceed('2', 'a')).toEqual({
      status: 200,
      body: { message: 'Attempt 3 succeeded after 2 failure(s)' },
    });
  });

  it('should reset the counter after a success so the cycle repeats', () => {
    failThenSucceed('1', 'a');
    failThenSucceed('1', 'a');
    expect(failThenSucceed('1', 'a')).toEqual({
      status: 500,
      body: { error: { message: 'Attempt 1 failed (succeeds on attempt 2)' } },
    });
  });

  it('should track counters per id independently', () => {
    failThenSucceed('1', 'a');
    expect(failThenSucceed('1', 'b')).toEqual({
      status: 500,
      body: { error: { message: 'Attempt 1 failed (succeeds on attempt 2)' } },
    });
    expect(failThenSucceed('1', 'a')).toEqual({
      status: 200,
      body: { message: 'Attempt 2 succeeded after 1 failure(s)' },
    });
  });

  it('should default to 3 failures and a shared id when parameters are omitted', () => {
    expect(failThenSucceed(undefined, undefined)).toEqual({
      status: 500,
      body: { error: { message: 'Attempt 1 failed (succeeds on attempt 4)' } },
    });
    failThenSucceed(undefined, undefined);
    failThenSucceed(undefined, undefined);
    expect(failThenSucceed(undefined, undefined)).toEqual({
      status: 200,
      body: { message: 'Attempt 4 succeeded after 3 failure(s)' },
    });
  });

  it('should succeed immediately when after is 0', () => {
    expect(failThenSucceed('0', 'a')).toEqual({
      status: 200,
      body: { message: 'Attempt 1 succeeded after 0 failure(s)' },
    });
  });

  it.each([
    { after: 'abc', reason: 'non-numeric string' },
    { after: '-1', reason: 'negative integer' },
    { after: '1.5', reason: 'floating point number' },
    { after: ['1', '2'], reason: 'multiple values' },
  ])('should return 400 for invalid after $after ($reason)', ({ after }) => {
    expect(failThenSucceed(after, 'a')).toEqual({
      status: 400,
      body: { error: { message: 'Invalid after. Must be an integer of 0 or more.' } },
    });
  });

  it('should return 400 for multiple id values', () => {
    expect(failThenSucceed('1', ['a', 'b'])).toEqual({
      status: 400,
      body: { error: { message: 'Invalid id. Must be a single string value.' } },
    });
  });
});
