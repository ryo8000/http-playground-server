import { toSafeInteger } from '../../../src/utils/number';

describe('toSafeInteger', () => {
  it('should return a number when given a valid integer string', () => {
    expect(toSafeInteger('123')).toBe(123);
    expect(toSafeInteger('-456')).toBe(-456);
    expect(toSafeInteger('0')).toBe(0);
    expect(toSafeInteger(Number.MAX_SAFE_INTEGER.toString())).toBe(9007199254740991);
    expect(toSafeInteger(Number.MIN_SAFE_INTEGER.toString())).toBe(-9007199254740991);
  });

  it('should return undefined when given a non-integer string', () => {
    expect(toSafeInteger('abc')).toBeNaN();
    expect(toSafeInteger('2e1')).toBeNaN();
    expect(toSafeInteger('12.3')).toBeNaN();
    expect(toSafeInteger(' 123 ')).toBeNaN();
    expect(toSafeInteger('0123')).toBeNaN();
    expect(toSafeInteger('')).toBeNaN();
    expect(toSafeInteger(' ')).toBeNaN();
    expect(toSafeInteger('12345678901234567')).toBeNaN();
    expect(toSafeInteger('-12345678901234567')).toBeNaN();
  });

  it('should return undefined when given an unsafe integer string', () => {
    expect(toSafeInteger((Number.MAX_SAFE_INTEGER + 1).toString())).toBeNaN();
    expect(toSafeInteger((Number.MIN_SAFE_INTEGER - 1).toString())).toBeNaN();
  });
});
