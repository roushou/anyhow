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
 * Returns the product of an array of numbers.
 *
 * @param ns - Array of numbers.
 * @returns The product.
 *
 * @example
 * ```ts
 * product([1, 2, 3, 4]); // 24
 * ```
 */
export const product = (ns: number[]) => ns.reduce((a, b) => a * b, 1);

/**
 * Returns the minimum value in an array of numbers.
 *
 * @param ns - Array of numbers.
 * @returns The minimum, or `Infinity` if the array is empty.
 *
 * @example
 * ```ts
 * min([3, 1, 4, 1, 5]); // 1
 * ```
 */
export const min = (ns: number[]) => Math.min(...ns);

/**
 * Returns the maximum value in an array of numbers.
 *
 * @param ns - Array of numbers.
 * @returns The maximum, or `-Infinity` if the array is empty.
 *
 * @example
 * ```ts
 * max([3, 1, 4, 1, 5]); // 5
 * ```
 */
export const max = (ns: number[]) => Math.max(...ns);

/**
 * Returns the arithmetic mean of an array of numbers.
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
 * For even-length arrays, returns the average of the two middle values.
 * Returns `NaN` if empty.
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
  const s = [...ns].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};

/**
 * Returns the mode of an array of numbers — the most frequently occurring value.
 * If multiple values tie, the first encountered wins.
 *
 * @param ns - Array of numbers.
 * @returns The mode, or `NaN` if empty.
 *
 * @example
 * ```ts
 * mode([1, 2, 2, 3]); // 2
 * ```
 */
export const mode = (ns: number[]): number => {
  if (ns.length === 0) return NaN;
  const freq = new Map<number, number>();
  let best = ns[0]!;
  let bestCount = 0;
  for (const n of ns) {
    const c = (freq.get(n) ?? 0) + 1;
    freq.set(n, c);
    if (c > bestCount) {
      best = n;
      bestCount = c;
    }
  }
  return best;
};

/**
 * Returns the population variance of an array of numbers.
 * Returns `NaN` if empty.
 *
 * @param ns - Array of numbers.
 * @returns The population variance.
 *
 * @example
 * ```ts
 * variance([2, 4, 4, 4, 5, 5, 7, 9]); // 4
 * ```
 */
export const variance = (ns: number[]): number => {
  if (ns.length === 0) return NaN;
  const avg = average(ns);
  return ns.reduce((s, n) => s + (n - avg) ** 2, 0) / ns.length;
};

/**
 * Returns the population standard deviation of an array of numbers.
 * Returns `NaN` if empty.
 *
 * @param ns - Array of numbers.
 * @returns The population standard deviation.
 *
 * @example
 * ```ts
 * stddev([2, 4, 4, 4, 5, 5, 7, 9]); // 2
 * ```
 */
export const stddev = (ns: number[]): number => Math.sqrt(variance(ns));
