import { describe, it, expect } from "bun:test";
import { formData } from "./form-data.js";

describe("formData codec", () => {
  it("decodes form-encoded data", () => {
    const result = formData.decode("name=Alice&age=30");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ name: "Alice", age: "30" });
    }
  });

  it("collects duplicate keys into arrays", () => {
    const result = formData.decode("tag=a&tag=b&tag=c");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.tag).toEqual(["a", "b", "c"]);
    }
  });

  it("encodes data to form string", () => {
    const encoded = formData.encode({ name: "Alice", age: "30" });
    expect(encoded).toBe("name=Alice&age=30");
  });

  it("encodes arrays as multiple keys", () => {
    const encoded = formData.encode({ tag: ["a", "b"] });
    expect(encoded).toBe("tag=a&tag=b");
  });

  it("URL-decodes values", () => {
    const result = formData.decode("name=Alice%20Smith");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.name).toBe("Alice Smith");
  });

  it("handles empty input", () => {
    const result = formData.decode("");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({});
  });

  it("round-trips", () => {
    const data = { name: "Alice", tags: ["a", "b"] };
    const encoded = formData.encode(data);
    const decoded = formData.decode(encoded);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) expect(decoded.value).toEqual(data);
  });
});
