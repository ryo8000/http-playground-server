import { toSafeInteger } from '../../../src/utils/number.js';

describe('toSafeInteger', () => {
  it('should return a number when given a valid integer string', () => {
    expect(toSafeInteger('123')).toBe(123);
    expect(toSafeInteger('-456')).toBe(-456);
    expect(toSafeInteger('0')).toBe(0);
    expect(toSafeInteger(Number.MAX_SAFE_INTEGER.toString())).toBe(9007199254740991);
    expect(toSafeInteger(Number.MIN_SAFE_INTEGER.toString())).toBe(-9007199254740991);
  });

  it('should return undefined when given a non-integer string', () => {
    expect(toSafeInteger(undefined)).toBeUndefined();
    expect(toSafeInteger('abc')).toBeUndefined();
    expect(toSafeInteger('2e1')).toBeUndefined();
    expect(toSafeInteger('12.3')).toBeUndefined();
    expect(toSafeInteger(' 123 ')).toBeUndefined();
    expect(toSafeInteger('0123')).toBeUndefined();
    expect(toSafeInteger('')).toBeUndefined();
    expect(toSafeInteger(' ')).toBeUndefined();
    expect(toSafeInteger('12345678901234567')).toBeUndefined();
    expect(toSafeInteger('-12345678901234567')).toBeUndefined();
  });

  it('should return undefined when given an unsafe integer string', () => {
    expect(toSafeInteger((Number.MAX_SAFE_INTEGER + 1).toString())).toBeUndefined();
    expect(toSafeInteger((Number.MIN_SAFE_INTEGER - 1).toString())).toBeUndefined();
  });
});
