import { createSchema, fail } from "./core.js";
import { ok, err } from "../result/result.js";
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

/**
 * Returns a schema that accepts any value (never fails).
 *
 * @returns A schema that passes everything through.
 *
 * @example
 * ```ts
 * s.any().parse("hello"); // { ok: true, value: "hello" }
 * s.any().parse(42);      // { ok: true, value: 42 }
 * ```
 */
export function any(): Schema<any> {
  return createSchema((data) => ok(data));
}

/**
 * Returns a schema that validates `undefined`.
 *
 * @returns A schema that accepts only `undefined`.
 *
 * @example
 * ```ts
 * s.undefined().parse(undefined); // { ok: true, value: undefined }
 * s.undefined().parse(null);      // { ok: false }
 * ```
 */
export function undefined_(): Schema<undefined> {
  return createSchema((data, path) => {
    if (data !== undefined) return err(fail(path, "undefined", data));
    return ok(undefined);
  });
}

/**
 * Returns a schema that validates `null`.
 *
 * @returns A schema that accepts only `null`.
 *
 * @example
 * ```ts
 * s.null().parse(null);      // { ok: true, value: null }
 * s.null().parse(undefined); // { ok: false }
 * ```
 */
export function null_(): Schema<null> {
  return createSchema((data, path) => {
    if (data !== null) return err(fail(path, "null", data));
    return ok(null);
  });
}

/**
 * Returns a schema that validates `instanceof` a constructor.
 *
 * @typeParam T - The instance type.
 * @param ctor - The constructor to check against.
 * @returns A schema that accepts instances of `ctor`.
 *
 * @example
 * ```ts
 * s.instanceof(Date).parse(new Date()); // { ok: true, value: Date }
 * s.instanceof(Date).parse("2024");     // { ok: false }
 * ```
 */
export function instanceof_<T>(ctor: new (...args: any[]) => T): Schema<T> {
  return createSchema((data, path) => {
    if (!(data instanceof ctor)) return err(fail(path, ctor.name, data));
    return ok(data as T);
  });
}
