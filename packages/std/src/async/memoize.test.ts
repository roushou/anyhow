import { describe, expect, it, mock } from "bun:test";
import { memoizeAsync } from "./memoize.js";
import { sleep } from "./timing.js";

describe("memoizeAsync", () => {
  it("caches async results", async () => {
    const fn = mock(() => Promise.resolve(42));
    const memoized = memoizeAsync(fn);

    expect(await memoized("a")).toBe(42);
    expect(await memoized("a")).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("distinguishes arguments", async () => {
    const fn = mock((x: number) => Promise.resolve(x * 2));
    const memoized = memoizeAsync(fn);

    expect(await memoized(1)).toBe(2);
    expect(await memoized(2)).toBe(4);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("expires cached values when TTL is set", async () => {
    const fn = mock(() => Promise.resolve("val"));
    const memoized = memoizeAsync(fn, { ttlMs: 30 });

    expect(await memoized()).toBe("val");
    await sleep(50);
    expect(await memoized()).toBe("val");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("does not expire when TTL is not set", async () => {
    const fn = mock(() => Promise.resolve("val"));
    const memoized = memoizeAsync(fn);

    expect(await memoized()).toBe("val");
    await sleep(50);
    expect(await memoized()).toBe("val");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
