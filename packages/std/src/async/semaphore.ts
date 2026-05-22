/**
 * An async semaphore for limiting concurrent access to a resource.
 *
 * Useful for rate-limiting API calls, connection pooling, or any
 * scenario where you need to cap the number of simultaneously
 * running async operations.
 *
 * @example
 * ```ts
 * const pool = new Semaphore(5);
 * const results = await Promise.all(
 *   urls.map(url => pool.acquire(() => fetch(url)))
 * );
 * ```
 */
export class Semaphore {
  #permits: number;
  #available: number;
  #queue: (() => void)[];

  /**
   * Creates a semaphore with `permits` concurrent slots.
   *
   * @param permits - Maximum number of concurrent acquisitions.
   */
  constructor(permits: number) {
    if (!Number.isInteger(permits) || permits < 1) {
      throw new RangeError("permits must be a positive integer");
    }
    this.#permits = permits;
    this.#available = permits;
    this.#queue = [];
  }

  /**
   * The total number of permits this semaphore was created with.
   */
  get permits(): number {
    return this.#permits;
  }

  /**
   * The number of permits currently available (not acquired).
   */
  get available(): number {
    return this.#available;
  }

  /**
   * Acquires a permit, runs `fn`, and releases the permit.
   * If all permits are busy, waits until one becomes available.
   *
   * @typeParam T - The return type of `fn`.
   * @param fn - The async function to run once a permit is acquired.
   * @returns The result of `fn`.
   *
   * @example
   * ```ts
   * const api = new Semaphore(3);
   * const data = await api.acquire(() => fetch("/api/users").then(r => r.json()));
   * ```
   */
  async acquire<T>(fn: () => Promise<T>): Promise<T> {
    const release = await this.#wait();
    try {
      return await fn();
    } finally {
      release();
    }
  }

  /**
   * Acquires a permit and returns a release function.
   * Callers must invoke the release function when done, even if
   * their work throws.  Prefer {@link acquire} for simple cases.
   *
   * @returns A promise that resolves to a release function.
   *
   * @example
   * ```ts
   * const db = new Semaphore(1);
   * const release = await db.lock();
   * try {
   *   await writeToFile(...);
   * } finally {
   *   release();
   * }
   * ```
   */
  async lock(): Promise<() => void> {
    return this.#wait();
  }

  /**
   * Internal: waits for a permit and returns a release callback.
   */
  #wait(): Promise<() => void> {
    if (this.#available > 0) {
      this.#available--;
      return Promise.resolve(this.#release());
    }
    return new Promise<() => void>((resolve) => {
      this.#queue.push(() => {
        resolve(this.#release());
      });
    });
  }

  /**
   * Internal: returns a release function bound to this instance.
   */
  #release(): () => void {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      const next = this.#queue.shift();
      if (next) {
        next();
      } else {
        this.#available++;
      }
    };
  }
}
