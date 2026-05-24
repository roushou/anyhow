import { describe, it, expect } from "bun:test";
import { base64 } from "./base64.js";

describe("base64 codec", () => {
  it("encodes bytes to base64", () => {
    expect(base64.encode(new Uint8Array([104, 101, 108, 108, 111]))).toBe("aGVsbG8=");
  });

  it("decodes base64 to bytes", () => {
    const result = base64.decode("aGVsbG8=");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(new TextDecoder().decode(result.value)).toBe("hello");
    }
  });

  it("returns Err on invalid base64", () => {
    const result = base64.decode("!!!bad!!!");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("invalid_format");
  });

  it("round-trips", () => {
    const data = new Uint8Array([0, 1, 2, 100, 200, 255]);
    const encoded = base64.encode(data);
    const decoded = base64.decode(encoded);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) expect([...decoded.value]).toEqual([...data]);
  });
});
