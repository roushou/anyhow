import { describe, it, expect } from "bun:test";
import { csv, csvCodec } from "./csv.js";

describe("csv codec", () => {
  it("decodes CSV with headers", () => {
    const result = csv.decode("name,age\nAlice,30\nBob,25");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual([
        { name: "Alice", age: "30" },
        { name: "Bob", age: "25" },
      ]);
    }
  });

  it("encodes rows to CSV", () => {
    const encoded = csv.encode([{ name: "Alice", age: "30" }]);
    expect(encoded).toBe("name,age\nAlice,30");
  });

  it("handles quoted fields", () => {
    const result = csv.decode('name,desc\nAlice,"Hello, World"');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[0]!.desc).toBe("Hello, World");
    }
  });

  it("handles empty input", () => {
    const result = csv.decode("");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual([]);
  });

  it("supports custom delimiter", () => {
    const tsv = csvCodec({ delimiter: "\t" });
    const result = tsv.decode("name\tage\nAlice\t30");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value[0]!.name).toBe("Alice");
      expect(result.value[0]!.age).toBe("30");
    }
  });

  it("encodes empty array as empty string", () => {
    expect(csv.encode([])).toBe("");
  });

  it("round-trips", () => {
    const data = [
      { name: "Alice", role: "admin" },
      { name: "Bob", role: "user" },
    ];
    const encoded = csv.encode(data);
    const decoded = csv.decode(encoded);
    expect(decoded.ok).toBe(true);
    if (decoded.ok) expect(decoded.value).toEqual(data);
  });
});
