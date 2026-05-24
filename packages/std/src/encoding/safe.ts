import { ok, err, type Result } from "../result/result.js";

/**
 * A structured error returned by encoding decoders in this module.
 *
 * @property code - A machine-readable error code.
 * @property message - A human-readable description.
 * @property position - The character index where the error was detected (if applicable).
 */
export type EncodingError = {
  code: "invalid_character" | "invalid_length" | "invalid_format";
  message: string;
  position?: number;
};

/** Normalises various byte inputs into a `Uint8Array`. */
export function coerce(data: Uint8Array | ArrayBuffer | ArrayBufferView): Uint8Array {
  if (data instanceof Uint8Array) return data;
  if (ArrayBuffer.isView(data))
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  return new Uint8Array(data);
}

/**
 * Common base-encoding alphabets.
 *
 * @example
 * ```ts
 * import { ALPHABETS } from "@anyhow/std/encoding";
 * ALPHABETS.BASE32_RFC4648;   // "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
 * ALPHABETS.BASE58_BITCOIN;   // "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
 * ```
 */
export const ALPHABETS = {
  /** RFC 4648 §6 base-32 alphabet: A–Z 2–7. */
  BASE32_RFC4648: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
  /**
   * Crockford base-32 alphabet: digits first, excludes I L O U for readability.
   * Decoding is case-insensitive and maps I/i/L/l → 1, O/o → 0.
   */
  BASE32_CROCKFORD: "0123456789ABCDEFGHJKMNPQRSTVWXYZ",
  /** Bitcoin-style base-58 alphabet: excludes 0 O I l for readability. */
  BASE58_BITCOIN: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
} as const;

// ── Safe wrappers for bytes module ──

import {
  toHex as bytesToHex,
  fromHex as bytesFromHex,
  toBase64 as bytesToBase64,
  fromBase64 as bytesFromBase64,
  toBase64Url as bytesToBase64Url,
  fromBase64Url as bytesFromBase64Url,
} from "../bytes/bytes.js";

// Re-export encoders (they never fail)
export { bytesToHex as toHex, bytesToBase64 as toBase64, bytesToBase64Url as toBase64Url };

/** Parses an error message from the bytes module to extract position info. */
function parsePosition(msg: string): number | undefined {
  const m = msg.match(/position (\d+)/);
  return m ? Number(m[1]) : undefined;
}

/**
 * Decodes a hex string into bytes, returning a {@link Result} instead of throwing.
 *
 * @param str - A hex string (case-insensitive, optional `0x` prefix).
 * @returns `Ok(Uint8Array)` on success, `Err(EncodingError)` on invalid input.
 *
 * @example
 * ```ts
 * fromHex("00ff10");   // Ok(Uint8Array [0, 255, 16])
 * fromHex("zzz");       // Err({ code: "invalid_character", position: 0 })
 * ```
 */
export function fromHex(str: string): Result<Uint8Array, EncodingError> {
  try {
    return ok(bytesFromHex(str));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err({ code: "invalid_format", message: msg, position: parsePosition(msg) });
  }
}

/**
 * Decodes a standard Base64 string into bytes, returning a {@link Result} instead of throwing.
 *
 * @param str - A Base64 string (whitespace is ignored).
 * @returns `Ok(Uint8Array)` on success, `Err(EncodingError)` on invalid input.
 *
 * @example
 * ```ts
 * fromBase64("aGVsbG8=");   // Ok(Uint8Array [104, 101, ...])
 * fromBase64("!!!bad!!!");  // Err({ code: "invalid_character", position: 0 })
 * ```
 */
export function fromBase64(str: string): Result<Uint8Array, EncodingError> {
  try {
    return ok(bytesFromBase64(str));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err({ code: "invalid_format", message: msg, position: parsePosition(msg) });
  }
}

/**
 * Decodes a URL-safe Base64 string into bytes, returning a {@link Result} instead of throwing.
 *
 * @param str - A URL-safe Base64 string (no padding, `-` instead of `+`, `_` instead of `/`).
 * @returns `Ok(Uint8Array)` on success, `Err(EncodingError)` on invalid input.
 *
 * @example
 * ```ts
 * fromBase64Url("_w");   // Ok(Uint8Array [255])
 * fromBase64Url("!!!");  // Err({ code: "invalid_character", position: 0 })
 * ```
 */
export function fromBase64Url(str: string): Result<Uint8Array, EncodingError> {
  try {
    return ok(bytesFromBase64Url(str));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return err({ code: "invalid_format", message: msg, position: parsePosition(msg) });
  }
}
