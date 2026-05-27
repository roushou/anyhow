// ── Private base (never exported) ──

abstract class OptionBase<T> {
  abstract readonly some: boolean;

  abstract map<U>(fn: (value: T) => U): Option<U>;
  abstract andThen<U>(fn: (value: T) => Option<U>): Option<U>;
  abstract filter(pred: (value: T) => boolean): Option<T>;
  abstract tap(fn: (value: T) => void): Option<T>;
  abstract zip<U>(other: Option<U>): Option<[T, U]>;
  abstract zipWith<U, V>(other: Option<U>, fn: (t: T, u: U) => V): Option<V>;
  abstract flatten(): any;

  abstract unwrap(): T;
  abstract unwrapOr(fallback: T): T;
  abstract expect(msg: string): T;
  abstract match<U>(onSome: (value: T) => U, onNone: () => U): U;

  abstract isSome(): this is SomeImpl<T>;
  abstract isNone(): this is NoneImpl;
  abstract toJSON(): { some: true; value: T } | { some: false };
}

// ── Some ──

class SomeImpl<T> extends OptionBase<T> {
  readonly some = true as const;

  constructor(readonly value: T) {
    super();
  }

  map<U>(fn: (value: T) => U): Option<U> {
    return some(fn(this.value));
  }

  andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    return fn(this.value);
  }

  filter(pred: (value: T) => boolean): Option<T> {
    return pred(this.value) ? this : none();
  }

  orElse(_fn: () => Option<T>): Option<T> {
    return this;
  }

  or(_other: Option<T>): Option<T> {
    return this;
  }

  tap(fn: (value: T) => void): Option<T> {
    fn(this.value);
    return this;
  }

  zip<U>(other: Option<U>): Option<[T, U]> {
    return other.isSome() ? some([this.value, other.value]) : none();
  }

  zipWith<U, V>(other: Option<U>, fn: (t: T, u: U) => V): Option<V> {
    return other.isSome() ? some(fn(this.value, other.value)) : none();
  }

  flatten(): any {
    return this.value as any;
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

  match<U>(onSome: (value: T) => U, _onNone: () => U): U {
    return onSome(this.value);
  }

  isSome(): this is SomeImpl<T> {
    return true;
  }

  isNone(): this is NoneImpl {
    return false;
  }

  toJSON(): { some: true; value: T } {
    return { some: true, value: this.value };
  }
}

// ── None (singleton, uses any to stay flexible at call sites) ──

class NoneImpl extends OptionBase<never> {
  readonly some = false as const;

  map<U>(_fn: (value: never) => U): Option<U> {
    return this;
  }

  andThen<U>(_fn: (value: never) => Option<U>): Option<U> {
    return this;
  }

  filter(_pred: (value: never) => boolean): Option<never> {
    return this;
  }

  orElse<U>(fn: () => Option<U>): Option<U> {
    return fn();
  }

  or<U>(other: Option<U>): Option<U> {
    return other;
  }

  tap(_fn: (value: never) => void): Option<never> {
    return this;
  }

  zip<U>(_other: Option<U>): Option<[never, U]> {
    return this;
  }

  zipWith<U, V>(_other: Option<U>, _fn: (t: never, u: U) => V): Option<V> {
    return this;
  }

  flatten(): any {
    return this;
  }

  unwrap(): never {
    throw new Error("Called unwrap on None");
  }

  unwrapOr<U>(fallback: U): U {
    return fallback;
  }

  expect(msg: string): never {
    throw new Error(msg);
  }

  match<U>(_onSome: (value: never) => U, onNone: () => U): U {
    return onNone();
  }

  isSome(): this is SomeImpl<never> {
    return false;
  }

  isNone(): this is NoneImpl {
    return true;
  }

  toJSON(): { some: false } {
    return { some: false };
  }
}

// ── Singleton instance ──

const NONE = new NoneImpl();

// ── Public type ──

/**
 * A discriminated union for representing an optional value.
 *
 * `Some<T>` carries a value; `None` represents absence.
 * Both variants are class instances, so you can chain methods directly:
 *
 * ```ts
 * some(5).map(v => v * 2).unwrapOr(0);
 * ```
 *
 * @typeParam T - The value type.
 */
export type Option<T> = SomeImpl<T> | NoneImpl;

// ── Constructors ──

/**
 * Creates a `Some` variant of {@link Option}.
 *
 * @typeParam T - The value type.
 * @param value - The value to wrap.
 * @returns An `Option<T>` with `some: true`.
 *
 * @example
 * ```ts
 * some(42);     // Option<number>
 * some("hello"); // Option<string>
 * ```
 */
export const some = <T>(value: T): Option<T> => new SomeImpl(value);
/**
 * Creates a `None` variant of {@link Option}, representing absence.
 *
 * Returns a singleton — every call to `none()` returns the same object.
 *
 * @returns A singleton `Option<never>` with `some: false`.
 *
 * @example
 * ```ts
 * none();            // Option<never>
 * none() === none(); // true
 * ```
 */
export const none = (): Option<never> => NONE;
