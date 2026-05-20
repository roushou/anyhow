import { createSchema, fail } from "./core.js";
import type { Schema } from "./types.js";

// ── Primitives ──

/**
 * Returns a schema that validates `string` values.
 *
 * @example
 * ```ts
 * s.string().parse("hello"); // { ok: true, value: "hello" }
 * s.string().parse(42);      // { ok: false, error: { expected: "string", ... } }
 * ```
 */
export function string(): Schema<string> {
  return createSchema((data, path) => {
    if (typeof data !== "string") return { ok: false, error: fail(path, "string", data) };
    return { ok: true, value: data };
  });
}

/**
 * Returns a schema that validates `number` values (excluding `NaN`).
 *
 * @example
 * ```ts
 * s.number().parse(42);     // { ok: true, value: 42 }
 * s.number().parse("42");   // { ok: false, error: { expected: "number", ... } }
 * s.number().parse(NaN);    // { ok: false, error: { expected: "number", ... } }
 * ```
 */
export function number(): Schema<number> {
  return createSchema((data, path) => {
    if (typeof data !== "number" || Number.isNaN(data))
      return { ok: false, error: fail(path, "number", data) };
    return { ok: true, value: data };
  });
}

/**
 * Returns a schema that validates `boolean` values.
 *
 * @example
 * ```ts
 * s.boolean().parse(true);  // { ok: true, value: true }
 * s.boolean().parse(1);     // { ok: false, error: { expected: "boolean", ... } }
 * ```
 */
export function boolean(): Schema<boolean> {
  return createSchema((data, path) => {
    if (typeof data !== "boolean") return { ok: false, error: fail(path, "boolean", data) };
    return { ok: true, value: data };
  });
}

/**
 * Returns a schema that validates an exact literal value.
 *
 * @typeParam T - The literal type (e.g. `"hello"`, `42`).
 * @param value - The expected literal value.
 *
 * @example
 * ```ts
 * s.literal("hello").parse("hello"); // { ok: true, value: "hello" }
 * s.literal("hello").parse("world"); // { ok: false, error: { ... } }
 * ```
 */
export function literal<T extends string | number | boolean | null>(value: T): Schema<T> {
  return createSchema((data, path) => {
    if (data !== value) return { ok: false, error: fail(path, JSON.stringify(value), data) };
    return { ok: true, value: data as T };
  });
}

/**
 * Returns a schema that validates a value is one of the allowed literals.
 *
 * @typeParam T - The union of literal types.
 * @param values - The allowed values.
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
      return {
        ok: false,
        error: fail(path, `one of [${values.map((v) => `"${v}"`).join(", ")}]`, data),
      };
    return { ok: true, value: data as T };
  });
}
