import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createDebouncedState } from "./debounced-state.svelte.js";

describe("createDebouncedState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with the initial value", () => {
    const d = createDebouncedState("hello", 300);
    expect(d.value).toBe("hello");
  });

  it("does not update immediately on set", () => {
    const d = createDebouncedState("hello", 300);
    d.value = "world";
    expect(d.value).toBe("hello");
  });

  it("updates after the debounce delay", () => {
    const d = createDebouncedState("hello", 300);
    d.value = "world";

    vi.advanceTimersByTime(299);
    expect(d.value).toBe("hello");

    vi.advanceTimersByTime(1);
    expect(d.value).toBe("world");
  });

  it("only commits the last value with rapid changes", () => {
    const d = createDebouncedState("", 100);

    d.value = "a";
    vi.advanceTimersByTime(50);
    d.value = "b";
    vi.advanceTimersByTime(50);
    d.value = "c";

    vi.advanceTimersByTime(100);
    expect(d.value).toBe("c");
  });

  it("flush cancels the timer and commits immediately", () => {
    const d = createDebouncedState("old", 300);
    d.value = "new";
    d.flush();
    expect(d.value).toBe("new");
  });

  it("flush when no pending value is a no-op", () => {
    const d = createDebouncedState("x", 300);
    d.flush();
    expect(d.value).toBe("x");
  });
});
