import { type Result } from "../result/result.js";
import { fromSchema, pipeline as pipelineFn } from "./pipeline.js";

/**
 * A structured error returned by codec decoders.
 *
 * @property code - A machine-readable code (e.g. `"parse_error"`, `"invalid_format"`).
 * @property message - A human-readable description.
 * @property offset - The byte/character offset where the error occurred (if available).
 */
export type CodecError = {
  code: string;
  message: string;
  offset?: number;
};

/**
 * A bidirectional codec that can encode values to strings and decode strings back to values.
 *
 * @typeParam T - The type this codec handles.
 */
export interface Codec<T> {
  /** Encodes a value to a string. */
  encode(value: T): string;

  /** Decodes a string, returning `Ok(T)` or `Err(CodecError)`. */
  decode(input: string): Result<T, CodecError>;
}

/**
 * Creates a custom codec from bare `encode` and `decode` functions.
 *
 * @typeParam T - The codec type.
 * @param def - The codec definition.
 * @param def.encode - Encoder function.
 * @param def.decode - Decoder function returning a {@link Result}.
 * @returns A new {@link Codec}.
 *
 * @example
 * ```ts
 * const hex = Codec.from({
 *   encode: (buf: Uint8Array) => Buffer.from(buf).toString("hex"),
 *   decode: (str: string) => {
 *     if (!/^[0-9a-fA-F]*$/.test(str))
 *       return err({ code: "invalid_format", message: "Expected hex" });
 *     const bytes = Uint8Array.from(str.match(/.{2}/g)!.map(b => parseInt(b, 16)));
 *     return ok(bytes);
 *   },
 * });
 * ```
 */
export function from<T>(def: {
  encode: (value: T) => string;
  decode: (input: string) => Result<T, CodecError>;
}): Codec<T> {
  return def;
}

/** Codec combinators: {@link from}, {@link fromSchema}, {@link pipeline}. */
export const Codec = { from, fromSchema, pipeline: pipelineFn };
