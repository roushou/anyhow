/**
 * Preload data action tests.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createPreloadData } from "./preload-data.js";

describe("createPreloadData", () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue(new Response()) as any;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns an action with a destroy method", () => {
    const a = document.createElement("a");
    a.href = "/about";
    const action = createPreloadData(a);
    expect(action).toHaveProperty("destroy");
    action.destroy();
  });

  it("fetches on mouseenter after delay", () => {
    vi.useFakeTimers();

    const a = document.createElement("a");
    a.href = "/about";
    const action = createPreloadData(a, { on: "hover", delay: 100 });

    a.dispatchEvent(new MouseEvent("mouseenter"));
    expect(fetch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fetch).toHaveBeenCalledWith(a.href, { priority: "low" });

    action.destroy();
    vi.useRealTimers();
  });

  it("does not fetch on mouseleave before delay", () => {
    vi.useFakeTimers();

    const a = document.createElement("a");
    a.href = "/about";
    const action = createPreloadData(a, { on: "hover", delay: 100 });

    a.dispatchEvent(new MouseEvent("mouseenter"));
    vi.advanceTimersByTime(50);
    a.dispatchEvent(new MouseEvent("mouseleave"));
    vi.advanceTimersByTime(100);

    expect(fetch).not.toHaveBeenCalled();

    action.destroy();
    vi.useRealTimers();
  });

  it("fetches only once", () => {
    vi.useFakeTimers();

    const a = document.createElement("a");
    a.href = "/about";
    const action = createPreloadData(a, { on: "hover", delay: 0 });

    a.dispatchEvent(new MouseEvent("mouseenter"));
    vi.advanceTimersByTime(0);
    a.dispatchEvent(new MouseEvent("mouseenter"));
    vi.advanceTimersByTime(0);

    expect(fetch).toHaveBeenCalledOnce();

    action.destroy();
    vi.useRealTimers();
  });
});
