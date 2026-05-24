import { describe, it, expect } from "bun:test";
import { toBase32, fromBase32 } from "./base32.js";
import { ALPHABETS } from "./safe.js";

describe("toBase32", () => {
  it("encodes RFC 4648 (default)", () => {
    // Known vector: [1,2,3,4,5] → "AEBAGBAF"
    expect(toBase32(new Uint8Array([1, 2, 3, 4, 5]))).toBe("AEBAGBAF");
  });

  it("encodes empty input", () => {
    expect(toBase32(new Uint8Array(0))).toBe("");
  });

  it("encodes single byte", () => {
    // 1 byte → 2 chars + 6 padding
    expect(toBase32(new Uint8Array([0]))).toBe("AA======");
  });

  it("encodes two bytes", () => {
    expect(toBase32(new Uint8Array([0, 0]))).toBe("AAAA====");
  });

  it("encodes three bytes", () => {
    expect(toBase32(new Uint8Array([0, 0, 0]))).toBe("AAAAA===");
  });

  it("encodes four bytes", () => {
    expect(toBase32(new Uint8Array([0, 0, 0, 0]))).toBe("AAAAAAA=");
  });

  it("encodes with Crockford alphabet", () => {
    const result = toBase32(new Uint8Array([1, 2, 3, 4, 5]), {
      alphabet: ALPHABETS.BASE32_CROCKFORD,
    });
    expect(result).toBe("04106105");
    // Crockford has no padding
    expect(result).not.toContain("=");
  });

  it("accepts ArrayBuffer", () => {
    const buf = new Uint8Array([0, 0, 0, 0, 0]).buffer;
    expect(toBase32(buf)).toBe("AAAAAAAA");
  });

  it("round-trips with RFC 4648", () => {
    const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const encoded = toBase32(data);
    const result = fromBase32(encoded);
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([...data]);
  });
});

describe("fromBase32", () => {
  it("decodes RFC 4648", () => {
    const result = fromBase32("AEBAGBAF");
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([1, 2, 3, 4, 5]);
  });

  it("decodes with padding", () => {
    const result = fromBase32("AA======");
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([0]);
  });

  it("decodes without padding", () => {
    const result = fromBase32("AEBAGBAF");
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([1, 2, 3, 4, 5]);
  });

  it("handles lowercase RFC 4648", () => {
    const result = fromBase32("aebagbaf");
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([1, 2, 3, 4, 5]);
  });

  it("decodes Crockford", () => {
    const result = fromBase32("04106105", {
      alphabet: ALPHABETS.BASE32_CROCKFORD,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([1, 2, 3, 4, 5]);
  });

  it("maps I/i/L/l → 1 and O/o → 0 in Crockford", () => {
    // "0I" in Crockford: 2 chars → 10 bits → 1 byte (2 padding bits dropped)
    const result = fromBase32("0i", { alphabet: ALPHABETS.BASE32_CROCKFORD });
    expect(result.ok).toBe(true);
    if (result.ok) {
      // 00000 00001 → byte = 00000000 = 0
      expect([...result.value]).toEqual([0]);
    }
  });

  it("returns Err on invalid characters", () => {
    const result = fromBase32("!!!bad!!!");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("invalid_character");
      expect(result.error.position).toBe(0);
    }
  });

  it("handles empty string", () => {
    const result = fromBase32("");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.length).toBe(0);
  });

  it("ignores whitespace", () => {
    const result = fromBase32("AEB AGB AF");
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([1, 2, 3, 4, 5]);
  });

  it("round-trips Crockford with varied data", () => {
    const data = new Uint8Array([255, 128, 64, 32, 16, 8, 4, 2, 1, 0]);
    const encoded = toBase32(data, { alphabet: ALPHABETS.BASE32_CROCKFORD });
    const result = fromBase32(encoded, { alphabet: ALPHABETS.BASE32_CROCKFORD });
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([...data]);
  });
});
