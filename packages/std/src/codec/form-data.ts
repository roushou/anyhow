import { ok, type Result } from "../result/result.js";
import type { Codec, CodecError } from "./codec.js";

/**
 * A codec for `application/x-www-form-urlencoded` data.
 *
 * Multiple values for the same key are collected into an array.
 *
 * @example
 * ```ts
 * formData.decode("name=Alice&tags=a&tags=b");
 * // Ok({ name: "Alice", tags: ["a", "b"] })
 *
 * formData.encode({ name: "Alice", tags: ["a", "b"] });
 * // "name=Alice&tags=a&tags=b"
 * ```
 */
export const formData: Codec<Record<string, string | string[]>> = {
  encode(data: Record<string, string | string[]>): string {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        for (const v of value) {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
        }
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    return parts.join("&");
  },

  decode(input: string): Result<Record<string, string | string[]>, CodecError> {
    const result: Record<string, string | string[]> = {};
    if (input.length === 0) return ok(result);

    const pairs = input.split("&");
    for (const pair of pairs) {
      const eqIdx = pair.indexOf("=");
      if (eqIdx === -1) continue;

      const key = decodeURIComponentSafe(pair.slice(0, eqIdx));
      const value = decodeURIComponentSafe(pair.slice(eqIdx + 1));

      if (key in result) {
        const existing = result[key]!;
        result[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
      } else {
        result[key] = value;
      }
    }

    return ok(result);
  },
};

function decodeURIComponentSafe(str: string): string {
  try {
    return decodeURIComponent(str.replace(/\+/g, " "));
  } catch {
    return str;
  }
}
