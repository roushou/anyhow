import { sleep } from "./timing.js";
import { ok, err, type Result } from "../result/result.js";
import type { BackoffStrategy } from "./backoff.js";

/**
 * Options for {@link retry}.
 */
export interface RetryOpts {
  /** Maximum number of attempts (default: `3`). */
  attempts?: number;
  /**
   * Delay strategy between retries.
   *
   * Pass a `number` for exponential backoff (`delay * 2^attempt`),
   * or a {@link BackoffStrategy} for full control.
   *
   * Default: `300` (exponential starting at 300ms).
   */
  backoff?: number | BackoffStrategy;
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
 * Retries an async function on failure with configurable backoff.
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
 * // Shorthand: number = exponential backoff
 * const result = await retry(() => fetch("/api").then(r => r.json()), {
 *   attempts: 5,
 *   backoff: 200,
 * });
 *
 * // Full control with a BackoffStrategy
 * const result = await retry(() => fetchUser(id), {
 *   attempts: 5,
 *   backoff: Backoff.exponentialWithJitter({ initial: 100, max: 30_000 }),
 *   shouldRetry: (e) => e instanceof NetworkError,
 *   onRetry: (e, i) => log.warn({ attempt: i, error: e }),
 * });
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

      // Compute delay: number → exponential, function → delegate
      const delay = typeof backoff === "number" ? backoff * 2 ** i : backoff(i);
      await sleep(delay);

      // Check abort signal after the delay
      if (signal?.aborted) {
        return err(signal.reason ?? new Error("Retry aborted"));
      }
    }
  }

  return err(lastError instanceof Error ? lastError : new Error(String(lastError)));
}
