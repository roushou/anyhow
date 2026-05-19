import { ok, err } from "./constructors.js";
import type { Result } from "./types.js";

/**
 * Transforms the `Ok` value of a {@link Result} using `fn`, leaving `Err` untouched.
 *
 * @typeParam T - The input ok type.
 * @typeParam U - The output ok type.
 * @typeParam E - The error type (passed through unchanged).
 * @param r - The result to map over.
 * @param fn - The transformation applied to the ok value.
 * @returns A new `Result<U, E>`.
 *
 * @example
 * ```ts
 * map(ok(5), v => v * 2); // { ok: true, value: 10 }
 * map(err("fail"), v => v * 2); // { ok: false, error: "fail" }
 * ```
 */
export function map<T, U, E>(r: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (r.ok) return ok(fn(r.value));
  return r;
}

/**
 * Transforms the `Err` value of a {@link Result} using `fn`, leaving `Ok` untouched.
 *
 * @typeParam T - The ok type (passed through unchanged).
 * @typeParam E - The input error type.
 * @typeParam F - The output error type.
 * @param r - The result to map over.
 * @param fn - The transformation applied to the error value.
 * @returns A new `Result<T, F>`.
 *
 * @example
 * ```ts
 * mapErr(err("fail"), e => new Error(e)); // { ok: false, error: Error("fail") }
 * mapErr(ok(5), e => new Error(e)); // { ok: true, value: 5 }
 * ```
 */
export function mapErr<T, E, F>(r: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (!r.ok) return err(fn(r.error));
  return r;
}

/**
 * Chains a fallible operation onto a {@link Result}. If `Ok`, calls `fn` with
 * the value and returns its result. If `Err`, short-circuits and returns the error.
 *
 * @typeParam T - The input ok type.
 * @typeParam U - The output ok type.
 * @typeParam E - The error type (passed through unchanged).
 * @param r - The result to chain.
 * @param fn - A function returning a new `Result`.
 * @returns The result of `fn` if `Ok`, or the original `Err`.
 *
 * @example
 * ```ts
 * andThen(ok(5), v => ok(v * 2)); // { ok: true, value: 10 }
 * andThen(err("fail"), v => ok(v * 2)); // { ok: false, error: "fail" }
 * ```
 */
export function andThen<T, U, E>(r: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
  if (r.ok) return fn(r.value);
  return r;
}

/**
 * Extracts the `Ok` value from a {@link Result}, throwing the error if `Err`.
 *
 * @typeParam T - The ok type.
 * @typeParam E - The error type.
 * @param r - The result to unwrap.
 * @returns The inner `Ok` value.
 * @throws The inner error if the result is `Err`.
 *
 * @example
 * ```ts
 * unwrap(ok(42)); // 42
 * unwrap(err("boom")); // throws "boom"
 * ```
 */
export function unwrap<T, E>(r: Result<T, E>): T {
  if (r.ok) return r.value;
  throw r.error;
}

/**
 * Extracts the `Ok` value from a {@link Result}, returning `fallback` if `Err`.
 *
 * @typeParam T - The ok type.
 * @typeParam E - The error type.
 * @param r - The result to unwrap.
 * @param fallback - The value to return if `Err`.
 * @returns The inner `Ok` value or `fallback`.
 *
 * @example
 * ```ts
 * unwrapOr(ok(42), 0); // 42
 * unwrapOr(err("fail"), 0); // 0
 * ```
 */
export function unwrapOr<T, E>(r: Result<T, E>, fallback: T): T {
  if (r.ok) return r.value;
  return fallback;
}

/**
 * Pattern-matches on a {@link Result}, calling `onOk` or `onErr` depending on the variant.
 *
 * @typeParam T - The ok type.
 * @typeParam U - The output type (both branches must return this).
 * @typeParam E - The error type.
 * @param r - The result to match on.
 * @param onOk - Called with the value if `Ok`.
 * @param onErr - Called with the error if `Err`.
 * @returns The return value of whichever branch matches.
 *
 * @example
 * ```ts
 * match(ok(5), v => `Got ${v}`, e => `Error: ${e}`); // "Got 5"
 * match(err("oops"), v => `Got ${v}`, e => `Error: ${e}`); // "Error: oops"
 * ```
 */
export function match<T, U, E>(r: Result<T, E>, onOk: (value: T) => U, onErr: (error: E) => U): U {
  if (r.ok) return onOk(r.value);
  return onErr(r.error);
}

/**
 * Returns `r` if `Ok`, otherwise returns `other`.
 *
 * @typeParam T - The ok type.
 * @typeParam E - The error type.
 * @param r - The primary result.
 * @param other - The fallback result.
 * @returns `r` if `Ok`, else `other`.
 *
 * @example
 * ```ts
 * or(ok(42), ok(0)); // { ok: true, value: 42 }
 * or(err("fail"), ok(0)); // { ok: true, value: 0 }
 * ```
 */
export function or<T, E>(r: Result<T, E>, other: Result<T, E>): Result<T, E> {
  if (r.ok) return r;
  return other;
}

/**
 * Returns `r` if `Ok`, otherwise calls `fn` and returns its result.
 *
 * `fn` is only called when `r` is `Err` (lazy).
 *
 * @typeParam T - The ok type.
 * @typeParam E - The error type.
 * @param r - The primary result.
 * @param fn - A function producing a fallback result (only called if `Err`).
 * @returns `r` if `Ok`, else the result of `fn`.
 *
 * @example
 * ```ts
 * orElse(err("fail"), e => ok(`recovered: ${e}`)); // { ok: true, value: "recovered: fail" }
 * orElse(ok(42), e => ok(0)); // { ok: true, value: 42 } (fn not called)
 * ```
 */
export function orElse<T, E>(r: Result<T, E>, fn: (error: E) => Result<T, E>): Result<T, E> {
  if (r.ok) return r;
  return fn(r.error);
}

/**
 * Extracts the `Ok` value from a {@link Result}, throwing a custom error
 * message if `Err`.
 *
 * @typeParam T - The ok type.
 * @typeParam E - The error type.
 * @param r - The result to unwrap.
 * @param msg - The error message to throw if `Err`.
 * @returns The inner `Ok` value.
 * @throws An `Error` with `msg` if the result is `Err`.
 *
 * @example
 * ```ts
 * expect(ok(42), "should have a value"); // 42
 * expect(err("boom"), "should have a value"); // throws Error("should have a value")
 * ```
 */
export function expect<T, E>(r: Result<T, E>, msg: string): T {
  if (r.ok) return r.value;
  throw new Error(msg);
}
