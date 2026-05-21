import {
  string,
  number,
  boolean,
  literal,
  enum_,
  any,
  undefined_,
  null_,
  instanceof_,
} from "./primitives.js";
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
  any,
  undefined: undefined_,
  null: null_,
  instanceof: instanceof_,
};
