const integerPattern = /^-?[0-9]+$/;

/**
 * Converts a string to a safe integer if the string represents a valid integer within the safe range.
 * Returns `undefined` if the input is not a valid integer, exceeds the safe integer range, or is undefined.
 * Special case: the string `"-0"` is treated as `0` and returns `0`.
 *
 * @param {string | undefined} value - The string to convert to a safe integer, or undefined.
 * @returns {number | undefined} The converted safe integer, or `undefined` if the input is invalid or undefined.
 *
 * @example
 * toSafeInteger('9007199254740991'); // returns 9007199254740991
 * toSafeInteger('9007199254740992'); // returns undefined (out of safe range)
 * toSafeInteger('2e1'); // returns undefined (not a number)
 * toSafeInteger(undefined); // returns undefined
 * toSafeInteger('-0'); // returns 0
 */
export const toSafeInteger = (value: string | undefined): number | undefined => {
  if (value === undefined || !integerPattern.test(value)) {
    return undefined;
  }

  if (value === '-0') {
    return 0;
  }

  const integer = parseInt(value, 10);

  if (!Number.isSafeInteger(integer) || integer.toString() !== value) {
    return undefined;
  }

  return integer;
};
