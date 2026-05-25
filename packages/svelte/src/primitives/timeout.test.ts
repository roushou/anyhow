import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createTimeout } from "./timeout.svelte.js";

describe("createTimeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with running=false", () => {
    const t = createTimeout(() => {}, 100);
    expect(t.running).toBe(false);
  });

  it("start sets running=true", () => {
    const t = createTimeout(() => {}, 100);
    t.start();
    expect(t.running).toBe(true);
  });

  it("fires callback after ms", () => {
    const fn = vi.fn();
    const t = createTimeout(fn, 100);
    t.start();

    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    expect(t.running).toBe(true);

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(t.running).toBe(false);
  });

  it("cancel stops the timer", () => {
    const fn = vi.fn();
    const t = createTimeout(fn, 100);
    t.start();
    t.cancel();

    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
    expect(t.running).toBe(false);
  });

  it("start cancels the previous timer", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();

    const t = createTimeout(fn1, 100);
    t.start();
    t.cancel();

    // Restart with different timing
    const t2 = createTimeout(fn2, 100);
    t2.start();

    vi.advanceTimersByTime(100);
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it("cancel when not running is a no-op", () => {
    const t = createTimeout(() => {}, 100);
    t.cancel();
    expect(t.running).toBe(false);
  });
});
