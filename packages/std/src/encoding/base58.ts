import { ok, err, type Result } from "../result/result.js";
import { coerce, type EncodingError, ALPHABETS } from "./safe.js";

/**
 * Options for {@link toBase58} and {@link fromBase58}.
 */
export interface Base58Opts {
  /**
   * The alphabet to use.  Defaults to {@link ALPHABETS.BASE58_BITCOIN}.
   */
  alphabet?: string;
}

/**
 * Encodes bytes as a Base58 string (Bitcoin-style).
 *
 * Base58 excludes ambiguous characters (`0`, `O`, `I`, `l`) for readability.
 * Leading zero bytes are encoded as the alphabet's first character (`"1"` in
 * the default Bitcoin alphabet).
 *
 * @param data - The bytes to encode.
 * @param opts - Encoding options.
 * @param opts.alphabet - The alphabet to use (default: {@link ALPHABETS.BASE58_BITCOIN}).
 * @returns A Base58-encoded string.
 *
 * @example
 * ```ts
 * toBase58(new Uint8Array([1, 2, 3]));  // "Ldp"
 * toBase58(new Uint8Array([0, 0, 1]));  // "112"
 * ```
 */
export function toBase58(
  data: Uint8Array | ArrayBuffer | ArrayBufferView,
  opts: Base58Opts = {},
): string {
  const bytes = coerce(data);
  const alphabet = opts.alphabet ?? ALPHABETS.BASE58_BITCOIN;

  // Count leading zeros
  let leadingZeros = 0;
  while (leadingZeros < bytes.length && bytes[leadingZeros] === 0) {
    leadingZeros++;
  }

  // Convert bytes to BigInt
  let num = 0n;
  for (let i = leadingZeros; i < bytes.length; i++) {
    num = (num << 8n) | BigInt(bytes[i]!);
  }

  if (num === 0n) {
    return leadingZeros > 0 ? alphabet[0]!.repeat(leadingZeros) : "";
  }

  // Convert to base-58
  const base = 58n;
  let result = "";
  while (num > 0n) {
    result = alphabet[Number(num % base)] + result;
    num = num / base;
  }

  // Prepend '1' for each leading zero byte
  return alphabet[0]!.repeat(leadingZeros) + result;
}

/**
 * Decodes a Base58 string into bytes, returning a {@link Result}.
 *
 * @param str - The Base58 string to decode.
 * @param opts - Decoding options.
 * @param opts.alphabet - The alphabet to use (default: {@link ALPHABETS.BASE58_BITCOIN}).
 * @returns `Ok(Uint8Array)` on success, `Err(EncodingError)` on invalid input.
 *
 * @example
 * ```ts
 * fromBase58("Ldp");   // Ok(Uint8Array [1, 2, 3])
 * fromBase58("!!!bad"); // Err({ code: "invalid_character", position: 0 })
 * ```
 */
export function fromBase58(str: string, opts: Base58Opts = {}): Result<Uint8Array, EncodingError> {
  const alphabet = opts.alphabet ?? ALPHABETS.BASE58_BITCOIN;
  const s = str.replace(/\s/g, "");

  if (s.length === 0) return ok(new Uint8Array(0));

  // Build lookup table
  const lookup = new Map<string, number>();
  for (let i = 0; i < alphabet.length; i++) {
    lookup.set(alphabet[i]!, i);
  }

  // Count leading '1's (or whatever the alphabet's first character is)
  const zeroChar = alphabet[0]!;
  let leadingZeros = 0;
  while (leadingZeros < s.length && s[leadingZeros] === zeroChar) {
    leadingZeros++;
  }

  // Convert base-58 string to BigInt
  const base = 58n;
  let num = 0n;
  for (let i = leadingZeros; i < s.length; i++) {
    const digit = lookup.get(s[i]!);
    if (digit === undefined) {
      return err({
        code: "invalid_character",
        message: `Invalid base58 character at position ${i}: "${s[i]}"`,
        position: i,
      });
    }
    num = num * base + BigInt(digit);
  }

  // Convert BigInt to bytes
  if (num === 0n) {
    return ok(new Uint8Array(leadingZeros));
  }

  const bytes: number[] = [];
  while (num > 0n) {
    bytes.unshift(Number(num & 0xffn));
    num = num >> 8n;
  }

  // Prepend leading zero bytes
  const result = new Uint8Array(leadingZeros + bytes.length);
  for (let i = 0; i < leadingZeros; i++) result[i] = 0;
  for (let i = 0; i < bytes.length; i++) result[leadingZeros + i] = bytes[i]!;

  return ok(result);
}
