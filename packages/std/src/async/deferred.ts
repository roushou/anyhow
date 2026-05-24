/**
 * A promise that can be resolved (or rejected) from the outside.
 *
 * Useful for bridging callback-based APIs into `async`/`await`:
 *
 * ```ts
 * const d = new Deferred<string>();
 * emitter.once("data", (msg) => d.resolve(msg));
 * const msg = await d.promise;
 * ```
 *
 * @typeParam T - The type the promise resolves to.
 *
 * @example
 * ```ts
 * const d = new Deferred<number>();
 * setTimeout(() => d.resolve(42), 1000);
 * const value = await d.promise; // 42 (after 1s)
 * ```
 */
export class Deferred<T> {
  /** The underlying promise. */
  readonly promise: Promise<T>;

  private _resolve!: (value: T) => void;
  private _reject!: (reason: unknown) => void;
  private _settled = false;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  /**
   * Resolves the deferred promise with `value`.
   *
   * Subsequent calls are ignored — the promise can only be settled once.
   *
   * @param value - The value to resolve with.
   */
  resolve(value: T): void {
    if (this._settled) return;
    this._settled = true;
    this._resolve(value);
  }

  /**
   * Rejects the deferred promise with `reason`.
   *
   * Subsequent calls are ignored — the promise can only be settled once.
   *
   * @param reason - The rejection reason.
   */
  reject(reason: unknown): void {
    if (this._settled) return;
    this._settled = true;
    this._reject(reason);
  }

  /** Whether the promise has been resolved or rejected. */
  get settled(): boolean {
    return this._settled;
  }
}
