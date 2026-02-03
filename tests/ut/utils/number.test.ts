import { toSafeInteger } from '../../../src/utils/number.js';

describe('toSafeInteger', () => {
  describe('when given a valid integer string', () => {
    const validIntegerTestCases = [
      { value: '123', expected: 123 },
      { value: '-456', expected: -456 },
      { value: '0', expected: 0 },
      { value: '-0', expected: 0 },
      { value: Number.MAX_SAFE_INTEGER.toString(), expected: 9007199254740991 },
      { value: Number.MIN_SAFE_INTEGER.toString(), expected: -9007199254740991 },
    ] as const;

    it.each(validIntegerTestCases)(
      'should return the expected integer for $value',
      ({ value, expected }) => {
        expect(toSafeInteger(value)).toBe(expected);
      },
    );
  });

  describe('when given a non-integer value', () => {
    const invalidInputs = [undefined, 'abc', '2e1', '12.3', ' 123 ', '0123', '', ' '] as const;

    it.each(invalidInputs)('should return undefined for %s', (input) => {
      expect(toSafeInteger(input)).toBeUndefined();
    });
  });

  describe('when given an unsafe integer string', () => {
    const unsafeIntegerStrings = [
      (Number.MAX_SAFE_INTEGER + 1).toString(),
      (Number.MIN_SAFE_INTEGER - 1).toString(),
    ] as const;

    it.each(unsafeIntegerStrings)('should return undefined for %s', (input) => {
      expect(toSafeInteger(input)).toBeUndefined();
    });
  });
});
