import { ok, err, type Result } from "../result/result.js";
import type { Codec, CodecError } from "./codec.js";
import { toBase64 as bytesToBase64, fromBase64 as bytesFromBase64 } from "../bytes/bytes.js";

/**
 * A codec that encodes `Uint8Array` to a Base64 string and back.
 *
 * @example
 * ```ts
 * base64.encode(new Uint8Array([104, 101, 108, 108, 111])); // "aGVsbG8="
 * base64.decode("aGVsbG8=");  // Ok(Uint8Array [104, 101, ...])
 * ```
 */
export const base64: Codec<Uint8Array> = {
  encode(value: Uint8Array): string {
    return bytesToBase64(value);
  },

  decode(input: string): Result<Uint8Array, CodecError> {
    try {
      return ok(bytesFromBase64(input));
    } catch (e) {
      return err({
        code: "invalid_format",
        message: e instanceof Error ? e.message : String(e),
      });
    }
  },
};
