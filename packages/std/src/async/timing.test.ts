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

  it("leading fires immediately on first call", () => {
    const fn = mock((..._: any[]) => {});
    const debounced = debounce(fn, 100, { leading: true });
    debounced("a");
    expect(fn).toHaveBeenCalledWith("a");
  });

  it("flush invokes pending call immediately", () => {
    const fn = mock((..._: any[]) => {});
    const debounced = debounce(fn, 100);
    debounced("x");
    expect(fn).not.toHaveBeenCalled();
    debounced.flush();
    expect(fn).toHaveBeenCalledWith("x");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("flush is a no-op when nothing pending", () => {
    const fn = mock(() => {});
    const debounced = debounce(fn, 100);
    debounced.flush();
    expect(fn).not.toHaveBeenCalled();
  });

  it("cancel prevents the pending call", async () => {
    const fn = mock(() => {});
    const debounced = debounce(fn, 50);
    debounced();
    debounced.cancel();
    await sleep(70);
    expect(fn).not.toHaveBeenCalled();
  });

  it("trailing: false suppresses deferred call", async () => {
    const fn = mock(() => {});
    const debounced = debounce(fn, 30, { trailing: false });
    debounced();
    await sleep(50);
    expect(fn).not.toHaveBeenCalled();
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

  it("trailing fires the last call after the window", async () => {
    const fn = mock(() => {});
    const throttled = throttle(fn, 50, { trailing: true });
    throttled();
    expect(fn).toHaveBeenCalledTimes(1); // leading
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledTimes(1); // dropped
    await sleep(70);
    expect(fn).toHaveBeenCalledTimes(2); // trailing fired
  });

  it("flush invokes pending trailing call immediately", () => {
    const fn = mock(() => {});
    const throttled = throttle(fn, 100, { trailing: true });
    throttled(); // leading
    throttled(); // queued as trailing
    throttled.flush();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("cancel drops pending trailing call", async () => {
    const fn = mock(() => {});
    const throttled = throttle(fn, 100, { trailing: true });
    throttled(); // leading
    throttled(); // queued as trailing
    throttled.cancel();
    await sleep(120);
    expect(fn).toHaveBeenCalledTimes(1); // only the leading call
  });

  it("leading: false suppresses immediate call", () => {
    const fn = mock(() => {});
    const throttled = throttle(fn, 100, { leading: false, trailing: true });
    throttled();
    expect(fn).not.toHaveBeenCalled();
  });
});
