import { describe, expect, it, mock } from "bun:test";
import { debounce, sleep, throttle } from "./timing.js";

describe("sleep", () => {
  it("resolves after at least the specified time", async () => {
    const start = Date.now();
    await sleep(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(45);
  });
});

describe("debounce", () => {
  it("calls the function only after the wait period", async () => {
    const fn = mock(() => {});
    const debounced = debounce(fn, 50);

    debounced();
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();

    await sleep(70);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("passes arguments to the original function", async () => {
    const fn = mock((..._: any[]) => {});
    const debounced = debounce(fn, 30);

    debounced("a", 1);
    await sleep(50);
    expect(fn).toHaveBeenCalledWith("a", 1);
  });
});

describe("throttle", () => {
  it("calls the function immediately the first time", () => {
    const fn = mock(() => {});
    const throttled = throttle(fn, 100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("drops calls within the throttle window", () => {
    const fn = mock(() => {});
    const throttled = throttle(fn, 100);
    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("allows calls after the window passes", async () => {
    const fn = mock(() => {});
    const throttled = throttle(fn, 50);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);
    await sleep(70);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("passes arguments to the original function", () => {
    const fn = mock((..._: any[]) => {});
    const throttled = throttle(fn, 100);
    throttled("x", 2);
    expect(fn).toHaveBeenCalledWith("x", 2);
  });
});
