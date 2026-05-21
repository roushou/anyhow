import { describe, expect, it } from "bun:test";
import { hasProperty, isArrayOf } from "./struct.js";
import { isNumber, isString } from "./is.js";

describe("hasProperty", () => {
  it("returns true when the key exists", () => {
    const obj = { name: "Alice", age: 30 };
    expect(hasProperty(obj, "name")).toBe(true);
    expect(hasProperty(obj, "age")).toBe(true);
  });

  it("returns false when the key is missing", () => {
    const obj = { name: "Alice" } as Record<string, unknown>;
    expect(hasProperty(obj, "age")).toBe(false);
  });

  it("returns false for null", () => {
    expect(hasProperty(null, "anything")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(hasProperty(undefined, "anything")).toBe(false);
  });

  it("returns false for primitives", () => {
    expect(hasProperty(42, "toString")).toBe(false);
    expect(hasProperty("str", "length")).toBe(false);
    expect(hasProperty(true, "valueOf")).toBe(false);
  });

  it("narrows the property type when a guard is provided", () => {
    const obj: unknown = { name: "Alice" };
    if (hasProperty(obj, "name", isString)) {
      // type-level check: obj.name should be string
      const _: string = obj.name;
      expect(obj.name).toBe("Alice");
    }
  });

  it("returns false when the guard fails on the property value", () => {
    const obj: unknown = { name: 42 };
    expect(hasProperty(obj, "name", isString)).toBe(false);
  });

  it("returns false when the guard fails but key exists", () => {
    const obj: unknown = { value: "hello" };
    expect(hasProperty(obj, "value", isNumber)).toBe(false);
  });
});

describe("isArrayOf", () => {
  it("returns true for arrays where all elements match", () => {
    expect(isArrayOf([1, 2, 3], isNumber)).toBe(true);
  });

  it("returns false when any element fails the guard", () => {
    expect(isArrayOf([1, "2", 3], isNumber)).toBe(false);
  });

  it("returns true for empty arrays", () => {
    expect(isArrayOf([], isNumber)).toBe(true);
  });

  it("returns false for non-arrays", () => {
    expect(isArrayOf(42, isNumber)).toBe(false);
    expect(isArrayOf({ length: 1 }, isNumber)).toBe(false);
    expect(isArrayOf(null, isNumber)).toBe(false);
  });

  it("narrows the type", () => {
    const data: unknown = ["a", "b", "c"];
    if (isArrayOf(data, isString)) {
      const _: string[] = data;
      expect(data).toEqual(["a", "b", "c"]);
    }
  });

  it("composes with hasProperty for nested validation", () => {
    const data: unknown = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];

    const isUser = (v: unknown): v is { id: number; name: string } =>
      hasProperty(v, "id", isNumber) && hasProperty(v, "name", isString);

    if (isArrayOf(data, isUser)) {
      expect(data[0]!.id).toBe(1);
      expect(data[1]!.name).toBe("Bob");
    }
  });
});
