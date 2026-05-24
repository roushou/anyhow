import { describe, it, expect } from "bun:test";
import {
  ALPHABETS,
  toHex,
  toBase64,
  toBase64Url,
  fromHex,
  fromBase64,
  fromBase64Url,
} from "./safe.js";

// ── Encoders (re-exported from bytes) ──

describe("toHex", () => {
  it("encodes bytes", () => {
    expect(toHex(new Uint8Array([0, 255, 16]))).toBe("00ff10");
  });

  it("handles empty input", () => {
    expect(toHex(new Uint8Array(0))).toBe("");
  });

  it("accepts ArrayBuffer", () => {
    const buf = new Uint8Array([171, 205]).buffer;
    expect(toHex(buf)).toBe("abcd");
  });
});

describe("toBase64", () => {
  it("encodes bytes", () => {
    expect(toBase64(new Uint8Array([104, 101, 108, 108, 111]))).toBe("aGVsbG8=");
  });
});

describe("toBase64Url", () => {
  it("uses URL-safe alphabet and no padding", () => {
    expect(toBase64Url(new Uint8Array([255]))).toBe("_w");
  });
});

// ── Safe decoders ──

describe("fromHex (safe)", () => {
  it("decodes valid hex", () => {
    const result = fromHex("00ff10");
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([0, 255, 16]);
  });

  it("strips 0x prefix", () => {
    const result = fromHex("0xabcd");
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([171, 205]);
  });

  it("handles uppercase", () => {
    const result = fromHex("ABCD");
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([171, 205]);
  });

  it("returns Err on invalid characters", () => {
    const result = fromHex("zzz");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("invalid_format");
    }
  });

  it("returns Err on odd-length", () => {
    const result = fromHex("abc");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("even");
    }
  });

  it("round-trips", () => {
    const data = new Uint8Array([1, 2, 3, 255, 0, 128]);
    const hex = toHex(data);
    const result = fromHex(hex);
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([...data]);
  });
});

describe("fromBase64 (safe)", () => {
  it("decodes valid base64", () => {
    const result = fromBase64("aGVsbG8=");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(new TextDecoder().decode(result.value)).toBe("hello");
    }
  });

  it("handles whitespace", () => {
    const result = fromBase64("aGVs bG8=");
    expect(result.ok).toBe(true);
  });

  it("returns Err on invalid input", () => {
    const result = fromBase64("!!!bad!!!");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("invalid_format");
    }
  });

  it("round-trips", () => {
    const data = new Uint8Array([0, 1, 2, 100, 200, 255]);
    const enc = toBase64(data);
    const result = fromBase64(enc);
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([...data]);
  });
});

describe("fromBase64Url (safe)", () => {
  it("decodes URL-safe base64", () => {
    const result = fromBase64Url("_w");
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([255]);
  });

  it("returns Err on invalid input", () => {
    const result = fromBase64Url("!!!");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("invalid_format");
    }
  });

  it("round-trips", () => {
    const data = new Uint8Array([1, 2, 3, 255]);
    const enc = toBase64Url(data);
    const result = fromBase64Url(enc);
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([...data]);
  });
});

// ── ALPHABETS ──

describe("ALPHABETS", () => {
  it("BASE32_RFC4648 has 32 characters", () => {
    expect(ALPHABETS.BASE32_RFC4648.length).toBe(32);
  });

  it("BASE32_CROCKFORD has 32 characters", () => {
    expect(ALPHABETS.BASE32_CROCKFORD.length).toBe(32);
  });

  it("BASE58_BITCOIN has 58 characters", () => {
    expect(ALPHABETS.BASE58_BITCOIN.length).toBe(58);
  });
});
