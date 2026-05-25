import { describe, expect, it } from "bun:test";
import {
  keyBy,
  uniqBy,
  range,
  zipObject,
  compact,
  difference,
  intersection,
  union,
} from "./array.js";

describe("keyBy", () => {
  it("indexes elements by key", () => {
    const arr = [
      { id: "a", v: 1 },
      { id: "b", v: 2 },
    ];
    expect(keyBy(arr, (item) => item.id)).toEqual({
      a: { id: "a", v: 1 },
      b: { id: "b", v: 2 },
    });
  });

  it("last item wins for duplicate keys", () => {
    const arr = [
      { id: "a", v: 1 },
      { id: "b", v: 2 },
      { id: "a", v: 3 },
    ];
    expect(keyBy(arr, (item) => item.id)).toEqual({
      a: { id: "a", v: 3 },
      b: { id: "b", v: 2 },
    });
  });

  it("returns an empty object for an empty array", () => {
    expect(keyBy([], (x: { id: string }) => x.id)).toEqual({});
  });

  it("preserves the original array", () => {
    const arr = [{ id: "a", v: 1 }];
    const copy = [...arr];
    keyBy(arr, (item) => item.id);
    expect(arr).toEqual(copy);
  });
});

describe("uniqBy", () => {
  it("deduplicates by key", () => {
    const arr = [
      { id: 1, v: "a" },
      { id: 2, v: "b" },
      { id: 1, v: "c" },
    ];
    expect(uniqBy(arr, (item) => item.id)).toEqual([
      { id: 1, v: "a" },
      { id: 2, v: "b" },
    ]);
  });

  it("handles an empty array", () => {
    expect(uniqBy([], (x: { id: number }) => x.id)).toEqual([]);
  });

  it("handles a single element", () => {
    const arr = [{ id: 1 }];
    expect(uniqBy(arr, (item) => item.id)).toEqual([{ id: 1 }]);
  });

  it("keeps the first occurrence", () => {
    const arr = [1, 2, 1, 3, 2];
    expect(uniqBy(arr, (n) => n)).toEqual([1, 2, 3]);
  });

  it("does not mutate the input", () => {
    const arr = [{ id: 1 }, { id: 1 }];
    const copy = [...arr];
    uniqBy(arr, (item) => item.id);
    expect(arr).toEqual(copy);
  });
});

describe("range", () => {
  it("generates a range with default step", () => {
    expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]);
  });

  it("generates a range with positive step", () => {
    expect(range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
  });

  it("generates a descending range with negative step", () => {
    expect(range(5, 0, -1)).toEqual([5, 4, 3, 2, 1]);
  });

  it("returns an empty array when start equals end", () => {
    expect(range(5, 5)).toEqual([]);
  });

  it("returns an empty array when start > end with positive step", () => {
    expect(range(5, 0)).toEqual([]);
  });

  it("returns an empty array when start < end with negative step", () => {
    expect(range(0, 5, -1)).toEqual([]);
  });
});

describe("zipObject", () => {
  it("zips keys and values into an object", () => {
    expect(zipObject(["a", "b", "c"], [1, 2, 3])).toEqual({
      a: 1,
      b: 2,
      c: 3,
    });
  });

  it("stops at the shorter array length (more keys)", () => {
    expect(zipObject(["a", "b", "c"], [1]) as any).toEqual({ a: 1 });
  });

  it("stops at the shorter array length (more values)", () => {
    expect(zipObject(["a"], [1, 2, 3])).toEqual({ a: 1 });
  });

  it("returns an empty object for empty arrays", () => {
    expect(zipObject([], [])).toEqual({});
  });

  it("handles string values", () => {
    expect(zipObject(["x", "y"], ["hello", "world"])).toEqual({
      x: "hello",
      y: "world",
    });
  });
});

describe("compact", () => {
  it("removes falsy values", () => {
    expect(compact([0, 1, false, 2, "", 3, null, undefined, NaN])).toEqual([1, 2, 3]);
  });

  it("handles an empty array", () => {
    expect(compact([])).toEqual([]);
  });

  it("handles an array with all falsy values", () => {
    expect(compact([0, false, "", null, undefined, NaN])).toEqual([]);
  });

  it("handles an array with all truthy values", () => {
    expect(compact([1, "hello", true, {}])).toEqual([1, "hello", true, {}]);
  });

  it("does not mutate the input", () => {
    const arr = [0, 1, false, 2];
    const copy = [...arr];
    compact(arr);
    expect(arr).toEqual(copy);
  });
});

describe("difference", () => {
  it("returns elements in a not present in b", () => {
    expect(difference([1, 2, 3, 4], [2, 4])).toEqual([1, 3]);
  });

  it("returns all of a when b is empty", () => {
    expect(difference([1, 2, 3], [])).toEqual([1, 2, 3]);
  });

  it("returns an empty array when a is empty", () => {
    expect(difference([], [1, 2])).toEqual([]);
  });

  it("returns an empty array when a and b are identical", () => {
    expect(difference([1, 2], [1, 2])).toEqual([]);
  });

  it("handles duplicate elements in a", () => {
    expect(difference([1, 2, 2, 3], [2])).toEqual([1, 3]);
  });

  it("does not mutate inputs", () => {
    const a = [1, 2, 3];
    const b = [2];
    const copyA = [...a];
    difference(a, b);
    expect(a).toEqual(copyA);
  });
});

describe("intersection", () => {
  it("returns elements present in both a and b", () => {
    expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
  });

  it("returns an empty array when no overlap", () => {
    expect(intersection([1, 2], [3, 4])).toEqual([]);
  });

  it("returns an empty array when a is empty", () => {
    expect(intersection([], [1, 2])).toEqual([]);
  });

  it("returns an empty array when b is empty", () => {
    expect(intersection([1, 2], [])).toEqual([]);
  });

  it("preserves duplicates from a", () => {
    expect(intersection([1, 2, 2, 3], [2])).toEqual([2, 2]);
  });

  it("does not mutate inputs", () => {
    const a = [1, 2];
    const b = [2];
    const copyA = [...a];
    intersection(a, b);
    expect(a).toEqual(copyA);
  });
});

describe("union", () => {
  it("returns unique elements from both a and b", () => {
    expect(union([1, 2], [2, 3])).toEqual([1, 2, 3]);
  });

  it("returns all of a when b is empty", () => {
    expect(union([1, 2], [])).toEqual([1, 2]);
  });

  it("returns all of b when a is empty", () => {
    expect(union([], [1, 2])).toEqual([1, 2]);
  });

  it("deduplicates within each array", () => {
    expect(union([1, 1, 2], [2, 3, 3])).toEqual([1, 1, 2, 3]);
  });

  it("returns a concatenation when there is no overlap", () => {
    expect(union([1], [2])).toEqual([1, 2]);
  });

  it("does not mutate inputs", () => {
    const a = [1, 2];
    const b = [3];
    const copyA = [...a];
    union(a, b);
    expect(a).toEqual(copyA);
  });
});
