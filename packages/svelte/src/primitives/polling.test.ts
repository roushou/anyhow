import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createPolling } from "./polling.svelte.js";

describe("createPolling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts stopped", () => {
    const p = createPolling(async () => "ok", 100);
    expect(p.running).toBe(false);
    expect(p.data).toBeUndefined();
    expect(p.error).toBeUndefined();
  });

  it("start sets running and calls fn", async () => {
    const fn = vi.fn().mockResolvedValue("result");
    const p = createPolling(fn, 100);
    p.start();

    expect(p.running).toBe(true);
    await vi.advanceTimersByTimeAsync(0);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(p.data).toBe("result");
  });

  it("polls repeatedly", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const p = createPolling(fn, 100);
    p.start();

    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(100);

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("stop pauses the polling", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const p = createPolling(fn, 100);
    p.start();

    await vi.advanceTimersByTimeAsync(0);
    p.stop();

    await vi.advanceTimersByTimeAsync(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not stack calls if fn takes longer than ms", async () => {
    let calls = 0;
    const fn = vi.fn().mockImplementation(async () => {
      calls++;
      await new Promise((r) => setTimeout(r, 500));
      return calls;
    });
    const p = createPolling(fn, 100);
    p.start();

    await vi.advanceTimersByTimeAsync(0); // first call starts
    await vi.advanceTimersByTimeAsync(600); // first finishes, second starts
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
