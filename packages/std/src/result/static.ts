import { ok, err, type Result } from "./result.js";
import { some, none, type Option } from "../option/option.js";

/** Internal: wraps a throwy sync function in a Result. */
function sync_<T>(fn: () => T): Result<T> {
  try {
    return ok(fn());
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

// ── Standalone overloaded functions ──

/**
 * Parses JSON text into a {@link Result} instead of throwing.
 *
 * @param text - The JSON string to parse.
 * @param validator - Optional type guard, or a function returning a `Result`
 *   (such as `Schema.parse` from `@anyhow/schema`).
 * @returns `Ok(parsed)` on success, `Err(SyntaxError)` on invalid JSON,
 *   or `Err` if validation fails.
 *
 * @example
 * ```ts
 * const parsed = Result.json<{ name: string }>('{"name":"Alice"}');
 * if (parsed.ok) console.log(parsed.value.name);
 *
 * // With a schema:
 * const User = s.object({ name: s.string() });
 * const user = Result.json('{"name":"Alice"}', User.parse);
 * ```
 */
function json<T = unknown>(text: string): Result<T>;
function json<T>(text: string, validator: (v: unknown) => v is T): Result<T>;
function json<T>(text: string, validator: (v: unknown) => Result<T, any>): Result<T>;
function json<T>(text: string, validator?: (v: T) => any): Result<T> {
  const result = sync_(() => JSON.parse(text) as T);
  if (!result.ok) return result;
  if (validator) {
    const validated: any = validator(result.value);
    if (typeof validated === "boolean") {
      if (!validated)
        return err(new Error("JSON validation failed: value did not match the expected shape"));
    } else if (!validated.ok) {
      return validated;
    }
  }
  return result;
}

/**
 * Stringifies a value to JSON, returning a {@link Result} instead of throwing.
 * Catches circular references and other `JSON.stringify` errors.
 *
 * @param value - The value to stringify.
 * @param space - Optional indentation (number of spaces or a string).
 * @returns `Ok(json)` on success, `Err(error)` on failure.
 *
 * @example
 * ```ts
 * Result.jsonStringify({ name: "Alice" }, 2);
 * ```
 */
function jsonStringify(value: unknown, space?: string | number): Result<string> {
  return sync_(() => JSON.stringify(value, null, space));
}

/**
 * Parses a string into an integer, returning a {@link Result} instead of
 * returning `NaN`.
 *
 * @param text - The string to parse.
 * @param radix - The radix (base), defaulting to `10`.
 * @returns `Ok(number)` on success, `Err(Error)` if the result is `NaN`.
 *
 * @example
 * ```ts
 * Result.parseInt("42");    // { ok: true, value: 42 }
 * Result.parseInt("hello"); // { ok: false }
 * ```
 */
function parseInt_(text: string, radix?: number): Result<number> {
  const n = Number.parseInt(text, radix);
  if (Number.isNaN(n)) return err(new Error(`Failed to parse "${text}" as integer`));
  return ok(n);
}

/**
 * Parses a string into a float, returning a {@link Result} instead of
 * returning `NaN`.
 *
 * @param text - The string to parse.
 * @returns `Ok(number)` on success, `Err(Error)` if the result is `NaN`.
 *
 * @example
 * ```ts
 * Result.parseFloat("3.14");  // { ok: true, value: 3.14 }
 * Result.parseFloat("hello"); // { ok: false }
 * ```
 */
function parseFloat_(text: string): Result<number> {
  const n = Number.parseFloat(text);
  if (Number.isNaN(n)) return err(new Error(`Failed to parse "${text}" as float`));
  return ok(n);
}

/**
 * Decodes a URI component, returning a {@link Result} instead of throwing
 * on malformed input.
 *
 * @param encoded - The encoded URI component.
 * @returns `Ok(decoded)` on success, `Err(URIError)` on failure.
 *
 * @example
 * ```ts
 * Result.decodeURIComponent("hello%20world"); // { ok: true, value: "hello world" }
 * Result.decodeURIComponent("%ZZ");           // { ok: false }
 * ```
 */
function decodeURIComponent_(encoded: string): Result<string> {
  return sync_(() => decodeURIComponent(encoded));
}

// Overloaded all: array form + object form. Defined outside the object
// so TypeScript can infer overload signatures.
function all<T, E>(results: Result<T, E>[]): Result<T[], E>;
function all<T extends Record<string, Result<any, E>>, E>(
  results: T,
): Result<{ [K in keyof T]: T[K] extends Result<infer V, E> ? V : never }, E>;
function all(results: any): any {
  if (Array.isArray(results)) {
    const values: any[] = [];
    for (const r of results) {
      if (!r.ok) return r;
      values.push(r.value);
    }
    return ok(values);
  }
  // Object form
  const acc: any = {};
  for (const key of Object.keys(results)) {
    const r = results[key];
    if (!r.ok) return r;
    acc[key] = r.value;
  }
  return ok(acc);
}

/** Static combinators. Re-exported as `Result` from the barrel. */
export const ResultStatic = {
  ok,
  err,

  /**
   * Wraps a synchronous function that may throw, returning a {@link Result}
   * instead of propagating the exception.
   *
   * If `fn` throws, the error is wrapped in `Err` — non-`Error` values are
   * converted to `Error` via `String(e)`.
   *
   * @typeParam T - The return type of `fn`.
   * @param fn - A synchronous function that may throw.
   * @returns `Ok(fn())` on success, `Err(error)` if `fn` throws.
   *
   * @example
   * ```ts
   * const result = Result.from(() => JSON.parse('{"name":"Alice"}'));
   * // { ok: true, value: { name: "Alice" } }
   *
   * const err = Result.from(() => JSON.parse("invalid"));
   * // { ok: false, error: SyntaxError }
   * ```
   */
  from<T>(fn: () => T): Result<T> {
    try {
      return ok(fn());
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  },

  /**
   * Wraps an async function that may throw, returning a `Promise<`{@link Result}`>`
   * instead of rejecting the promise.
   *
   * If `fn` throws (or its returned promise rejects), the error is wrapped in
   * `Err` — non-`Error` values are converted to `Error` via `String(e)`.
   *
   * @typeParam T - The resolved type of the promise returned by `fn`.
   * @param fn - An async function that may throw or reject.
   * @returns A promise that resolves to `Ok(value)` on success, or `Err(error)`
   *   if `fn` throws or rejects.
   *
   * @example
   * ```ts
   * const result = await Result.fromAsync(() => fetch("https://api.example.com"));
   * // { ok: true, value: Response } or { ok: false, error: Error }
   * ```
   */
  async fromAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
    try {
      return ok(await fn());
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  },

  /**
   * Converts a nullable value to a {@link Result}, returning `Ok` for non-null-ish
   * values and `Err` with the provided error otherwise.
   *
   * @typeParam T - The non-nullable value type.
   * @param value - The value to test (may be `null` or `undefined`).
   * @param error - The error to use if `value` is `null` or `undefined`.
   * @returns `Ok(value)` if `value != null`, otherwise `Err(error)`.
   *
   * @example
   * ```ts
   * Result.fromNullable("hello", new Error("missing"));
   * // { ok: true, value: "hello" }
   *
   * Result.fromNullable(null, new Error("missing"));
   * // { ok: false, error: Error("missing") }
   * ```
   */
  fromNullable<T>(value: T | null | undefined, error: Error): Result<T, Error> {
    return value != null ? ok(value) : err(error);
  },

  /**
   * Combines an array of {@link Result}s into a single `Result`.
   *
   * Returns `Ok(array_of_values)` if every result is `Ok`, otherwise returns
   * the first `Err` encountered (short-circuiting).
   *
   * @typeParam T - The ok value type.
   * @typeParam E - The error type.
   * @param results - An array of `Result<T, E>` to combine.
   * @returns `Ok(T[])` if all results are `Ok`, otherwise the first `Err(E)`.
   *
   * @example
   * ```ts
   * Result.all([ok(1), ok(2), ok(3)]);
   * // { ok: true, value: [1, 2, 3] }
   *
   * Result.all([ok(1), err("fail"), ok(3)]);
   * // { ok: false, error: "fail" }
   * ```
   *
   * @example
   * ```ts
   * // Object form — validates a record of {@link Result}s into a typed object:
   * const user = Result.all({
   *   name: validateName(input),
   *   email: validateEmail(input),
   *   age: validateAge(input),
   * });
   * // Ok({ name: "Alice", email: "...", age: 30 }) or Err(first error)
   * ```
   */
  all,

  /**
   * Partitions an array of {@link Result}s into separate `ok` and `err` arrays.
   *
   * Unlike {@link Result.all}, this never short-circuits — every result is
   * visited and sorted into the appropriate bucket.
   *
   * @typeParam T - The ok value type.
   * @typeParam E - The error type.
   * @param results - An array of `Result<T, E>` to partition.
   * @returns An object `{ ok: T[], err: E[] }` with successes and failures
   *   separated.
   *
   * @example
   * ```ts
   * const { ok, err } = Result.partition([ok(1), err("fail"), ok(3)]);
   * // ok: [1, 3], err: ["fail"]
   * ```
   */
  partition<T, E>(results: Result<T, E>[]): { ok: T[]; err: E[] } {
    const o: T[] = [];
    const e: E[] = [];
    for (const r of results) {
      if (r.ok) o.push(r.value);
      else e.push(r.error);
    }
    return { ok: o, err: e };
  },

  /**
   * Transposes a `Result<Option<T>, E>` into an `Option<Result<T, E>>`.
   *
   * - `Ok(some(value))` becomes `some(ok(value))`
   * - `Ok(none())` becomes `none()`
   * - `Err(e)` becomes `some(err(e))`
   *
   * Useful when you have a {@link Result} that may or may not contain a value
   * and you want to unwrap the {@link Option} layer.
   *
   * @typeParam T - The inner ok value type.
   * @typeParam E - The error type.
   * @param r - A `Result<Option<T>, E>`.
   * @returns `Option<Result<T, E>>`.
   *
   * @example
   * ```ts
   * Result.transpose(ok(some(42)));  // some(ok(42))
   * Result.transpose(ok(none()));    // none()
   * Result.transpose(err("fail"));   // some(err("fail"))
   * ```
   */
  transpose<T, E>(r: Result<Option<T>, E>): Option<Result<T, E>> {
    if (!r.ok) return some(r as unknown as Result<T, E>);
    const opt = r.value;
    if (opt.isNone()) return none();
    return some(ok(opt.value));
  },

  /**
   * Returns the first successful {@link Result} from an array, or an `Err`
   * containing all collected errors if none succeeded.
   *
   * Iterates through results in order, returning the first `Ok` immediately.
   * If every result is `Err`, returns `Err` with an array of every error.
   *
   * @typeParam T - The ok value type.
   * @typeParam E - The error type.
   * @param results - An array of `Result<T, E>` to search.
   * @returns The first `Ok(T)` found, or `Err(E[])` if all results failed.
   *
   * @example
   * ```ts
   * Result.any([err("a"), ok(2), err("c")]);
   * // { ok: true, value: 2 }
   *
   * Result.any([err("a"), err("b")]);
   * // { ok: false, error: ["a", "b"] }
   * ```
   */
  any<T, E>(results: Result<T, E>[]): Result<T, E[]> {
    const errors: E[] = [];
    for (const r of results) {
      if (r.ok) return ok(r.value);
      errors.push(r.error);
    }
    return err(errors);
  },

  json,
  jsonStringify,
  parseInt: parseInt_,
  parseFloat: parseFloat_,
  decodeURIComponent: decodeURIComponent_,
};
