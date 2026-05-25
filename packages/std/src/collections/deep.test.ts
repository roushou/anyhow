import { describe, expect, it } from "bun:test";
import { deepMerge, deepEqual } from "./deep.js";

describe("deepMerge", () => {
  it("merges two flat objects", () => {
    const result = deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 } as any);
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it("merges nested objects recursively", () => {
    const result = deepMerge({ a: 1, b: { x: 1 } }, { b: { y: 2 }, c: 3 } as any);
    expect(result).toEqual({ a: 1, b: { x: 1, y: 2 }, c: 3 });
  });

  it("concatenates arrays", () => {
    const result = deepMerge({ arr: [1, 2] }, { arr: [3, 4] });
    expect(result).toEqual({ arr: [1, 2, 3, 4] });
  });

  it("source primitives replace target primitives", () => {
    const result = deepMerge({ a: 1 }, { a: 99 });
    expect(result).toEqual({ a: 99 });
  });

  it("handles keys only in target", () => {
    const result = deepMerge({ a: 1, b: 2 }, {});
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("handles keys only in source", () => {
    const result = deepMerge({}, { a: 1, b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("does not mutate inputs", () => {
    const target = { a: 1, b: { x: 1 } };
    const source = { b: { y: 2 } };
    const targetCopy = JSON.parse(JSON.stringify(target));
    deepMerge(target, source as any);
    expect(target).toEqual(targetCopy);
  });

  it("handles deep nesting", () => {
    const result = deepMerge({ a: { b: { c: 1 } } }, { a: { b: { d: 2 } } } as any);
    expect(result).toEqual({ a: { b: { c: 1, d: 2 } } });
  });
});

describe("deepEqual", () => {
  it("returns true for equal primitives", () => {
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual("hi", "hi")).toBe(true);
    expect(deepEqual(true, true)).toBe(true);
  });

  it("returns false for different primitives", () => {
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual("hi", "bye")).toBe(false);
    expect(deepEqual(true, false)).toBe(false);
  });

  it("returns true for equal plain objects", () => {
    expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  });

  it("returns false for objects with different values", () => {
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);
  });

  it("returns false for objects with different keys", () => {
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it("returns true for deeply equal nested objects", () => {
    expect(deepEqual({ a: 1, b: { c: [1, 2] } }, { a: 1, b: { c: [1, 2] } })).toBe(true);
  });

  it("returns true for equal arrays", () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it("returns false for arrays with different lengths", () => {
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it("returns false for arrays with different elements", () => {
    expect(deepEqual([1, 2], [1, 3])).toBe(false);
  });

  it("returns true for equal Dates", () => {
    expect(deepEqual(new Date(1000), new Date(1000))).toBe(true);
  });

  it("returns false for different Dates", () => {
    expect(deepEqual(new Date(1000), new Date(2000))).toBe(false);
  });

  it("returns true for equal RegExps", () => {
    expect(deepEqual(/abc/gi, /abc/gi)).toBe(true);
  });

  it("returns false for RegExps with different flags", () => {
    expect(deepEqual(/abc/g, /abc/i)).toBe(false);
  });

  it("returns true for equal Maps", () => {
    const a = new Map([["x", 1]]);
    const b = new Map([["x", 1]]);
    expect(deepEqual(a, b)).toBe(true);
  });

  it("returns false for Maps with different values", () => {
    const a = new Map([["x", 1]]);
    const b = new Map([["x", 2]]);
    expect(deepEqual(a, b)).toBe(false);
  });

  it("returns false for Maps with different sizes", () => {
    const a = new Map([["x", 1]]);
    const b = new Map([
      ["x", 1],
      ["y", 2],
    ]);
    expect(deepEqual(a, b)).toBe(false);
  });

  it("returns true for equal Sets", () => {
    const a = new Set([1, 2]);
    const b = new Set([2, 1]);
    expect(deepEqual(a, b)).toBe(true);
  });

  it("returns false for Sets with different sizes", () => {
    expect(deepEqual(new Set([1]), new Set([1, 2]))).toBe(false);
  });

  it("returns false for Sets with different elements", () => {
    expect(deepEqual(new Set([1, 2]), new Set([1, 3]))).toBe(false);
  });

  it("returns false for different types", () => {
    expect(deepEqual({}, [])).toBe(false);
    expect(deepEqual([], new Date())).toBe(false);
  });

  it("returns true for null vs null", () => {
    expect(deepEqual(null, null)).toBe(true);
  });

  it("returns false for null vs object", () => {
    expect(deepEqual(null, {})).toBe(false);
  });

  it("returns true for undefined vs undefined", () => {
    expect(deepEqual(undefined, undefined)).toBe(true);
  });

  it("returns true for NaN vs NaN", () => {
    // NaN !== NaN, but deepEqual should handle it
    expect(deepEqual(NaN, NaN)).toBe(true);
  });

  it("handles circular references in objects", () => {
    const a: Record<string, unknown> = { name: "a" };
    a.self = a;
    const b: Record<string, unknown> = { name: "a" };
    b.self = b;
    expect(deepEqual(a, b)).toBe(true);
  });

  it("handles self-referencing vs non-self-referencing", () => {
    const a: Record<string, unknown> = { name: "a" };
    a.self = a;
    const b: Record<string, unknown> = { name: "a", self: { name: "a" } };
    expect(deepEqual(a, b)).toBe(false);
  });
});
