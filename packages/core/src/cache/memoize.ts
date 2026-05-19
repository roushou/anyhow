import { LRU } from "./lru.js";

/**
 * Return a memoized version of a **synchronous** function.
 *
 * Results are stored in a bounded LRU cache (default 256 entries).  When
 * `ttlMs` is provided, entries older than `ttlMs` milliseconds are evicted
 * on access.
 */
export function memoizeSync<A extends unknown[], R>(
  fn: (...args: A) => R,
  opts?: { maxSize?: number; ttlMs?: number },
): (...args: A) => R {
  const cache = new LRU<string, R>(opts?.maxSize ?? 256, opts?.ttlMs);
  return (...args) => {
    const key = JSON.stringify(args);
    return cache.getOrSet(key, () => fn(...args));
  };
}
