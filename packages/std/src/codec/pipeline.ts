import { ok, err, type Result } from "../result/result.js";
import type { Schema } from "../schema/types.js";
import type { Codec, CodecError } from "./codec.js";

/**
 * Wraps a {@link Schema} as a codec so it can be used in a codec pipeline.
 *
 * The codec's `encode` is identity (returns the value as-is via JSON
 * serialization), and `decode` delegates to `schema.parse`.
 *
 * @typeParam T - The schema's output type.
 * @param schema - A schema from `@anyhow/std/schema`.
 * @returns A {@link Codec} backed by the schema.
 *
 * @example
 * ```ts
 * const User = s.object({ name: s.string(), age: s.number() });
 * const UserCodec = Codec.fromSchema(User);
 * UserCodec.decode(JSON.stringify({ name: "A", age: 30 }));
 * ```
 */
export function fromSchema<T>(schema: Schema<T>): Codec<T> {
  return {
    encode(value: T): string {
      return JSON.stringify(value);
    },
    decode(input: string): Result<T, CodecError> {
      let parsed: unknown;
      try {
        parsed = JSON.parse(input);
      } catch (e) {
        return err({
          code: "parse_error",
          message: `Invalid JSON: ${e instanceof Error ? e.message : String(e)}`,
        });
      }

      const result = schema.parse(parsed);
      if (!result.ok) {
        return err({
          code: "validation_error",
          message: result.error.message,
        });
      }
      return ok(result.value);
    },
  };
}

/**
 * Chains codecs (and optionally schemas) into a decode pipeline.
 *
 * Each step after the first can be either a {@link Codec} or a {@link Schema}.
 * Decoding applies the first codec's `decode`, then pipes the result through
 * each subsequent step's `decode` (for codecs) or `parse` (for schemas).
 *
 * Encoding is not supported on pipelines (throws if called).
 *
 * @param first - The first codec in the chain.
 * @param steps - Subsequent codecs or schemas.
 * @returns A decode-only {@link Codec}.
 *
 * @example
 * ```ts
 * import { s } from "@anyhow/std/schema";
 * const User = s.object({ name: s.string() });
 * const UserCodec = Codec.pipeline(json, User);
 * const result = UserCodec.decode('{"name":"Alice"}');
 * ```
 */
export function pipeline<T>(first: Codec<T>, ...steps: (Codec<any> | Schema<any>)[]): Codec<any> {
  return {
    encode(_value: any): string {
      throw new Error("Pipeline codecs do not support encoding");
    },
    decode(input: string): Result<any, CodecError> {
      let result = first.decode(input);
      for (const step of steps) {
        if (!result.ok) return result;
        if ("parse" in step && typeof (step as Schema<any>).parse === "function") {
          const parsed = (step as Schema<any>).parse(result.value);
          if (!parsed.ok) {
            return err({
              code: "validation_error",
              message: parsed.error.message,
            });
          }
          result = ok(parsed.value) as Result<any, CodecError>;
        } else {
          const next = (step as Codec<any>).decode(
            typeof result.value === "string" ? result.value : JSON.stringify(result.value),
          );
          if (!next.ok) return next;
          result = ok(next.value) as Result<any, CodecError>;
        }
      }
      return result;
    },
  };
}
