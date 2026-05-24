import { describe, it, expect } from "bun:test";
import { toBase58, fromBase58 } from "./base58.js";

describe("toBase58", () => {
  it("encodes bytes", () => {
    expect(toBase58(new Uint8Array([1, 2, 3]))).toBe("Ldp");
  });

  it("encodes leading zeros", () => {
    expect(toBase58(new Uint8Array([0, 0, 1]))).toBe("112");
  });

  it("encodes all zeros", () => {
    expect(toBase58(new Uint8Array([0, 0, 0]))).toBe("111");
  });

  it("encodes empty input", () => {
    expect(toBase58(new Uint8Array(0))).toBe("");
  });

  it("encodes a single zero byte", () => {
    expect(toBase58(new Uint8Array([0]))).toBe("1");
  });

  it("encodes max byte", () => {
    expect(toBase58(new Uint8Array([255]))).toBe("5Q");
  });

  it("accepts ArrayBuffer", () => {
    const buf = new Uint8Array([1, 2, 3]).buffer;
    expect(toBase58(buf)).toBe("Ldp");
  });

  it("round-trips varied data", () => {
    const data = new Uint8Array([0, 1, 2, 3, 255, 128, 64, 32, 0]);
    const encoded = toBase58(data);
    const result = fromBase58(encoded);
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([...data]);
  });
});

describe("fromBase58", () => {
  it("decodes valid base58", () => {
    const result = fromBase58("Ldp");
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([1, 2, 3]);
  });

  it("handles leading ones", () => {
    const result = fromBase58("112");
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([0, 0, 1]);
  });

  it("decodes all ones as zero bytes", () => {
    const result = fromBase58("111");
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([0, 0, 0]);
  });

  it("handles empty string", () => {
    const result = fromBase58("");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.length).toBe(0);
  });

  it("returns Err on invalid characters", () => {
    const result = fromBase58("!!!bad!!!");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("invalid_character");
      expect(result.error.position).toBe(0);
    }
  });

  it("returns Err on characters not in alphabet", () => {
    // '0' is not in the Bitcoin base58 alphabet
    const result = fromBase58("0abc");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("invalid_character");
  });

  it("ignores whitespace", () => {
    const result = fromBase58("L dp");
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([1, 2, 3]);
  });

  it("round-trips large data", () => {
    const data = new Uint8Array(32);
    for (let i = 0; i < 32; i++) data[i] = i;
    const encoded = toBase58(data);
    const result = fromBase58(encoded);
    expect(result.ok).toBe(true);
    if (result.ok) expect([...result.value]).toEqual([...data]);
  });
});
