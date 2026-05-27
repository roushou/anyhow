// ── Private base (never exported) ──

abstract class ResultBase<T, E> {
  abstract readonly ok: boolean;

  abstract map<U>(fn: (value: T) => U): Result<U, E>;
  abstract mapErr<F>(fn: (error: E) => F): Result<T, F>;
  abstract andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
  abstract tap(fn: (value: T) => void): Result<T, E>;
  abstract tapErr(fn: (error: E) => void): Result<T, E>;
  abstract flatten(): any;
  abstract zip<U>(other: Result<U, E>): Result<[T, U], E>;
  abstract zipWith<U, V>(other: Result<U, E>, fn: (t: T, u: U) => V): Result<V, E>;

  abstract unwrap(): T;
  abstract unwrapOr(fallback: T): T;
  abstract expect(msg: string): T;
  abstract match<U>(onOk: (value: T) => U, onErr: (error: E) => U): U;
  abstract toJSON(): { ok: true; value: T } | { ok: false; error: E };
}

// ── Ok ──

class OkImpl<T, E> extends ResultBase<T, E> {
  readonly ok = true as const;

  constructor(readonly value: T) {
    super();
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new OkImpl<U, E>(fn(this.value));
  }

  mapErr<F>(_fn: (error: E) => F): Result<T, F> {
    return new OkImpl<T, F>(this.value);
  }

  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  orElse<U>(_fn: (error: E) => Result<U, E>): Result<T, E> {
    return this;
  }

  or<U>(_other: Result<U, E>): Result<T, E> {
    return this;
  }

  tap(fn: (value: T) => void): Result<T, E> {
    fn(this.value);
    return this;
  }

  tapErr(_fn: (error: E) => void): Result<T, E> {
    return this;
  }

  flatten(): any {
    return this.value as any;
  }

  zip<U>(other: Result<U, E>): Result<[T, U], E> {
    if (!other.ok) return other;
    return new OkImpl<[T, U], E>([this.value, other.value]);
  }

  zipWith<U, V>(other: Result<U, E>, fn: (t: T, u: U) => V): Result<V, E> {
    if (!other.ok) return other;
    return new OkImpl<V, E>(fn(this.value, other.value));
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_fallback: T): T {
    return this.value;
  }

  expect(_msg: string): T {
    return this.value;
  }

  match<U>(onOk: (value: T) => U, _onErr: (error: E) => U): U {
    return onOk(this.value);
  }

  toJSON(): { ok: true; value: T } {
    return { ok: true, value: this.value };
  }
}

// ── Err (no T — error results don't carry a value type) ──

class ErrImpl<E> extends ResultBase<never, E> {
  readonly ok = false as const;

  constructor(readonly error: E) {
    super();
  }

  map<U>(_fn: (value: never) => U): Result<U, E> {
    return this;
  }

  mapErr<F>(fn: (error: E) => F): Result<never, F> {
    return new ErrImpl<F>(fn(this.error));
  }

  andThen<U>(_fn: (value: never) => Result<U, E>): Result<U, E> {
    return this;
  }

  orElse<U>(fn: (error: E) => Result<U, E>): Result<U, E> {
    return fn(this.error);
  }

  or<U>(other: Result<U, E>): Result<U, E> {
    return other;
  }

  tap(_fn: (value: never) => void): Result<never, E> {
    return this;
  }

  tapErr(fn: (error: E) => void): Result<never, E> {
    fn(this.error);
    return this;
  }

  flatten(): any {
    return this;
  }

  zip<U>(_other: Result<U, E>): Result<[never, U], E> {
    return this;
  }

  zipWith<U, V>(_other: Result<U, E>, _fn: (t: never, u: U) => V): Result<V, E> {
    return this;
  }

  unwrap(): never {
    throw this.error;
  }

  unwrapOr<U>(fallback: U): U {
    return fallback;
  }

  expect(msg: string): never {
    throw new Error(msg);
  }

  match<U>(_onOk: (value: never) => U, onErr: (error: E) => U): U {
    return onErr(this.error);
  }

  toJSON(): { ok: false; error: E } {
    return { ok: false, error: this.error };
  }
}

// ── Public type ──

/**
 * A discriminated union for type-safe error handling.
 *
 * Represents either a successful value (`Ok`) or an error (`Err`).
 * Both variants are class instances, so you can chain methods directly:
 *
 * ```ts
 * ok(5).map(v => v * 2).andThen(v => ok(v + 1)).unwrapOr(0);
 * ```
 *
 * @typeParam T - The success value type.
 * @typeParam E - The error type (defaults to `Error`).
 */
export type Result<T, E = Error> = OkImpl<T, E> | ErrImpl<E>;

// ── Constructors ──

/**
 * Creates a successful {@link Result}.
 *
 * @typeParam T - The success value type.
 * @typeParam E - The error type (defaults to `never`).
 * @param value - The value to wrap.
 * @returns A `Result` with `ok: true`.
 *
 * @example
 * ```ts
 * ok(42);               // Result<number>
 * ok<number, string>(5); // Result<number, string>
 * ```
 */
export const ok = <T, E = never>(value: T): Result<T, E> => new OkImpl<T, E>(value);

/**
 * Creates a failed {@link Result}.
 *
 * @typeParam E - The error type.
 * @param error - The error to wrap.
 * @returns A `Result` with `ok: false`.
 *
 * @example
 * ```ts
 * err("something went wrong");     // Result<never, string>
 * err(new Error("boom"));          // Result<never, Error>
 * ```
 */
export const err = <E = unknown>(error: E): Result<never, E> => new ErrImpl<E>(error);
