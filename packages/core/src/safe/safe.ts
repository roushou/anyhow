import { ok, err, type Result } from "../result/result.js";
import { ResultStatic as R } from "../result/static.js";
import { some, none, type Option } from "../option/option.js";

// `safe.sync` and `safe.async` delegate to `Result.from` / `Result.fromAsync`.
// These aliases exist so that `safe.*` reads as a coherent namespace for
// wrapping unsafe JavaScript operations.
const sync = R.from;
const async_ = R.fromAsync;

/**
 * Parses JSON text into a {@link Result} instead of throwing.
 *
 * @param text - The JSON string to parse.
 * @param validator - Optional type guard to validate the parsed value.
 * @returns `Ok(parsed)` on success, `Err(SyntaxError)` on invalid JSON,
 *   or `Err(Error)` if validation fails.
 *
 * @example
 * ```ts
 * const parsed = safe.json<{ name: string }>('{"name":"Alice"}');
 * if (parsed.ok) console.log(parsed.value.name);
 * ```
 */
function json<T = unknown>(text: string): Result<T>;
function json<T>(text: string, validator: (v: unknown) => v is T): Result<T>;
function json<T>(text: string, validator?: (v: unknown) => v is T): Result<T> {
  const result = sync(() => JSON.parse(text) as T);
  if (!result.ok) return result;
  if (validator) {
    if (!validator(result.value)) {
      return err(new Error("JSON validation failed: value did not match the expected shape"));
    }
  }
  return result;
}

/**
 * Stringifies a value to JSON, returning a {@link Result} instead of throwing.
 *
 * Catches circular references and other `JSON.stringify` errors.
 *
 * @param value - The value to stringify.
 * @param space - Optional indentation (number of spaces or a string).
 * @returns `Ok(json)` on success, `Err(error)` on failure.
 *
 * @example
 * ```ts
 * safe.jsonStringify({ name: "Alice" }, 2);
 * // { ok: true, value: '{\n  "name": "Alice"\n}' }
 * ```
 */
function jsonStringify(value: unknown, space?: string | number): Result<string> {
  return sync(() => JSON.stringify(value, null, space));
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
 * safe.parseInt("42");    // { ok: true, value: 42 }
 * safe.parseInt("hello"); // { ok: false, error: Error("...") }
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
 * safe.parseFloat("3.14");  // { ok: true, value: 3.14 }
 * safe.parseFloat("hello"); // { ok: false, error: Error("...") }
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
 * safe.decodeURIComponent("hello%20world"); // { ok: true, value: "hello world" }
 * safe.decodeURIComponent("%ZZ");           // { ok: false, error: URIError(...) }
 * ```
 */
function decodeURIComponent_(encoded: string): Result<string> {
  return sync(() => decodeURIComponent(encoded));
}

/**
 * Reads an environment variable, returning an {@link Option}.
 *
 * Returns `None` when the variable is missing — use {@link Result}
 * wrappers like `Result.from` for cases where a missing variable is an error.
 *
 * @param name - The environment variable name.
 * @returns `Some(value)` if set, `None` if missing.
 *
 * @example
 * ```ts
 * safe.env("API_KEY"); // { some: true, value: "sk-abc123" }
 * safe.env("MISSING"); // { some: false }
 * ```
 */
function env(name: string): Option<string> {
  const v = process.env[name];
  return v !== undefined ? some(v) : none();
}

export const safe = {
  sync,
  async: async_,
  json,
  jsonStringify,
  parseInt: parseInt_,
  parseFloat: parseFloat_,
  decodeURIComponent: decodeURIComponent_,
  env,
};
