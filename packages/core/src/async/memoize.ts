import { LRU } from "../cache/lru.js";

/**
 * Return a memoized version of an **asynchronous** function.
 *
 * Results are stored in a bounded LRU cache (default 256 entries).  When
 * `ttlMs` is provided, entries older than `ttlMs` milliseconds are evicted
 * on access.
 */
export function memoizeAsync<T>(
  fn: (...a: any[]) => Promise<T>,
  opts?: { maxSize?: number; ttlMs?: number },
) {
  const cache = new LRU<string, T>(opts?.maxSize ?? 256, opts?.ttlMs);
  return async (...a: any[]) => {
    const key = JSON.stringify(a);
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    const value = await fn(...a);
    cache.set(key, value);
    return value;
  };
}
