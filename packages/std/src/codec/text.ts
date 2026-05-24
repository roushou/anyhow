import { ok } from "../result/result.js";
import type { Codec } from "./codec.js";

/**
 * A passthrough codec that encodes and decodes plain text without
 * transformation.  Useful as a terminal step in codec pipelines.
 *
 * @example
 * ```ts
 * text.encode("hello");  // "hello"
 * text.decode("hello");  // Ok("hello")
 * ```
 */
export const text: Codec<string> = {
  encode(value: string): string {
    return value;
  },

  decode(input: string) {
    return ok(input);
  },
};
