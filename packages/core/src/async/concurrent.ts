/**
 * Runs an array of promise-returning functions with a concurrency limit,
 * preserving result order.
 *
 * @typeParam T - The return type of each function.
 * @param fns - Array of async functions to execute.
 * @param limit - Maximum number of functions to run concurrently.
 * @returns A promise resolving to an array of results in the same order as `fns`.
 *
 * @example
 * ```ts
 * const results = await concurrent(
 *   [fn1, fn2, fn3, fn4, fn5],
 *   2, // only 2 at a time
 * );
 * ```
 */
export async function concurrent<T>(fns: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = Array.from({ length: fns.length });
  let cursor = 0;
  const run = async () => {
    while (cursor < fns.length) {
      const i = cursor++;
      results[i] = await fns[i]!();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, fns.length) }, run));
  return results;
}
