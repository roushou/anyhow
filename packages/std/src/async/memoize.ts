import { LRU } from "../cache/lru.js";

/**
 * Options for {@link memoizeAsync}.
 */
export interface MemoizeAsyncOpts {
  /** Maximum cache size (default: `256`). */
  maxSize?: number;
  /** TTL in milliseconds — entries older than this are evicted on access. */
  ttlMs?: number;
  /**
   * Custom key resolver.  Defaults to `JSON.stringify(args)`.
   * Use when arguments contain objects that need a stable identity.
   */
  resolver?: (...args: any[]) => string;
}

/**
 * Return a memoized version of an **asynchronous** function.
 *
 * Results are stored in a bounded LRU cache (default 256 entries).  When
 * `ttlMs` is provided, entries older than `ttlMs` milliseconds are evicted
 * on access.
 *
 * Concurrent calls with the same key share a single in-flight promise —
 * the backing function is only called once.
 *
 * @typeParam T - The return type of the function.
 * @param fn - The async function to memoize.
 * @param opts - See {@link MemoizeAsyncOpts}.
 * @returns A memoized version of `fn`.
 *
 * @example
 * ```ts
 * const getUser = memoizeAsync(fetchUser, { maxSize: 100, ttlMs: 60_000 });
 * ```
 */
export function memoizeAsync<T>(fn: (...a: any[]) => Promise<T>, opts?: MemoizeAsyncOpts) {
  const cache = new LRU<string, T>(opts?.maxSize ?? 256, opts?.ttlMs);
  const toKey = opts?.resolver ?? ((...a: any[]) => JSON.stringify(a));
  const pending = new Map<string, Promise<T>>();

  return async (...args: any[]) => {
    const key = toKey(...args);

    // Check cache
    const cached = cache.get(key);
    if (cached !== undefined) return cached;

    // Check for an in-flight promise (dedup concurrent calls)
    const inflight = pending.get(key);
    if (inflight !== undefined) return inflight;

    // Start a new call
    const promise = fn(...args).then((value) => {
      cache.set(key, value);
      pending.delete(key);
      return value;
    });

    pending.set(key, promise);
    return promise;
  };
}
