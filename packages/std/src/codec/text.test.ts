import { describe, it, expect } from "bun:test";
import { text } from "./text.js";

describe("text codec", () => {
  it("encodes and decodes as passthrough", () => {
    expect(text.encode("hello")).toBe("hello");
    const result = text.decode("hello");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe("hello");
  });
});
