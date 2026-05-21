/**
 * Options for {@link concurrent}.
 */
export interface ConcurrentOpts {
  /**
   * When `true` (default), results preserve the order of the input functions.
   * When `false`, results populate as each promise resolves.
   */
  ordered?: boolean;
}

/**
 * Runs an array of promise-returning functions with a concurrency limit.
 *
 * @typeParam T - The return type of each function.
 * @param fns - Array of async functions to execute.
 * @param limit - Maximum number of functions to run concurrently.
 * @param opts - See {@link ConcurrentOpts}.
 * @returns A promise resolving to an array of results.  If `ordered` is
 *   `true` (the default), result `[i]` corresponds to `fns[i]`.  If `false`,
 *   results are in completion order.
 *
 * @example
 * ```ts
 * const results = await concurrent(
 *   [fn1, fn2, fn3, fn4, fn5],
 *   2, // only 2 at a time
 * );
 * ```
 */
export async function concurrent<T>(
  fns: (() => Promise<T>)[],
  limit: number,
  opts?: ConcurrentOpts,
): Promise<T[]> {
  const ordered = opts?.ordered ?? true;

  if (ordered) {
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

  // Unordered — push results as they resolve
  const results: T[] = [];
  let cursor = 0;
  const run = async () => {
    while (cursor < fns.length) {
      const i = cursor++;
      results.push(await fns[i]!());
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, fns.length) }, run));
  return results;
}
