import { describe, it, expect } from "bun:test";
import { json } from "./json.js";

describe("json codec", () => {
  it("encodes values to JSON string", () => {
    expect(json.encode({ port: 3000 })).toBe('{"port":3000}');
    expect(json.encode([1, 2, 3])).toBe("[1,2,3]");
    expect(json.encode("hello")).toBe('"hello"');
  });

  it("decodes valid JSON", () => {
    const result = json.decode('{"port":3000}');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ port: 3000 });
  });

  it("decodes arrays", () => {
    const result = json.decode("[1,2,3]");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual([1, 2, 3]);
  });

  it("returns Err on invalid JSON", () => {
    const result = json.decode("{invalid");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("parse_error");
  });

  it("round-trips", () => {
    const value = { name: "Alice", scores: [1, 2, 3] };
    const encoded = json.encode(value);
    const decoded = json.decode(encoded);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) expect(decoded.value).toEqual(value);
  });
});
