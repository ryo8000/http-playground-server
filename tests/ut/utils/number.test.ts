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
    const invalidInputs = [
      undefined,
      'abc',
      '2e1',
      '12.3',
      ' 123 ',
      '0123',
      '',
      ' ',
    ];

    for (const input of invalidInputs) {
      expect(toSafeInteger(input)).toBeUndefined();
    }
  });

  it('should return undefined when given an unsafe integer string', () => {
    const unsafeIntegerStrings = [
      (Number.MAX_SAFE_INTEGER + 1).toString(),
      (Number.MIN_SAFE_INTEGER - 1).toString(),
    ];

    for (const input of unsafeIntegerStrings) {
      expect(toSafeInteger(input)).toBeUndefined();
    }
  });
});
