import { ok, err, type Result } from "../result/result.js";
import type { Codec, CodecError } from "./codec.js";

/**
 * A codec for JSON values.
 *
 * `encode` serializes any value with `JSON.stringify`.  `decode` parses a
 * JSON string and returns `unknown` — pair with {@link Codec.fromSchema} or
 * {@link Codec.pipeline} for type-safe decoding.
 *
 * @example
 * ```ts
 * json.decode('{"port": 3000}');  // Ok({ port: 3000 })
 * json.decode("{invalid");         // Err({ code: "parse_error" })
 * json.encode({ port: 3000 });    // '{"port":3000}'
 * ```
 */
export const json: Codec<unknown> = {
  encode(value: unknown): string {
    return JSON.stringify(value);
  },

  decode(input: string): Result<unknown, CodecError> {
    try {
      return ok(JSON.parse(input));
    } catch (e) {
      return err({
        code: "parse_error",
        message: e instanceof SyntaxError ? e.message : String(e),
        offset: extractOffset(e),
      });
    }
  },
};

function extractOffset(e: unknown): number | undefined {
  if (e instanceof SyntaxError) {
    const m = e.message.match(/position (\d+)/);
    if (m) return Number(m[1]);
  }
  return undefined;
}
