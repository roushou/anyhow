import { string, number, boolean, literal, enum_ } from "./primitives.js";
import { object, array, tuple, union } from "./composites.js";

export type { Schema, ObjectSchema, ValidationError, Infer, InferShape } from "./types.js";

/**
 * The schema builder namespace.  Every method returns a {@link Schema}
 * which can parse `unknown` data into a typed value.
 *
 * @example
 * ```ts
 * import { s } from "@anyhow/schema";
 *
 * const User = s.object({
 *   name: s.string(),
 *   age: s.number(),
 *   tags: s.array(s.string()).optional().default([]),
 * });
 *
 * const result = User.parse({ name: "Alice", age: 30 });
 * // { ok: true, value: { name: "Alice", age: 30, tags: [] } }
 * ```
 */
export const s = {
  string,
  number,
  boolean,
  literal,
  enum: enum_,
  object,
  array,
  tuple,
  union,
};
