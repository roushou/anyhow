import { sleep } from "./timing.js";
import { ok, err, type Result } from "../result/result.js";

/**
 * Retries an async function on failure with exponential backoff.
 *
 * Each retry waits `backoff * 2^i` milliseconds before the next attempt,
 * where `i` is the attempt index (0-based). The first retry waits `backoff` ms,
 * the second waits `backoff * 2` ms, etc.
 *
 * Returns a {@link Result} — `Ok(value)` on success or `Err(error)` if
 * all attempts are exhausted.
 *
 * @typeParam T - The return type of the function.
 * @param fn - The async function to retry.
 * @param opts.attempts - Maximum number of attempts (default: `3`).
 * @param opts.backoff - Initial delay in milliseconds, doubles each attempt (default: `300`).
 * @returns A `Result<T>` — `Ok(value)` on the first successful attempt,
 *   or `Err(lastError)` if all attempts fail.
 *
 * @example
 * ```ts
 * const result = await retry(() => fetch("/api").then(r => r.json()), {
 *   attempts: 5,
 *   backoff: 200,
 * });
 * if (result.ok) console.log(result.value);
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  { attempts = 3, backoff = 300 } = {},
): Promise<Result<T>> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return ok(await fn());
    } catch (e) {
      lastError = e;
      if (i < attempts - 1) {
        await sleep(backoff * 2 ** i);
      }
    }
  }
  return err(lastError instanceof Error ? lastError : new Error(String(lastError)));
}
