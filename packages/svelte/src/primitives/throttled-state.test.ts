import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createThrottledState } from "./throttled-state.svelte.js";

describe("createThrottledState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with the initial value", () => {
    const t = createThrottledState(0, 100);
    expect(t.value).toBe(0);
  });

  it("first write commits immediately", () => {
    const t = createThrottledState(0, 100);
    t.value = 1;
    expect(t.value).toBe(1);
  });

  it("second rapid write within the window is dropped", () => {
    const t = createThrottledState(0, 100);
    t.value = 1;
    t.value = 2;
    expect(t.value).toBe(1);
  });

  it("write after the window commits", () => {
    const t = createThrottledState(0, 100);
    t.value = 1;

    // Advance time past the throttle window
    vi.advanceTimersByTime(101);
    // Need to trigger a new write after Date.now() has advanced
    t.value = 2;
    expect(t.value).toBe(2);
  });

  it("flush commits the last pending value", () => {
    const t = createThrottledState(0, 100);
    t.value = 1;
    t.value = 2;
    t.flush();
    expect(t.value).toBe(2);
  });

  it("flush after no pending value is a no-op", () => {
    const t = createThrottledState(0, 100);
    t.value = 1;
    t.flush();
    expect(t.value).toBe(1);
  });

  it("rapid writes: first commits, last via flush", () => {
    const t = createThrottledState("", 50);
    t.value = "a";
    t.value = "b";
    t.value = "c";

    expect(t.value).toBe("a");
    t.flush();
    expect(t.value).toBe("c");
  });
});
