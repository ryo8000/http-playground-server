import { flaky } from '../../../src/services/flaky.js';

describe('flaky', () => {
  it('should succeed when the roll is at or above the rate', () => {
    expect(flaky('0.3', 0.3)).toEqual({
      status: 200,
      body: { message: 'Succeeded (rate=0.3)' },
    });
  });

  it('should fail when the roll is below the rate', () => {
    expect(flaky('0.3', 0.29)).toEqual({
      status: 500,
      body: { error: { message: 'Simulated failure (rate=0.3)' } },
    });
  });

  it('should always succeed when the rate is 0', () => {
    expect(flaky('0', 0)).toEqual({
      status: 200,
      body: { message: 'Succeeded (rate=0)' },
    });
  });

  it('should always fail when the rate is 1', () => {
    expect(flaky('1', 0.999)).toEqual({
      status: 500,
      body: { error: { message: 'Simulated failure (rate=1)' } },
    });
  });

  it.each([
    { roll: 0.49, status: 500, description: 'fail below 0.5' },
    { roll: 0.5, status: 200, description: 'succeed at or above 0.5' },
  ])('should default to a rate of 0.5 and $description', ({ roll, status }) => {
    expect(flaky(undefined, roll).status).toBe(status);
  });

  it.each([
    { rate: 'abc', reason: 'non-numeric string' },
    { rate: '-0.1', reason: 'below valid range' },
    { rate: '1.1', reason: 'above valid range' },
    { rate: '', reason: 'empty string' },
    { rate: ' ', reason: 'whitespace-only string' },
    { rate: ['0.3', '0.5'], reason: 'multiple values' },
  ])('should return 400 for invalid rate $rate ($reason)', ({ rate }) => {
    expect(flaky(rate, 0.5)).toEqual({
      status: 400,
      body: { error: { message: 'Invalid rate. Must be a number between 0 and 1.' } },
    });
  });
});
