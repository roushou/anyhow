import { ok, err, type Result } from "./result.js";

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

/** Static combinators. Re-exported as `Result` from the barrel. */
export const ResultStatic = {
  ok,
  err,

  /** Wraps a synchronous function that may throw. */
  from<T>(fn: () => T): Result<T> {
    try {
      return ok(fn());
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  },

  /** Wraps an async function that may throw. */
  async fromAsync<T>(fn: () => Promise<T>): Promise<Result<T>> {
    try {
      return ok(await fn());
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  },

  /** Converts a nullable value to a Result. */
  fromNullable<T>(value: T | null | undefined, error: Error): Result<T, Error> {
    return value != null ? ok(value) : err(error);
  },

  /** Combines an array of Results. Returns Ok(values) or the first Err. */
  all<T, E>(results: Result<T, E>[]): Result<T[], E> {
    const values: T[] = [];
    for (const r of results) {
      if (!r.ok) return r as unknown as Result<T[], E>;
      values.push(r.value);
    }
    return ok(values);
  },

  /** Partitions Results into ok and err arrays. */
  partition<T, E>(results: Result<T, E>[]): { ok: T[]; err: E[] } {
    const o: T[] = [];
    const e: E[] = [];
    for (const r of results) {
      if (r.ok) o.push(r.value);
      else e.push(r.error);
    }
    return { ok: o, err: e };
  },

  /** Returns the first successful Result, or all errors. */
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
