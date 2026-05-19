import { describe, expect, it, mock } from "bun:test";
import { memoizeSync } from "./memoize.js";

describe("memoizeSync", () => {
  it("caches results", () => {
    const fn = mock((x: number) => x * 2);
    const memoized = memoizeSync(fn);

    expect(memoized(5)).toBe(10);
    expect(memoized(5)).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("distinguishes arguments", () => {
    const fn = mock((a: number, b: number) => a + b);
    const memoized = memoizeSync(fn);

    expect(memoized(1, 2)).toBe(3);
    expect(memoized(2, 3)).toBe(5);
    expect(memoized(1, 2)).toBe(3);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("evicts oldest entry when cache is full", () => {
    const fn = mock((x: number) => x);
    const memoized = memoizeSync(fn, { maxSize: 2 });

    memoized(1);
    memoized(2);
    memoized(3); // evicts 1
    expect(fn).toHaveBeenCalledTimes(3);

    memoized(2); // still cached
    expect(fn).toHaveBeenCalledTimes(3);

    memoized(1); // evicted — must recompute
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it("expires entries when TTL is set", async () => {
    const fn = mock(() => "val");
    const memoized = memoizeSync(fn, { ttlMs: 30 });

    expect(memoized()).toBe("val");
    expect(fn).toHaveBeenCalledTimes(1);

    await new Promise((r) => setTimeout(r, 50));

    expect(memoized()).toBe("val");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
