/**
 * Normalises `Uint8Array | ArrayBuffer | ArrayBufferView` into a `Uint8Array`.
 */
function coerce(data: Uint8Array | ArrayBuffer | ArrayBufferView): Uint8Array {
  if (data instanceof Uint8Array) return data;
  if (ArrayBuffer.isView(data))
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  return new Uint8Array(data);
}

// ── Hex ──────────────────────────────────────────────────────────────────────

const HEX_LOOKUP = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));

/** Cache of hex char → nibble for `fromHex`. */
const HEX_DECODE: Record<string, number> = {};
for (let i = 0; i < 16; i++) HEX_DECODE[i.toString(16)] = i;

/**
 * Encodes bytes as a lowercase hex string.
 *
 * @param data - The bytes to encode.
 * @returns A lowercase hex string (e.g. `"00ff10"`).
 *
 * @example
 * ```ts
 * toHex(new Uint8Array([0, 255, 16])); // "00ff10"
 * ```
 */
export function toHex(data: Uint8Array | ArrayBuffer | ArrayBufferView): string {
  const bytes = coerce(data);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += HEX_LOOKUP[bytes[i]!];
  return out;
}

/**
 * Decodes a hex string into bytes.  Throws if the string contains invalid hex
 * characters or has an odd length.
 *
 * @param hex - A hex string (case-insensitive, may include `0x` prefix).
 * @returns The decoded bytes.
 *
 * @example
 * ```ts
 * fromHex("00ff10");        // Uint8Array [0, 255, 16]
 * fromHex("0x00ff10");      // same (prefix is stripped)
 * ```
 */
export function fromHex(hex: string): Uint8Array {
  let s = hex.toLowerCase();
  if (s.startsWith("0x")) s = s.slice(2);
  if (s.length % 2 !== 0) throw new Error("Hex string must have an even number of characters");
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < s.length; i += 2) {
    const hi = HEX_DECODE[s[i]!];
    const lo = HEX_DECODE[s[i + 1]!];
    if (hi === undefined || lo === undefined)
      throw new Error(`Invalid hex character at position ${i}: "${s[i]}${s[i + 1]}"`);
    out[i / 2] = (hi << 4) | lo;
  }
  return out;
}

// ── Base64 ───────────────────────────────────────────────────────────────────

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const BASE64URL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function base64Encode(data: Uint8Array, alphabet: string, padding: boolean): string {
  const len = data.length;
  let out = "";
  for (let i = 0; i < len; i += 3) {
    const b0 = data[i]!;
    const b1 = i + 1 < len ? data[i + 1]! : 0;
    const b2 = i + 2 < len ? data[i + 2]! : 0;
    const triple = (b0 << 16) | (b1 << 8) | b2;
    out += alphabet[(triple >> 18) & 63];
    out += alphabet[(triple >> 12) & 63];
    out += i + 1 < len ? alphabet[(triple >> 6) & 63] : padding ? "=" : "";
    out += i + 2 < len ? alphabet[triple & 63] : padding ? "=" : "";
  }
  return out;
}

function base64Decode(str: string, alphabet: string, padding: boolean): Uint8Array {
  let s = str.replace(/\s/g, "");
  if (padding) s = s.replace(/=+$/, "");
  if (s.length === 0) return new Uint8Array(0);

  const lookup = new Map<string, number>();
  for (let i = 0; i < 64; i++) lookup.set(alphabet[i]!, i);

  const out: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < s.length; i++) {
    const val = lookup.get(s[i]!);
    if (val === undefined) throw new Error(`Invalid base64 character at position ${i}: "${s[i]}"`);
    buffer = (buffer << 6) | val;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(out);
}

/**
 * Encodes bytes as a standard Base64 string (with `+`/`/` and `=` padding).
 *
 * @param data - The bytes to encode.
 * @returns A Base64 string.
 *
 * @example
 * ```ts
 * toBase64(new TextEncoder().encode("hello")); // "aGVsbG8="
 * ```
 */
export function toBase64(data: Uint8Array | ArrayBuffer | ArrayBufferView): string {
  return base64Encode(coerce(data), BASE64_CHARS, true);
}

/**
 * Decodes a standard Base64 string into bytes.  Throws on invalid input.
 *
 * @param str - A Base64 string (whitespace is ignored).
 * @returns The decoded bytes.
 *
 * @example
 * ```ts
 * fromBase64("aGVsbG8="); // Uint8Array [104, 101, 108, 108, 111]
 * ```
 */
export function fromBase64(str: string): Uint8Array {
  return base64Decode(str, BASE64_CHARS, true);
}

/**
 * Encodes bytes as a URL-safe Base64 string (with `-`/`_` and no padding).
 *
 * @param data - The bytes to encode.
 * @returns A URL-safe Base64 string.
 *
 * @example
 * ```ts
 * toBase64Url(new Uint8Array([255])); // "_w"
 * ```
 */
export function toBase64Url(data: Uint8Array | ArrayBuffer | ArrayBufferView): string {
  return base64Encode(coerce(data), BASE64URL_CHARS, false);
}

/**
 * Decodes a URL-safe Base64 string into bytes.  Throws on invalid input.
 *
 * @param str - A URL-safe Base64 string (no padding, `-` instead of `+`, `_` instead of `/`).
 * @returns The decoded bytes.
 *
 * @example
 * ```ts
 * fromBase64Url("_w"); // Uint8Array [255]
 * ```
 */
export function fromBase64Url(str: string): Uint8Array {
  return base64Decode(str, BASE64URL_CHARS, false);
}

// ── UTF-8 ────────────────────────────────────────────────────────────────────

const encoder = new TextEncoder();

/**
 * Encodes a string as UTF-8 bytes.
 *
 * @param str - The string to encode.
 * @returns A `Uint8Array` of UTF-8 bytes.
 *
 * @example
 * ```ts
 * toUTF8("hello");  // Uint8Array [104, 101, 108, 108, 111]
 * toUTF8("🚀");     // Uint8Array [240, 159, 154, 128]
 * ```
 */
export function toUTF8(str: string): Uint8Array {
  return encoder.encode(str);
}

/**
 * Decodes UTF-8 bytes into a string.
 *
 * @param data - The bytes to decode.
 * @param fatal - If `true`, throws on invalid UTF-8 sequences.  Defaults to `false`
 *   (replaces invalid bytes with the Unicode replacement character).
 * @returns The decoded string.
 *
 * @example
 * ```ts
 * const bytes = new Uint8Array([104, 101, 108, 108, 111]);
 * fromUTF8(bytes); // "hello"
 * ```
 */
export function fromUTF8(data: Uint8Array | ArrayBuffer | ArrayBufferView, fatal = false): string {
  if (fatal) return new TextDecoder("utf-8", { fatal: true }).decode(coerce(data));
  return new TextDecoder().decode(coerce(data));
}
