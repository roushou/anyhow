import { some } from "./constructors.js";
import type { Option } from "./types.js";

/**
 * Transforms the `Some` value of an {@link Option} using `fn`, leaving `None` untouched.
 *
 * @typeParam T - The input value type.
 * @typeParam U - The output value type.
 * @param opt - The option to map over.
 * @param fn - The transformation applied to the `Some` value.
 * @returns A new `Option<U>`.
 *
 * @example
 * ```ts
 * map(some(5), v => v * 2); // { some: true, value: 10 }
 * map(none(), v => v * 2); // { some: false }
 * ```
 */
export function map<T, U>(opt: Option<T>, fn: (value: T) => U): Option<U> {
  if (opt.some) return some(fn(opt.value));
  return opt;
}

/**
 * Chains an optional operation onto an {@link Option}. If `Some`, calls `fn`
 * with the value and returns its result. If `None`, short-circuits and returns `None`.
 *
 * @typeParam T - The input value type.
 * @typeParam U - The output value type.
 * @param opt - The option to chain.
 * @param fn - A function returning a new `Option`.
 * @returns The result of `fn` if `Some`, or `None`.
 *
 * @example
 * ```ts
 * andThen(some(5), v => some(v * 2)); // { some: true, value: 10 }
 * andThen(none(), v => some(v * 2)); // { some: false }
 * andThen(some(-1), v => v < 0 ? none() : some(v)); // { some: false }
 * ```
 */
export function andThen<T, U>(opt: Option<T>, fn: (value: T) => Option<U>): Option<U> {
  if (opt.some) return fn(opt.value);
  return opt;
}

/**
 * Extracts the value from a `Some` variant, returning `fallback` if `None`.
 *
 * @typeParam T - The value type.
 * @param opt - The option to unwrap.
 * @param fallback - The value to return if `None`.
 * @returns The inner value or `fallback`.
 *
 * @example
 * ```ts
 * unwrapOr(some(42), 0); // 42
 * unwrapOr(none(), 0); // 0
 * ```
 */
export function unwrapOr<T>(opt: Option<T>, fallback: T): T {
  if (opt.some) return opt.value;
  return fallback;
}

/**
 * Pattern-matches on an {@link Option}, calling `onSome` or `onNone` depending
 * on the variant.
 *
 * @typeParam T - The input value type.
 * @typeParam U - The output type (both branches must return this).
 * @param opt - The option to match on.
 * @param onSome - Called with the value if `Some`.
 * @param onNone - Called if `None`.
 * @returns The return value of whichever branch matches.
 *
 * @example
 * ```ts
 * match(some(5), v => `Got ${v}`, () => "Got nothing"); // "Got 5"
 * match(none(), v => `Got ${v}`, () => "Got nothing"); // "Got nothing"
 * ```
 */
export function match<T, U>(opt: Option<T>, onSome: (value: T) => U, onNone: () => U): U {
  if (opt.some) return onSome(opt.value);
  return onNone();
}

/**
 * Returns `opt` if it is `Some`, otherwise returns `other`.
 *
 * @typeParam T - The value type.
 * @param opt - The primary option.
 * @param other - The fallback option.
 * @returns `opt` if `Some`, else `other`.
 *
 * @example
 * ```ts
 * or(some(1), some(2)); // { some: true, value: 1 }
 * or(none(), some(2)); // { some: true, value: 2 }
 * or(none(), none()); // { some: false }
 * ```
 */
export function or<T>(opt: Option<T>, other: Option<T>): Option<T> {
  if (opt.some) return opt;
  return other;
}

/**
 * Returns `opt` if it is `Some`, otherwise calls `fn` and returns its result.
 *
 * @typeParam T - The value type.
 * @param opt - The primary option.
 * @param fn - A function returning a fallback `Option`.
 * @returns `opt` if `Some`, else the result of `fn`.
 *
 * @example
 * ```ts
 * orElse(some(1), () => some(2)); // { some: true, value: 1 }
 * orElse(none(), () => some(2)); // { some: true, value: 2 }
 * orElse(none(), () => none()); // { some: false }
 * ```
 */
export function orElse<T>(opt: Option<T>, fn: () => Option<T>): Option<T> {
  if (opt.some) return opt;
  return fn();
}

/**
 * Unwraps an {@link Option}, returning the value if `Some` or throwing an error if `None`.
 *
 * @typeParam T - The value type.
 * @param opt - The option to unwrap.
 * @param msg - The error message to throw if `None`.
 * @returns The inner `Some` value.
 * @throws An `Error` with the given `msg` if the option is `None`.
 *
 * @example
 * ```ts
 * expect(some(42), "expected a value"); // 42
 * expect(none(), "expected a value"); // throws Error("expected a value")
 * ```
 */
export function expect<T>(opt: Option<T>, msg: string): T {
  if (opt.some) return opt.value;
  throw new Error(msg);
}
