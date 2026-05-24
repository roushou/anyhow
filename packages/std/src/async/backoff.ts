/**
 * A backoff strategy: given the attempt index (0-based), returns the delay
 * in milliseconds to wait before the next attempt.
 *
 * @param attempt - The 0-based index of the attempt that just failed.
 * @returns The delay in milliseconds before the next retry.
 */
export type BackoffStrategy = (attempt: number) => number;

/**
 * Factory functions for creating {@link BackoffStrategy} instances.
 *
 * Use via `Backoff.constant(500)`, `Backoff.exponential({ initial: 100 })`, etc.
 *
 * @example
 * ```ts
 * retry(fn, { backoff: Backoff.exponentialWithJitter({ initial: 100, max: 30_000 }) })
 * ```
 */
export const Backoff = {
  /**
   * Always returns the same delay.
   *
   * @param ms - The fixed delay in milliseconds.
   * @returns A {@link BackoffStrategy}.
   *
   * @example
   * ```ts
   * Backoff.constant(500) // always 500ms
   * ```
   */
  constant:
    (ms: number): BackoffStrategy =>
    () =>
      ms,

  /**
   * Increases the delay linearly: `initial + step * attempt`.
   *
   * @param opts.initial - The delay for the first retry (attempt 0).
   * @param opts.step - Added on each subsequent retry.
   * @returns A {@link BackoffStrategy}.
   *
   * @example
   * ```ts
   * Backoff.linear({ initial: 100, step: 200 })
   * // attempt 0 → 100ms, attempt 1 → 300ms, attempt 2 → 500ms
   * ```
   */
  linear:
    (opts: { initial: number; step: number }): BackoffStrategy =>
    (attempt: number) =>
      opts.initial + opts.step * attempt,

  /**
   * Doubles the delay each attempt: `initial * 2^attempt`.
   *
   * @param opts.initial - The delay for the first retry (attempt 0).
   * @param opts.max - Optional cap on the delay.
   * @returns A {@link BackoffStrategy}.
   *
   * @example
   * ```ts
   * Backoff.exponential({ initial: 100 })
   * // attempt 0 → 100ms, attempt 1 → 200ms, attempt 2 → 400ms
   * ```
   */
  exponential: (opts: { initial: number; max?: number }): BackoffStrategy => {
    const max = opts.max ?? Infinity;
    return (attempt: number) => Math.min(opts.initial * 2 ** attempt, max);
  },

  /**
   * Like {@link Backoff.exponential} but multiplies each delay by a random
   * factor between 0.5 and 1.0 to spread out retries and avoid thundering
   * herd problems.
   *
   * @param opts.initial - The base delay for the first retry (before jitter).
   * @param opts.max - Optional cap on the delay (after jitter is applied the
   *   actual delay will be between `max * 0.5` and `max`).
   * @returns A {@link BackoffStrategy}.
   *
   * @example
   * ```ts
   * Backoff.exponentialWithJitter({ initial: 100, max: 30_000 })
   * // attempt 0 → 50-100ms, attempt 1 → 100-200ms, attempt 2 → 200-400ms
   * ```
   */
  exponentialWithJitter: (opts: { initial: number; max?: number }): BackoffStrategy => {
    const max = opts.max ?? Infinity;
    return (attempt: number) => {
      const base = Math.min(opts.initial * 2 ** attempt, max);
      return base * (0.5 + Math.random() * 0.5);
    };
  },

  /**
   * Wraps a custom delay function as a {@link BackoffStrategy}.
   *
   * @param fn - A function that receives the attempt index (0-based) and
   *   returns the delay in milliseconds.
   * @returns A {@link BackoffStrategy}.
   *
   * @example
   * ```ts
   * Backoff.custom((attempt) => (attempt + 1) * 500)
   * // attempt 0 → 500ms, attempt 1 → 1000ms, attempt 2 → 1500ms
   * ```
   */
  custom: (fn: (attempt: number) => number): BackoffStrategy => fn,
} as const;
