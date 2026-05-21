import { sleep } from "./timing.js";
import { ok, err, type Result } from "../result/result.js";

/**
 * Options for {@link retry}.
 */
export interface RetryOpts {
  /** Maximum number of attempts (default: `3`). */
  attempts?: number;
  /** Initial delay in milliseconds, doubles each attempt (default: `300`). */
  backoff?: number;
  /**
   * Called before each retry. Return `false` to stop retrying immediately
   * (the current error is returned as `Err`). Return `true` to continue.
   *
   * @param error - The error that caused the current attempt to fail.
   */
  shouldRetry?: (error: unknown) => boolean;
  /**
   * Called after a failure and before the retry delay. Useful for logging.
   *
   * @param error - The error that caused the failure.
   * @param attempt - The attempt number that just failed (1-based).
   */
  onRetry?: (error: unknown, attempt: number) => void;
  /**
   * An `AbortSignal` that cancels the retry loop.  After each delay the
   * signal is checked; if aborted the abort reason is returned as `Err`.
   */
  signal?: AbortSignal;
}

/**
 * Retries an async function on failure with exponential backoff.
 *
 * Each retry waits `backoff * 2^i` milliseconds before the next attempt,
 * where `i` is the attempt index (0-based). The first retry waits `backoff` ms,
 * the second waits `backoff * 2` ms, etc.
 *
 * Returns a {@link Result} — `Ok(value)` on success or `Err(error)` if
 * all attempts are exhausted (or `shouldRetry` returned `false`, or the
 * `signal` was aborted).
 *
 * @typeParam T - The return type of the function.
 * @param fn - The async function to retry.
 * @param opts - See {@link RetryOpts}.
 * @returns A `Result<T>`.
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
  { attempts = 3, backoff = 300, shouldRetry, onRetry, signal }: RetryOpts = {},
): Promise<Result<T>> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return ok(await fn());
    } catch (e) {
      lastError = e;

      // Call onRetry for observability
      onRetry?.(e, i + 1);

      // Last attempt or shouldRetry says stop
      if (i === attempts - 1) break;
      if (shouldRetry && !shouldRetry(e)) break;

      await sleep(backoff * 2 ** i);

      // Check abort signal after the delay
      if (signal?.aborted) {
        return err(signal.reason ?? new Error("Retry aborted"));
      }
    }
  }

  return err(lastError instanceof Error ? lastError : new Error(String(lastError)));
}
