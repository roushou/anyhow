import { createSchema, fail } from "./core.js";
import { ok, err } from "@anyhow/core/result";
import type { Schema } from "./types.js";

/**
 * Returns a schema that validates `string` values.
 *
 * @returns A schema that accepts strings and rejects everything else.
 *
 * @example
 * ```ts
 * s.string().parse("hello"); // { ok: true, value: "hello" }
 * s.string().parse(42);      // { ok: false, error: { expected: "string", ... } }
 * ```
 */
export function string(): Schema<string> {
  return createSchema((data, path) => {
    if (typeof data !== "string") return err(fail(path, "string", data));
    return ok(data);
  });
}

/**
 * Returns a schema that validates `number` values (excluding `NaN`).
 *
 * @returns A schema that accepts finite numbers and rejects `NaN` and non-numbers.
 *
 * @example
 * ```ts
 * s.number().parse(42);     // { ok: true, value: 42 }
 * s.number().parse("42");   // { ok: false, error: { expected: "number", ... } }
 * s.number().parse(NaN);    // { ok: false }
 * ```
 */
export function number(): Schema<number> {
  return createSchema((data, path) => {
    if (typeof data !== "number" || Number.isNaN(data)) return err(fail(path, "number", data));
    return ok(data);
  });
}

/**
 * Returns a schema that validates `boolean` values.
 *
 * @returns A schema that accepts `true` and `false`, rejecting everything else.
 *
 * @example
 * ```ts
 * s.boolean().parse(true);  // { ok: true, value: true }
 * s.boolean().parse(1);     // { ok: false, error: { expected: "boolean", ... } }
 * ```
 */
export function boolean(): Schema<boolean> {
  return createSchema((data, path) => {
    if (typeof data !== "boolean") return err(fail(path, "boolean", data));
    return ok(data);
  });
}

/**
 * Returns a schema that validates an exact literal value.
 *
 * @typeParam T - The literal type (e.g. `"hello"`, `42`, `true`, `null`).
 * @param value - The expected literal value.
 * @returns A schema that accepts only `value`.
 *
 * @example
 * ```ts
 * s.literal("hello").parse("hello"); // { ok: true, value: "hello" }
 * s.literal("hello").parse("world"); // { ok: false }
 * ```
 */
export function literal<T extends string | number | boolean | null>(value: T): Schema<T> {
  return createSchema((data, path) => {
    if (data !== value) return err(fail(path, JSON.stringify(value), data));
    return ok(data as T);
  });
}

/**
 * Returns a schema that validates a value is one of the allowed literals.
 *
 * @typeParam T - The union of literal string types.
 * @param values - The allowed values.
 * @returns A schema that accepts only values in `values`.
 *
 * @example
 * ```ts
 * s.enum(["a", "b", "c"]).parse("b"); // { ok: true, value: "b" }
 * s.enum(["a", "b"]).parse("c");      // { ok: false }
 * ```
 */
export function enum_<T extends string>(values: readonly T[]): Schema<T> {
  return createSchema((data, path) => {
    if (typeof data !== "string" || !values.includes(data as T))
      return err(fail(path, `one of [${values.map((v) => `"${v}"`).join(", ")}]`, data));
    return ok(data as T);
  });
}
