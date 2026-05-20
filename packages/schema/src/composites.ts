import { createSchema, fail, joinPath } from "./core.js";
import type { Schema, ObjectSchema, InferShape } from "./types.js";

// ── Composites ──

/**
 * Returns a schema that validates an object with known keys.
 *
 * Extra properties are allowed by default — use `.strict()` to reject them.
 *
 * @typeParam T - The shape (a record of string keys to schemas).
 * @param shape - An object mapping keys to their schemas.
 *
 * @example
 * ```ts
 * const User = s.object({
 *   name: s.string(),
 *   age: s.number(),
 * });
 * User.parse({ name: "Alice", age: 30 });
 * // { ok: true, value: { name: "Alice", age: 30 } }
 * ```
 */
export function object<T extends Record<string, Schema<any>>>(
  shape: T,
): ObjectSchema<InferShape<T>> {
  const baseSchema = createSchema<InferShape<T>>((data, path) => {
    if (typeof data !== "object" || data === null)
      return { ok: false, error: fail(path, "object", data) };

    const record = data as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(shape)) {
      const parsed = shape[key]!.parse(record[key]);
      if (!parsed.ok) {
        const nested = parsed.error;
        return {
          ok: false,
          error: {
            ...nested,
            path: joinPath(path, key) + (nested.path ? `.${nested.path}` : ""),
          },
        };
      }
      result[key] = parsed.value;
    }

    return { ok: true, value: result as InferShape<T> };
  });

  return {
    ...baseSchema,

    strict(): ObjectSchema<InferShape<T>> {
      return objectWithMode(shape, "strict");
    },

    passthrough(): ObjectSchema<InferShape<T>> {
      return this;
    },

    partial(): ObjectSchema<Partial<InferShape<T>>> {
      const partialShape = {} as Record<string, Schema<any>>;
      for (const key of Object.keys(shape)) {
        partialShape[key] = shape[key]!.optional();
      }
      return object(partialShape) as ObjectSchema<Partial<InferShape<T>>>;
    },

    required(): ObjectSchema<InferShape<T>> {
      const requiredShape = {} as Record<string, Schema<any>>;
      for (const key of Object.keys(shape)) {
        requiredShape[key] = shape[key]!.refine((v) => v !== undefined, `${key} is required`);
      }
      return object(requiredShape) as ObjectSchema<InferShape<T>>;
    },
  };
}

function objectWithMode<T extends Record<string, Schema<any>>>(
  shape: T,
  mode: "passthrough" | "strict",
): ObjectSchema<InferShape<T>> {
  const baseSchema = createSchema<InferShape<T>>((data, path) => {
    if (typeof data !== "object" || data === null)
      return { ok: false, error: fail(path, "object", data) };

    const record = data as Record<string, unknown>;

    if (mode === "strict") {
      for (const key of Object.keys(record)) {
        if (!(key in shape)) {
          return { ok: false, error: fail(joinPath(path, key), "no extra keys", key) };
        }
      }
    }

    const result: Record<string, unknown> = {};

    for (const key of Object.keys(shape)) {
      const parsed = shape[key]!.parse(record[key]);
      if (!parsed.ok) {
        const nested = parsed.error;
        return {
          ok: false,
          error: {
            ...nested,
            path: joinPath(path, key) + (nested.path ? `.${nested.path}` : ""),
          },
        };
      }
      result[key] = parsed.value;
    }

    return { ok: true, value: result as InferShape<T> };
  });

  return {
    ...baseSchema,

    strict(): ObjectSchema<InferShape<T>> {
      return this;
    },

    passthrough(): ObjectSchema<InferShape<T>> {
      return objectWithMode(shape, "passthrough");
    },

    partial(): ObjectSchema<Partial<InferShape<T>>> {
      const partialShape = {} as Record<string, Schema<any>>;
      for (const key of Object.keys(shape)) {
        partialShape[key] = shape[key]!.optional();
      }
      return object(partialShape) as ObjectSchema<Partial<InferShape<T>>>;
    },

    required(): ObjectSchema<InferShape<T>> {
      const requiredShape = {} as Record<string, Schema<any>>;
      for (const key of Object.keys(shape)) {
        requiredShape[key] = shape[key]!.refine((v) => v !== undefined, `${key} is required`);
      }
      return object(requiredShape) as ObjectSchema<InferShape<T>>;
    },
  };
}

/**
 * Returns a schema that validates an array where every element matches `itemSchema`.
 *
 * @typeParam T - The element type.
 * @param itemSchema - Schema to apply to each element.
 *
 * @example
 * ```ts
 * s.array(s.number()).parse([1, 2, 3]); // { ok: true, value: [1, 2, 3] }
 * ```
 */
export function array<T>(itemSchema: Schema<T>): Schema<T[]> {
  return createSchema((data, path) => {
    if (!Array.isArray(data)) return { ok: false, error: fail(path, "array", data) };

    const arr = data as unknown[];
    const result: T[] = [];

    for (let i = 0; i < arr.length; i++) {
      const parsed = itemSchema.parse(arr[i]);
      if (!parsed.ok) {
        const nested = parsed.error;
        return {
          ok: false,
          error: {
            ...nested,
            path: joinPath(path, i) + (nested.path ? `.${nested.path}` : ""),
          },
        };
      }
      result.push(parsed.value);
    }

    return { ok: true, value: result };
  });
}

/**
 * Returns a schema that validates a fixed-length tuple.
 *
 * @typeParam T - A tuple of schemas.
 * @param schemas - The element schemas in order.
 *
 * @example
 * ```ts
 * s.tuple([s.string(), s.number()]).parse(["hello", 42]);
 * // { ok: true, value: ["hello", 42] }
 * ```
 */
export function tuple<T extends [Schema<any>, ...Schema<any>[]]>(
  schemas: T,
): Schema<{ [K in keyof T]: T[K] extends Schema<infer U> ? U : never }> {
  return createSchema((data, path) => {
    if (!Array.isArray(data)) return { ok: false, error: fail(path, "tuple", data) };
    if (data.length !== schemas.length)
      return { ok: false, error: fail(path, `tuple of length ${schemas.length}`, data) };

    const arr = data as unknown[];
    const result: unknown[] = [];

    for (let i = 0; i < schemas.length; i++) {
      const parsed = schemas[i]!.parse(arr[i]);
      if (!parsed.ok) {
        const nested = parsed.error;
        return {
          ok: false,
          error: {
            ...nested,
            path: joinPath(path, i) + (nested.path ? `.${nested.path}` : ""),
          },
        };
      }
      result.push(parsed.value);
    }

    return { ok: true, value: result as any };
  });
}

/**
 * Returns a schema that validates a value matches any of the given schemas
 * (tried in order).
 *
 * @typeParam T - The union of schema types.
 * @param schemas - Schemas to try in order.
 *
 * @example
 * ```ts
 * s.union([s.string(), s.number()]).parse("hello"); // { ok: true, value: "hello" }
 * s.union([s.string(), s.number()]).parse(42);       // { ok: true, value: 42 }
 * ```
 */
export function union<T extends Schema<any>[]>(
  schemas: T,
): Schema<T[number] extends Schema<infer U> ? U : never> {
  return createSchema((data, path) => {
    for (const schema of schemas) {
      const parsed = schema.parse(data);
      if (parsed.ok) return parsed as any;
    }
    return { ok: false, error: fail(path, "union", data) };
  });
}
