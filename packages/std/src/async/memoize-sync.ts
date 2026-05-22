import { LRU } from "../cache/lru.js";

/**
 * Options for {@link memoizeSync}.
 */
export interface MemoizeSyncOpts {
  /** Maximum cache size (default: `256`). */
  maxSize?: number;
  /** TTL in milliseconds — entries older than this are evicted on access. */
  ttlMs?: number;
}

/**
 * Return a memoized version of a **synchronous** function.
 *
 * Results are stored in a bounded LRU cache (default 256 entries).  When
 * `ttlMs` is provided, entries older than `ttlMs` milliseconds are evicted
 * on access.
 *
 * @typeParam A - The argument tuple type of the function.
 * @typeParam R - The return type of the function.
 * @param fn - The synchronous function to memoize.
 * @param opts - See {@link MemoizeSyncOpts}.
 * @returns A memoized version of `fn`.
 *
 * @example
 * ```ts
 * const fast = memoizeSync(expensiveCalc, { maxSize: 100, ttlMs: 60_000 });
 * ```
 */
export function memoizeSync<A extends unknown[], R>(
  fn: (...args: A) => R,
  opts?: MemoizeSyncOpts,
): (...args: A) => R {
  const cache = new LRU<string, R>(opts?.maxSize ?? 256, opts?.ttlMs);
  return (...args) => {
    const key = JSON.stringify(args);
    return cache.getOrSet(key, () => fn(...args));
  };
}
