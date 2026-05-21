import { describe, expect, it } from "bun:test";
import { pick, omit, get, set } from "./object.js";

describe("pick", () => {
  it("returns an object with only the picked keys", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = pick(obj, ["a", "c"]);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it("does not mutate the input", () => {
    const obj = { a: 1, b: 2 };
    pick(obj, ["a"]);
    expect(obj).toEqual({ a: 1, b: 2 });
  });

  it("returns an empty object when keys array is empty", () => {
    const obj = { a: 1, b: 2 };
    expect(pick(obj, [])).toEqual({});
  });

  it("returns an empty object when source is empty", () => {
    const obj: Record<string, unknown> = {};
    expect(pick(obj, ["a"]) as any).toEqual({});
  });

  it("ignores keys not present in source", () => {
    const obj = { a: 1 };
    const result = pick(obj, ["a", "b" as keyof typeof obj]);
    expect(result).toEqual({ a: 1 });
  });

  it("preserves falsy values", () => {
    const obj = { a: 0, b: false, c: "" };
    expect(pick(obj, ["b"])).toEqual({ b: false });
  });
});

describe("omit", () => {
  it("returns an object without the omitted keys", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = omit(obj, ["b"]);
    expect(result).toEqual({ a: 1, c: 3 });
  });

  it("does not mutate the input", () => {
    const obj = { a: 1, b: 2 };
    omit(obj, ["a"]);
    expect(obj).toEqual({ a: 1, b: 2 });
  });

  it("returns the full object when keys array is empty", () => {
    const obj = { a: 1, b: 2 };
    const result = omit(obj, []);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("returns an empty object when all keys are omitted", () => {
    const obj = { a: 1, b: 2 };
    expect(omit(obj, ["a", "b"])).toEqual({});
  });

  it("ignores keys not present in source", () => {
    const obj = { a: 1 };
    const result = omit(obj, ["b" as keyof typeof obj]);
    expect(result).toEqual({ a: 1 });
  });

  it("preserves falsy values", () => {
    const obj = { a: 0, b: false, c: "" };
    expect(omit(obj, ["a"])).toEqual({ b: false, c: "" });
  });
});

describe("get", () => {
  it("gets a nested property via dot-path", () => {
    const obj = { a: { b: { c: 42 } } };
    expect(get(obj, "a.b.c") as any).toBe(42);
  });

  it("returns undefined for missing paths", () => {
    const obj = { a: { b: {} } };
    expect(get(obj, "a.b.x")).toBeUndefined();
  });

  it("returns defaultValue for missing paths when provided", () => {
    const obj = { a: { b: {} } };
    expect(get(obj, "a.b.x", 99)).toBe(99);
  });

  it("returns defaultValue when source is null", () => {
    expect(get(null, "a.b", "fallback")).toBe("fallback");
  });

  it("returns defaultValue when source is undefined", () => {
    expect(get(undefined, "a.b", "fallback")).toBe("fallback");
  });

  it("returns defaultValue when source is a primitive", () => {
    expect(get(42, "a.b", "fallback")).toBe("fallback");
  });

  it("returns defaultValue when intermediate value is null", () => {
    const obj = { a: null };
    expect(get(obj, "a.b", "fallback")).toBe("fallback");
  });

  it("returns defaultValue when intermediate value is a primitive", () => {
    const obj = { a: 42 };
    expect(get(obj, "a.b", "fallback")).toBe("fallback");
  });

  it("returns the top-level value for a single segment path", () => {
    const obj = { a: 1 };
    expect(get(obj, "a") as any).toBe(1);
  });

  it("returns undefined for empty object with non-empty path", () => {
    const obj = {};
    expect(get(obj, "a.b")).toBeUndefined();
  });

  it("returns defaultValue for undefined leaf value", () => {
    const obj = { a: { b: undefined } };
    expect(get(obj, "a.b", "fallback")).toBe("fallback");
  });
});

describe("set", () => {
  it("sets a nested property via dot-path", () => {
    const obj = { a: { b: {} } };
    const result = set(obj, "a.b.c", 42);
    expect(result).toEqual({ a: { b: { c: 42 } } });
  });

  it("creates intermediate objects", () => {
    const obj = {};
    const result = set(obj, "x.y", 1);
    expect(result).toEqual({ x: { y: 1 } });
  });

  it("does not mutate the input", () => {
    const obj = { a: { b: {} } };
    set(obj, "a.b.c", 42);
    expect(obj).toEqual({ a: { b: {} } });
  });

  it("overwrites existing values at leaf", () => {
    const obj = { a: { b: 1 } };
    const result = set(obj, "a.b", 2);
    expect(result).toEqual({ a: { b: 2 } });
  });

  it("preserves other keys on the input", () => {
    const obj = { a: 1, b: 2 };
    const result = set(obj, "a", 99);
    expect(result).toEqual({ a: 99, b: 2 });
  });

  it("handles deeply nested set", () => {
    const obj = { a: { b: { c: {} } } };
    const result = set(obj, "a.b.c.d.e", "deep");
    expect(result).toEqual({ a: { b: { c: { d: { e: "deep" } } } } });
  });

  it("returns the original object for an empty path", () => {
    const obj = { a: 1 };
    const result = set(obj, "", "x");
    expect(result).toBe(obj);
  });
});
