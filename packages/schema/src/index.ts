import { string, number, boolean, literal, enum_ } from "./primitives.js";
import { object, array, tuple, union, record, date, lazy, coerce, brand } from "./composites.js";

export type { Schema, ObjectSchema, ValidationError, Infer, InferShape } from "./types.js";

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
  record,
  date,
  lazy,
  coerce,
  brand,
};
