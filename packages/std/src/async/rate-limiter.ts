import { ok, err, type Result } from "../result/result.js";

/**
 * Options for {@link RateLimiter}.
 */
export interface RateLimiterOpts {
  /** Maximum burst size — number of tokens the bucket can hold. */
  limit: number;
  /** Time window in milliseconds over which tokens refill. */
  window: number;
}

/**
 * A token-bucket rate limiter.
 *
 * Tokens refill smoothly at `limit / window` tokens per millisecond.
 * The bucket starts full.
 *
 * @example
 * ```ts
 * const limiter = new RateLimiter({ limit: 100, window: 1000 });
 *
 * // Wait until a token is available
 * await limiter.acquire();
 *
 * // Try to take a token without waiting
 * const result = limiter.tryAcquire(); // Result<void, Error>
 * ```
 */
export class RateLimiter {
  #limit: number;
  #window: number;
  #tokens: number;
  #lastRefill: number;
  #waiters: Array<() => void>;
  #refillTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(opts: RateLimiterOpts) {
    if (opts.limit <= 0) throw new RangeError("limit must be > 0");
    if (opts.window <= 0) throw new RangeError("window must be > 0");
    this.#limit = opts.limit;
    this.#window = opts.window;
    this.#tokens = opts.limit;
    this.#lastRefill = Date.now();
    this.#waiters = [];
  }

  /**
   * Acquires a token, waiting asynchronously if none are available.
   *
   * @returns A promise that resolves when a token is acquired.
   */
  async acquire(): Promise<void> {
    this.#refill();
    if (this.#tokens >= 1) {
      this.#tokens--;
      return;
    }
    return new Promise<void>((resolve) => {
      this.#waiters.push(resolve);
      this.#scheduleRefill();
    });
  }

  /**
   * Tries to acquire a token immediately without waiting.
   *
   * @returns `Ok(undefined)` if a token was available, `Err(error)` otherwise.
   */
  tryAcquire(): Result<void, Error> {
    this.#refill();
    if (this.#tokens >= 1) {
      this.#tokens--;
      return ok(undefined);
    }
    return err(new Error("Rate limit exceeded — no tokens available"));
  }

  /** The number of tokens currently available. */
  get available(): number {
    this.#refill();
    return this.#tokens;
  }

  #refill(): void {
    const now = Date.now();
    const elapsed = now - this.#lastRefill;
    if (elapsed <= 0) return;

    const rate = this.#limit / this.#window;
    this.#tokens = Math.min(this.#limit, this.#tokens + elapsed * rate);
    this.#lastRefill = now;

    // Wake waiters while tokens are available
    while (this.#tokens >= 1 && this.#waiters.length > 0) {
      this.#tokens--;
      this.#waiters.shift()!();
    }
  }

  #scheduleRefill(): void {
    if (this.#waiters.length === 0) return;
    // Calculate when at least 1 token will be available
    const needed = Math.max(0, 1 - this.#tokens);
    const rate = this.#limit / this.#window;
    const ms = Math.ceil(needed / rate) + 1; // +1 to avoid racing with exact boundary
    clearTimeout(this.#refillTimer);
    this.#refillTimer = setTimeout(() => this.#refill(), ms);
  }
}
