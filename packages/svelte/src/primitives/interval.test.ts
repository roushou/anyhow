import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import { tick } from "svelte";
import TestUtil from "../test-util.svelte";
import { createInterval } from "./interval.svelte.js";

describe("createInterval", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts running by default", () => {
    const fn = vi.fn();
    let api: any;
    render(TestUtil, {
      props: { factory: createInterval, args: [fn, 100], onReady: (a: any) => (api = a) },
    });
    expect(api.running).toBe(true);
  });

  it("calls callback repeatedly", () => {
    const fn = vi.fn();
    render(TestUtil, {
      props: { factory: createInterval, args: [fn, 100], onReady: (_a: any) => {} },
    });

    vi.advanceTimersByTime(350);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("stop pauses the interval", async () => {
    const fn = vi.fn();
    let api: any;
    render(TestUtil, {
      props: { factory: createInterval, args: [fn, 100], onReady: (a: any) => (api = a) },
    });

    vi.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledTimes(1);

    api.stop();
    await tick(); // flush $effect cleanup

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("start resumes after stop", () => {
    const fn = vi.fn();
    let api: any;
    render(TestUtil, {
      props: { factory: createInterval, args: [fn, 100], onReady: (a: any) => (api = a) },
    });

    api.stop();
    api.start();

    vi.advanceTimersByTime(350);
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
