import { sleep } from "./timing.js";

/**
 * Retries an async function on failure with exponential backoff.
 *
 * Each retry waits `backoff * 2^i` milliseconds before the next attempt,
 * where `i` is the attempt index (0-based). The first retry waits `backoff` ms,
 * the second waits `backoff * 2` ms, etc.
 *
 * @typeParam T - The return type of the function.
 * @param fn - The async function to retry.
 * @param opts.attempts - Maximum number of attempts (default: `3`).
 * @param opts.backoff - Initial delay in milliseconds, doubles each attempt (default: `300`).
 * @returns The resolved value of `fn`.
 * @throws The last error if all attempts are exhausted.
 *
 * @example
 * ```ts
 * const data = await retry(() => fetch("/api").then(r => r.json()), {
 *   attempts: 5,
 *   backoff: 200,
 * });
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  { attempts = 3, backoff = 300 } = {},
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === attempts - 1) throw e;
      await sleep(backoff * 2 ** i);
    }
  }
  throw new Error("unreachable");
}
