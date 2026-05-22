import { describe, expect, it } from "bun:test";
import {
  toHex,
  fromHex,
  toBase64,
  fromBase64,
  toBase64Url,
  fromBase64Url,
  toUTF8,
  fromUTF8,
} from "./bytes.js";

// ── Hex ──────────────────────────────────────────────────────────────────────

describe("toHex", () => {
  it("encodes empty array", () => expect(toHex(new Uint8Array(0))).toBe(""));
  it("encodes single byte", () => expect(toHex(new Uint8Array([0]))).toBe("00"));
  it("encodes multiple bytes", () => expect(toHex(new Uint8Array([0, 255, 16]))).toBe("00ff10"));
  it("pads single-digit hex values", () => expect(toHex(new Uint8Array([10]))).toBe("0a"));
  it("accepts ArrayBuffer", () => expect(toHex(new ArrayBuffer(0))).toBe(""));
  it("accepts ArrayBufferView", () =>
    expect(toHex(new DataView(new Uint8Array([1, 2]).buffer))).toBe("0102"));
});

describe("fromHex", () => {
  it("decodes lowercase hex", () => expect([...fromHex("00ff10")]).toEqual([0, 255, 16]));
  it("decodes uppercase hex", () => expect([...fromHex("00FF10")]).toEqual([0, 255, 16]));
  it("strips 0x prefix", () => expect([...fromHex("0x00ff")]).toEqual([0, 255]));
  it("handles empty string", () => expect(fromHex("").length).toBe(0));
  it("throws on odd-length", () => expect(() => fromHex("abc")).toThrow());
  it("throws on invalid characters", () => expect(() => fromHex("zz")).toThrow());
  it("round-trips", () => {
    const data = new Uint8Array([0, 1, 127, 128, 255]);
    expect([...fromHex(toHex(data))]).toEqual([...data]);
  });
});

// ── Base64 ───────────────────────────────────────────────────────────────────

describe("toBase64", () => {
  it("encodes empty array", () => expect(toBase64(new Uint8Array(0))).toBe(""));
  it("encodes 'hello'", () => expect(toBase64(new TextEncoder().encode("hello"))).toBe("aGVsbG8="));
  it("encodes single byte", () => expect(toBase64(new Uint8Array([255]))).toBe("/w=="));
});

describe("fromBase64", () => {
  it("decodes 'hello'", () => {
    const decoded = fromBase64("aGVsbG8=");
    expect(new TextDecoder().decode(decoded)).toBe("hello");
  });
  it("decodes with whitespace", () => {
    const decoded = fromBase64("aGVs bG8=");
    expect(new TextDecoder().decode(decoded)).toBe("hello");
  });
  it("handles empty string", () => expect(fromBase64("").length).toBe(0));
  it("throws on invalid characters", () => expect(() => fromBase64("!!!")).toThrow());
  it("round-trips", () => {
    const data = crypto.getRandomValues(new Uint8Array(256));
    expect([...fromBase64(toBase64(data))]).toEqual([...data]);
  });
});

describe("toBase64Url", () => {
  it("uses URL-safe alphabet and no padding", () => {
    // 255 in base64 is "/w=="; URL-safe should be "_w" with no padding
    expect(toBase64Url(new Uint8Array([255]))).toBe("_w");
  });
  it("encodes empty array", () => expect(toBase64Url(new Uint8Array(0))).toBe(""));
});

describe("fromBase64Url", () => {
  it("decodes URL-safe base64", () => {
    const decoded = fromBase64Url("_w");
    expect([...decoded]).toEqual([255]);
  });
  it("round-trips", () => {
    const data = crypto.getRandomValues(new Uint8Array(256));
    expect([...fromBase64Url(toBase64Url(data))]).toEqual([...data]);
  });
});

// ── UTF-8 ────────────────────────────────────────────────────────────────────

describe("toUTF8", () => {
  it("encodes ASCII", () => expect([...toUTF8("hello")]).toEqual([104, 101, 108, 108, 111]));
  it("encodes multi-byte characters", () =>
    expect([...toUTF8("🚀")]).toEqual([240, 159, 154, 128]));
  it("encodes empty string", () => expect(toUTF8("").length).toBe(0));
});

describe("fromUTF8", () => {
  it("decodes ASCII", () => {
    const bytes = new Uint8Array([104, 101, 108, 108, 111]);
    expect(fromUTF8(bytes)).toBe("hello");
  });
  it("decodes multi-byte characters", () => {
    const bytes = new Uint8Array([240, 159, 154, 128]);
    expect(fromUTF8(bytes)).toBe("🚀");
  });
  it("round-trips", () => {
    const str = "Hello, 世界! 🌍";
    expect(fromUTF8(toUTF8(str))).toBe(str);
  });
  it("replaces invalid sequences by default", () => {
    const bytes = new Uint8Array([0xff, 0xfe]);
    expect(() => fromUTF8(bytes)).not.toThrow();
  });
  it("throws with fatal=true on invalid sequences", () => {
    const bytes = new Uint8Array([0xff, 0xfe]);
    expect(() => fromUTF8(bytes, true)).toThrow();
  });
});
