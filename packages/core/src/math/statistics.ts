/**
 * Returns the sum of an array of numbers.
 *
 * @param ns - Array of numbers.
 * @returns The sum.
 *
 * @example
 * ```ts
 * sum([1, 2, 3, 4, 5]); // 15
 * ```
 */
export const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);

/**
 * Returns the arithmetic mean of an array of numbers.
 *
 * Returns `NaN` if the array is empty.
 *
 * @param ns - Array of numbers.
 * @returns The average.
 *
 * @example
 * ```ts
 * average([1, 2, 3, 4, 5]); // 3
 * ```
 */
export const average = (ns: number[]) => sum(ns) / ns.length;

/**
 * Returns the median of an array of numbers.
 *
 * For even-length arrays, returns the average of the two middle values.
 * Returns `NaN` if the array is empty.
 *
 * @param ns - Array of numbers.
 * @returns The median.
 *
 * @example
 * ```ts
 * median([1, 5, 2, 4, 3]); // 3
 * median([1, 2, 3, 4]);    // 2.5
 * ```
 */
export const median = (ns: number[]) => {
  const s = [...ns].sort((a, b) => a - b),
    m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};
