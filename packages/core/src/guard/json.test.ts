import { describe, expect, it } from "bun:test";
import { safeJsonParse } from "./json.js";
import { hasProperty } from "./struct.js";
import { isString, isNumber } from "./is.js";

describe("safeJsonParse", () => {
  it("returns ok with parsed value for valid JSON", () => {
    const result = safeJsonParse<{ name: string }>('{"name": "Alice"}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ name: "Alice" });
    }
  });

  it("returns ok with arrays", () => {
    const result = safeJsonParse<number[]>("[1, 2, 3]");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual([1, 2, 3]);
    }
  });

  it("returns ok with primitives", () => {
    expect(safeJsonParse("42").ok).toBe(true);
    expect(safeJsonParse('"hello"').ok).toBe(true);
    expect(safeJsonParse("true").ok).toBe(true);
    expect(safeJsonParse("null").ok).toBe(true);
  });

  it("returns err for invalid JSON", () => {
    const result = safeJsonParse("{");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(Error);
    }
  });

  it("returns err for non-JSON input", () => {
    const result = safeJsonParse("not json at all");
    expect(result.ok).toBe(false);
  });

  it("passes validation when a validator is provided and matches", () => {
    const isUser = (v: unknown): v is { name: string } => hasProperty(v, "name", isString);

    const result = safeJsonParse('{"name": "Alice"}', isUser);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Alice");
    }
  });

  it("fails validation when the validator rejects", () => {
    const isUser = (v: unknown): v is { name: string; age: number } =>
      hasProperty(v, "name", isString) && hasProperty(v, "age", isNumber);

    const result = safeJsonParse('{"name": "Alice"}', isUser);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeInstanceOf(Error);
      expect((result.error as Error).message).toContain("validation failed");
    }
  });

  it("composes with isArrayOf for arrays of validated objects", () => {
    const isUser = (v: unknown): v is { name: string } => hasProperty(v, "name", isString);

    const result = safeJsonParse(
      '[{"name": "Alice"}, {"name": "Bob"}]',
      (v): v is { name: string }[] => Array.isArray(v) && v.every(isUser),
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toHaveLength(2);
    }
  });
});
