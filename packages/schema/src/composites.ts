import { createSchema, fail, joinPath } from "./core.js";
import { ok, err } from "@anyhow/std/result";
import type { Schema, ObjectSchema, InferShape, ValidationError } from "./types.js";

// ── object ──

/**
 * Returns a schema that validates an object with known keys.
 *
 * Extra properties are allowed by default — use `.strict()` to reject them.
 *
 * @typeParam T - The shape (a record of string keys to schemas).
 * @param shape - An object mapping keys to their schemas.
 * @returns An {@link ObjectSchema} with `.strict()`, `.passthrough()`,
 *   `.partial()`, `.required()`, `.pick()`, `.omit()`, and `.extend()` modifiers.
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
    if (typeof data !== "object" || data === null) return err(fail(path, "object", data));

    const record = data as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(shape)) {
      const parsed = shape[key]!.parse(record[key]);
      if (!parsed.ok) {
        const nested = parsed.error;
        return err({
          ...nested,
          path: joinPath(path, key) + (nested.path ? `.${nested.path}` : ""),
        });
      }
      result[key] = parsed.value;
    }

    return ok(result as InferShape<T>);
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

    pick<K extends keyof InferShape<T>>(keys: K[]): ObjectSchema<Pick<InferShape<T>, K>> {
      const picked = {} as Record<string, Schema<any>>;
      for (const k of keys) {
        if (k in shape) picked[k as string] = shape[k as string]!;
      }
      return object(picked) as any;
    },

    omit<K extends keyof InferShape<T>>(keys: K[]): ObjectSchema<Omit<InferShape<T>, K>> {
      const kept = {} as Record<string, Schema<any>>;
      for (const key of Object.keys(shape)) {
        if (!(keys as string[]).includes(key)) kept[key] = shape[key]!;
      }
      return object(kept) as any;
    },

    extend<U extends Record<string, Schema<any>>>(
      extra: U,
    ): ObjectSchema<InferShape<T> & InferShape<U>> {
      const merged = { ...shape, ...extra } as any;
      return object(merged) as ObjectSchema<InferShape<T> & InferShape<U>>;
    },
  };
}

function objectWithMode<T extends Record<string, Schema<any>>>(
  shape: T,
  mode: "passthrough" | "strict",
): ObjectSchema<InferShape<T>> {
  const baseSchema = createSchema<InferShape<T>>((data, path) => {
    if (typeof data !== "object" || data === null) return err(fail(path, "object", data));

    const record = data as Record<string, unknown>;

    if (mode === "strict") {
      for (const key of Object.keys(record)) {
        if (!(key in shape)) {
          return err(fail(joinPath(path, key), "no extra keys", key));
        }
      }
    }

    const result: Record<string, unknown> = {};

    for (const key of Object.keys(shape)) {
      const parsed = shape[key]!.parse(record[key]);
      if (!parsed.ok) {
        const nested = parsed.error;
        return err({
          ...nested,
          path: joinPath(path, key) + (nested.path ? `.${nested.path}` : ""),
        });
      }
      result[key] = parsed.value;
    }

    return ok(result as InferShape<T>);
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

    pick<K extends keyof InferShape<T>>(keys: K[]): ObjectSchema<Pick<InferShape<T>, K>> {
      const picked = {} as Record<string, Schema<any>>;
      for (const k of keys) {
        if (k in shape) picked[k as string] = shape[k as string]!;
      }
      return object(picked) as any;
    },

    omit<K extends keyof InferShape<T>>(keys: K[]): ObjectSchema<Omit<InferShape<T>, K>> {
      const kept = {} as Record<string, Schema<any>>;
      for (const key of Object.keys(shape)) {
        if (!(keys as string[]).includes(key)) kept[key] = shape[key]!;
      }
      return object(kept) as any;
    },

    extend<U extends Record<string, Schema<any>>>(
      extra: U,
    ): ObjectSchema<InferShape<T> & InferShape<U>> {
      const merged = { ...shape, ...extra } as any;
      return object(merged) as ObjectSchema<InferShape<T> & InferShape<U>>;
    },
  };
}

// ── array ──

/**
 * Returns a schema that validates an array where every element matches `itemSchema`.
 *
 * @typeParam T - The element type.
 * @param itemSchema - Schema to apply to each element.
 * @returns A schema that accepts arrays of `T`.
 *
 * @example
 * ```ts
 * s.array(s.number()).parse([1, 2, 3]); // { ok: true, value: [1, 2, 3] }
 * ```
 */
export function array<T>(itemSchema: Schema<T>): Schema<T[]> {
  return createSchema((data, path) => {
    if (!Array.isArray(data)) return err(fail(path, "array", data));

    const arr = data as unknown[];
    const result: T[] = [];

    for (let i = 0; i < arr.length; i++) {
      const parsed = itemSchema.parse(arr[i]);
      if (!parsed.ok) {
        const nested = parsed.error;
        return err({
          ...nested,
          path: joinPath(path, i) + (nested.path ? `.${nested.path}` : ""),
        });
      }
      result.push(parsed.value);
    }

    return ok(result);
  });
}

// ── tuple ──

/**
 * Returns a schema that validates a fixed-length tuple.
 *
 * @typeParam T - A tuple of schemas.
 * @param schemas - The element schemas in order.
 * @returns A schema that accepts arrays matching the tuple structure.
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
    if (!Array.isArray(data)) return err(fail(path, "tuple", data));
    if (data.length !== schemas.length)
      return err(fail(path, `tuple of length ${schemas.length}`, data));

    const arr = data as unknown[];
    const result: unknown[] = [];

    for (let i = 0; i < schemas.length; i++) {
      const parsed = schemas[i]!.parse(arr[i]);
      if (!parsed.ok) {
        const nested = parsed.error;
        return err({
          ...nested,
          path: joinPath(path, i) + (nested.path ? `.${nested.path}` : ""),
        });
      }
      result.push(parsed.value);
    }

    return ok(result as any);
  });
}

// ── union ──

/**
 * Returns a schema that validates a value matches any of the given schemas
 * (tried in order).
 *
 * When no branch matches, the error includes every branch failure in
 * `error.errors` for debugging.
 *
 * @typeParam T - The union of schema types.
 * @param schemas - Schemas to try in order.
 * @returns A schema that accepts values matching at least one schema.
 *
 * @example
 * ```ts
 * s.union([s.string(), s.number()]).parse("hello"); // { ok: true, value: "hello" }
 * s.union([s.string(), s.number()]).parse(42);       // { ok: true, value: 42 }
 * s.union([s.string(), s.number()]).parse(true);     // { ok: false, errors: [...] }
 * ```
 */
export function union<T extends Schema<any>[]>(
  schemas: T,
): Schema<T[number] extends Schema<infer U> ? U : never> {
  return createSchema((data, path) => {
    const branchErrors: ValidationError[] = [];

    for (const schema of schemas) {
      const parsed = schema.parse(data);
      if (parsed.ok) return ok(parsed.value) as any;
      branchErrors.push(parsed.error);
    }

    return err({
      path,
      message: `No branch matched at ${path || "root"}`,
      expected: "union",
      received: typeof data === "string" ? `"${data}"` : String(data),
      errors: branchErrors,
    });
  });
}

// ── record ──

/**
 * Returns a schema that validates an object where every value matches `valueSchema`.
 *
 * Keys are dynamic — unlike {@link object}, you don't need to know them upfront.
 *
 * @typeParam T - The value type.
 * @param valueSchema - Schema to apply to every value.
 * @returns A schema that accepts `Record<string, T>`.
 *
 * @example
 * ```ts
 * s.record(s.number()).parse({ a: 1, b: 2 }); // Ok
 * s.record(s.number()).parse({ a: 1, b: "x" }); // Err at "b"
 * ```
 */
export function record<T>(valueSchema: Schema<T>): Schema<Record<string, T>> {
  return createSchema((data, path) => {
    if (typeof data !== "object" || data === null) return err(fail(path, "object", data));

    const record = data as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(record)) {
      const parsed = valueSchema.parse(record[key]);
      if (!parsed.ok) {
        const nested = parsed.error;
        return err({
          ...nested,
          path: joinPath(path, key) + (nested.path ? `.${nested.path}` : ""),
        });
      }
      result[key] = parsed.value;
    }

    return ok(result as Record<string, T>);
  });
}

// ── date ──

/**
 * Returns a schema that validates `Date` instances.
 *
 * @returns A schema that accepts `Date` objects and rejects everything else.
 *
 * @example
 * ```ts
 * s.date().parse(new Date()); // Ok
 * s.date().parse("2024-01-01"); // Err
 * ```
 */
export function date(): Schema<Date> {
  return createSchema((data, path) => {
    if (!(data instanceof Date) || isNaN(data.getTime())) return err(fail(path, "Date", data));
    return ok(data);
  });
}

// ── lazy ──

/**
 * Returns a schema that defers resolution.  Use for recursive types.
 *
 * The factory is called once on first parse; the result is cached.
 *
 * @typeParam T - The schema's output type.
 * @param fn - A factory that returns the schema.
 * @returns A schema that delegates to the lazily-resolved inner schema.
 *
 * @example
 * ```ts
 * type Tree = { value: number; children: Tree[] };
 * const Tree: Schema<Tree> = s.object({
 *   value: s.number(),
 *   children: s.array(s.lazy(() => Tree)),
 * });
 * ```
 */
export function lazy<T>(fn: () => Schema<T>): Schema<T> {
  let cached: Schema<T> | undefined;
  return createSchema((data, _) => {
    if (!cached) cached = fn();
    return cached.parse(data);
  });
}

// ── coerce ──

/**
 * Returns a schema that coerces the input before validating.
 *
 * If coercion throws, parsing fails.
 *
 * @typeParam T - The output type.
 * @param schema - The schema to validate the coerced value against.
 * @param fn - A function that transforms `unknown` into a value for `schema`.
 * @returns A schema that coerces then validates.
 *
 * @example
 * ```ts
 * s.coerce(s.number(), v => Number(v)).parse("42"); // Ok(42)
 * s.coerce(s.date(), v => new Date(v as string)).parse("2024-01-01"); // Ok(Date)
 * ```
 */
export function coerce<T>(schema_: Schema<T>, fn: (v: unknown) => unknown): Schema<T> {
  return createSchema((data, path) => {
    try {
      return schema_.parse(fn(data));
    } catch {
      return err(fail(path, "coercible value", data));
    }
  });
}

// ── brand ──

declare const brandSym: unique symbol;
type Branded<T, B> = T & { [brandSym]: B };

/**
 * Returns a schema that brands the output type without changing validation.
 *
 * Useful for nominal typing — `UserId` vs `string`, `Meters` vs `number`.
 *
 * @typeParam T - The base type.
 * @typeParam B - The brand (a string literal).
 * @param schema - The schema to brand.
 * @param _brand - The brand string (unused at runtime, only for type inference).
 * @returns A schema whose output type is `T & { [brand]: B }`.
 *
 * @example
 * ```ts
 * const UserId = s.brand(s.string(), "UserId");
 * type UserId = Infer<typeof UserId>; // string & { [brand]: "UserId" }
 * const id: UserId = UserId.parse("abc-123");
 * ```
 */
export function brand<T, B extends string>(schema_: Schema<T>, _brand: B): Schema<Branded<T, B>> {
  return schema_ as any;
}
