const integerPattern = /^-?[0-9]+$/;

/**
 * Converts a string to a safe integer if the string represents a valid integer within the safe range.
 * Returns `NaN` if the input is not a valid integer, exceeds the safe integer range, or is undefined.
 *
 * @param {string | undefined} value - The string to convert to a safe integer, or undefined.
 * @returns {number} The converted safe integer, or `NaN` if the input is invalid or undefined.
 *
 * @example
 * toSafeInteger('9007199254740991'); // returns 9007199254740991
 * toSafeInteger('9007199254740992'); // returns NaN (out of safe range)
 * toSafeInteger('2e1'); // returns NaN (not a number)
 * toSafeInteger(undefined); // returns NaN
 */
export const toSafeInteger = (value: string | undefined): number => {
  if (value === undefined || !integerPattern.test(value)) {
    return NaN;
  }

  const integer = parseInt(value, 10);

  if (!Number.isSafeInteger(integer) || integer.toString() !== value) {
    return NaN;
  }

  return integer;
};
