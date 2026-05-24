import { ok, err, type Result } from "../result/result.js";
import { coerce, type EncodingError, ALPHABETS } from "./safe.js";

/**
 * Options for {@link toBase32} and {@link fromBase32}.
 */
export interface Base32Opts {
  /**
   * The alphabet to use.
   *
   * - {@link ALPHABETS.BASE32_RFC4648} (default) — uses `=` padding.
   * - {@link ALPHABETS.BASE32_CROCKFORD} — no padding, case-insensitive decoding
   *   with I/i/L/l mapped to 1 and O/o mapped to 0.
   */
  alphabet?: string;
}

/**
 * Encodes bytes as a Base32 string.
 *
 * @param data - The bytes to encode.
 * @param opts - Encoding options.
 * @param opts.alphabet - The alphabet to use (default: {@link ALPHABETS.BASE32_RFC4648}).
 * @returns A Base32-encoded string.
 *
 * @example
 * ```ts
 * toBase32(new Uint8Array([1, 2, 3, 4, 5]));
 * // => "AEBAGBAF"
 *
 * // Crockford variant
 * toBase32(new Uint8Array([1, 2, 3, 4, 5]), { alphabet: ALPHABETS.BASE32_CROCKFORD });
 * // => "04106105"
 * ```
 */
export function toBase32(
  data: Uint8Array | ArrayBuffer | ArrayBufferView,
  opts: Base32Opts = {},
): string {
  const bytes = coerce(data);
  const alphabet = opts.alphabet ?? ALPHABETS.BASE32_RFC4648;
  const isCrockford = alphabet === ALPHABETS.BASE32_CROCKFORD;
  const usePad = !isCrockford;

  // Bit-buffer approach: process byte-by-byte, extracting 5-bit groups.
  // The buffer is masked after each extraction to stay within 32-bit safe range.
  let out = "";
  let buf = 0;
  let bits = 0;

  for (let i = 0; i < bytes.length; i++) {
    buf = (buf << 8) | bytes[i]!;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += alphabet[(buf >> bits) & 0x1f]!;
    }
    // Mask buffer to only the remaining bits
    buf &= bits > 0 ? (1 << bits) - 1 : 0;
  }

  // Flush remaining bits (if any) by padding with zeros on the right
  if (bits > 0) {
    out += alphabet[(buf << (5 - bits)) & 0x1f]!;
  }

  // Add padding for RFC 4648
  if (usePad && out.length % 8 !== 0) {
    out += "=".repeat(8 - (out.length % 8));
  }

  return out;
}

/**
 * Decodes a Base32 string into bytes, returning a {@link Result}.
 *
 * Supports both RFC 4648 (with `=` padding) and Crockford (case-insensitive,
 * I/i/L/l → 1, O/o → 0) alphabets.
 *
 * @param str - The Base32 string to decode.
 * @param opts - Decoding options.
 * @param opts.alphabet - The alphabet to use (default: {@link ALPHABETS.BASE32_RFC4648}).
 * @returns `Ok(Uint8Array)` on success, `Err(EncodingError)` on invalid input.
 *
 * @example
 * ```ts
 * fromBase32("AEBAGBAF");  // Ok(Uint8Array [1, 2, 3, 4, 5])
 * fromBase32("!!!bad!!!"); // Err({ code: "invalid_character", position: 0 })
 * ```
 */
export function fromBase32(str: string, opts: Base32Opts = {}): Result<Uint8Array, EncodingError> {
  const alphabet = opts.alphabet ?? ALPHABETS.BASE32_RFC4648;
  const isCrockford = alphabet === ALPHABETS.BASE32_CROCKFORD;

  // Strip padding and whitespace
  let s = str.replace(/\s/g, "");
  if (!isCrockford) s = s.replace(/=+$/, "");
  if (s.length === 0) return ok(new Uint8Array(0));

  // Build lookup (always case-insensitive)
  const lookup = new Map<string, number>();
  for (let i = 0; i < alphabet.length; i++) {
    const ch = alphabet[i]!;
    lookup.set(ch, i);
    lookup.set(ch.toLowerCase(), i);
  }

  // Crockford: map confusable characters I/i/L/l → 1, O/o → 0
  if (isCrockford) {
    const oneIdx = alphabet.indexOf("1");
    const zeroIdx = alphabet.indexOf("0");
    for (const ch of ["i", "I", "l", "L"]) lookup.set(ch, oneIdx);
    for (const ch of ["o", "O"]) lookup.set(ch, zeroIdx);
  }

  const bytes: number[] = [];
  let buf = 0;
  let bits = 0;

  for (let i = 0; i < s.length; i++) {
    const val = lookup.get(s[i]!);
    if (val === undefined) {
      return err({
        code: "invalid_character",
        message: `Invalid base32 character at position ${i}: "${s[i]}"`,
        position: i,
      });
    }
    buf = (buf << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buf >> bits) & 0xff);
      buf &= bits > 0 ? (1 << bits) - 1 : 0;
    }
  }

  return ok(new Uint8Array(bytes));
}
