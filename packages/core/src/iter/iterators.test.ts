import { describe, expect, it, mock } from "bun:test";
import {
  chunk,
  count,
  enumerate,
  every,
  filter,
  find,
  first,
  flatMap,
  forEach,
  groupBy,
  last,
  map,
  reduce,
  skip,
  some,
  take,
  unique,
  zip,
} from "./iterators.js";

// ── generators ──

describe("map", () => {
  it("transforms each element", () => {
    expect([...map([1, 2, 3], (n) => n * 2)]).toEqual([2, 4, 6]);
  });
  it("provides index as second argument", () => {
    expect([...map(["a", "b"], (_, i) => i)]).toEqual([0, 1]);
  });
  it("returns empty for empty iterable", () => {
    expect([...map([], (n: number) => n)]).toEqual([]);
  });
});

describe("filter", () => {
  it("keeps matching elements", () => {
    expect([...filter([1, 2, 3, 4], (n) => n % 2 === 0)]).toEqual([2, 4]);
  });
  it("provides index as second argument", () => {
    expect([...filter(["a", "b", "c"], (_, i) => i > 0)]).toEqual(["b", "c"]);
  });
  it("returns empty for empty iterable", () => {
    expect([...filter([], () => true)]).toEqual([]);
  });
});

describe("flatMap", () => {
  it("maps and flattens", () => {
    expect([...flatMap([1, 2], (n) => [n, n * 10])]).toEqual([1, 10, 2, 20]);
  });
  it("provides index as second argument", () => {
    expect([...flatMap(["a", "b"], (_, i) => [i])]).toEqual([0, 1]);
  });
  it("returns empty for empty iterable", () => {
    expect([...flatMap([], (n: number) => [n])]).toEqual([]);
  });
});

describe("take", () => {
  it("takes the first n elements", () => {
    expect([...take([1, 2, 3, 4, 5], 3)]).toEqual([1, 2, 3]);
  });
  it("returns all when n exceeds length", () => {
    expect([...take([1, 2], 5)]).toEqual([1, 2]);
  });
  it("returns empty when n is 0", () => {
    expect([...take([1, 2, 3], 0)]).toEqual([]);
  });
  it("returns empty for empty iterable", () => {
    expect([...take([], 3)]).toEqual([]);
  });
});

describe("skip", () => {
  it("skips the first n elements", () => {
    expect([...skip([1, 2, 3, 4, 5], 2)]).toEqual([3, 4, 5]);
  });
  it("returns empty when n exceeds length", () => {
    expect([...skip([1, 2], 5)]).toEqual([]);
  });
  it("returns all when n is 0", () => {
    expect([...skip([1, 2, 3], 0)]).toEqual([1, 2, 3]);
  });
  it("returns empty for empty iterable", () => {
    expect([...skip([], 3)]).toEqual([]);
  });
});

describe("enumerate", () => {
  it("yields [index, value] pairs", () => {
    expect([...enumerate(["a", "b", "c"])]).toEqual([
      [0, "a"],
      [1, "b"],
      [2, "c"],
    ]);
  });
  it("returns empty for empty iterable", () => {
    expect([...enumerate([])]).toEqual([]);
  });
});

describe("unique", () => {
  it("removes duplicates", () => {
    expect([...unique([1, 2, 2, 3, 1, 3, 4])]).toEqual([1, 2, 3, 4]);
  });
  it("removes duplicates by key", () => {
    expect([...unique([{ id: 1 }, { id: 2 }, { id: 1 }], (x) => x.id)]).toEqual([
      { id: 1 },
      { id: 2 },
    ]);
  });
  it("returns empty for empty iterable", () => {
    expect([...unique([])]).toEqual([]);
  });
});

describe("zip", () => {
  it("zips equal-length iterables", () => {
    expect([...zip([1, 2, 3], ["a", "b", "c"])]).toEqual([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);
  });
  it("stops at the shorter iterable", () => {
    expect([...zip([1, 2], ["a", "b", "c"])]).toEqual([
      [1, "a"],
      [2, "b"],
    ]);
    expect([...zip([1, 2, 3], ["a"])]).toEqual([[1, "a"]]);
  });
  it("returns empty when first is empty", () => {
    expect([...zip([], ["a", "b"])]).toEqual([]);
  });
});

describe("chunk", () => {
  it("splits into even chunks", () => {
    expect([...chunk([1, 2, 3, 4, 5, 6], 2)]).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });
  it("handles a partial last chunk", () => {
    expect([...chunk([1, 2, 3, 4, 5], 2)]).toEqual([[1, 2], [3, 4], [5]]);
  });
  it("returns empty for empty iterable", () => {
    expect([...chunk([], 3)]).toEqual([]);
  });
  it("handles chunk size larger than the iterable", () => {
    expect([...chunk([1, 2], 5)]).toEqual([[1, 2]]);
  });
  it("handles chunk size of 1", () => {
    expect([...chunk([1, 2, 3], 1)]).toEqual([[1], [2], [3]]);
  });
});

// ── terminal ──

describe("first", () => {
  it("returns the first element", () => {
    expect(first([1, 2, 3])).toBe(1);
  });
  it("returns undefined for empty iterable", () => {
    expect(first([])).toBeUndefined();
  });
  it("works with iterators", () => {
    function* gen() {
      yield "a";
      yield "b";
    }
    expect(first(gen())).toBe("a");
  });
});

describe("last", () => {
  it("returns the last element", () => {
    expect(last([1, 2, 3])).toBe(3);
  });
  it("returns undefined for empty iterable", () => {
    expect(last([])).toBeUndefined();
  });
  it("returns the only element for single-element iterable", () => {
    expect(last([42])).toBe(42);
  });
});

describe("count", () => {
  it("counts elements", () => {
    expect(count([1, 2, 3, 4])).toBe(4);
  });
  it("returns 0 for empty iterable", () => {
    expect(count([])).toBe(0);
  });
});

describe("find", () => {
  it("finds the first matching element", () => {
    expect(find([1, 2, 3, 4], (n) => n > 2)).toBe(3);
  });
  it("returns undefined when no match", () => {
    expect(find([1, 2, 3], (n) => n > 10)).toBeUndefined();
  });
  it("provides index as second argument", () => {
    expect(find(["a", "b", "c"], (_, i) => i === 2)).toBe("c");
  });
});

describe("some", () => {
  it("returns true when any match", () => {
    expect(some([1, 2, 3], (n) => n > 2)).toBe(true);
  });
  it("returns false when none match", () => {
    expect(some([1, 2, 3], (n) => n > 10)).toBe(false);
  });
  it("returns false for empty iterable", () => {
    expect(some([], () => true)).toBe(false);
  });
});

describe("every", () => {
  it("returns true when all match", () => {
    expect(every([2, 4, 6], (n) => n % 2 === 0)).toBe(true);
  });
  it("returns false when any does not match", () => {
    expect(every([2, 3, 6], (n) => n % 2 === 0)).toBe(false);
  });
  it("returns true for empty iterable", () => {
    expect(every([], () => false)).toBe(true);
  });
});

describe("reduce", () => {
  it("reduces with initial value", () => {
    expect(reduce([1, 2, 3], (acc, n) => acc + n, 0)).toBe(6);
  });
  it("returns initial for empty iterable", () => {
    expect(reduce([], (acc, n) => acc + n, 10)).toBe(10);
  });
  it("provides index as third argument", () => {
    expect(reduce(["a", "b"], (acc, _, i) => acc + i, 0)).toBe(1);
  });
});

describe("forEach", () => {
  it("calls fn for each element", () => {
    const fn = mock();
    forEach([1, 2, 3], fn);
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenNthCalledWith(1, 1, 0);
    expect(fn).toHaveBeenNthCalledWith(2, 2, 1);
    expect(fn).toHaveBeenNthCalledWith(3, 3, 2);
  });
  it("does not call fn for empty iterable", () => {
    const fn = mock();
    forEach([], fn);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe("groupBy", () => {
  it("groups by key", () => {
    const result = groupBy([1, 2, 3, 4, 5], (n) => (n % 2 === 0 ? "even" : "odd"));
    expect(result.get("even")).toEqual([2, 4]);
    expect(result.get("odd")).toEqual([1, 3, 5]);
  });
  it("returns empty map for empty iterable", () => {
    expect(groupBy([], (x: number) => x).size).toBe(0);
  });
  it("handles single group", () => {
    expect(groupBy(["a", "aa", "aaa"], () => "all").get("all")).toEqual(["a", "aa", "aaa"]);
  });
});

// ── composition ──

describe("composition", () => {
  it("pipelines map → filter → take", () => {
    const result = [
      ...take(
        filter(
          map([1, 2, 3, 4, 5, 6], (n) => n * 10),
          (n) => n >= 30,
        ),
        3,
      ),
    ];
    expect(result).toEqual([30, 40, 50]);
  });

  it("pipelines skip → take → enumerate", () => {
    const result = [...enumerate(take(skip([1, 2, 3, 4, 5, 6], 2), 3))];
    expect(result).toEqual([
      [0, 3],
      [1, 4],
      [2, 5],
    ]);
  });

  it("pipelines filter → first", () => {
    expect(first(filter([1, 2, 3, 4], (n) => n > 2))).toBe(3);
  });
});
