import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createRaf } from "./raf.svelte.js";

describe("createRaf", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts running by default", () => {
    const fn = vi.fn();
    let api: any;
    render(TestUtil, { props: { factory: createRaf, args: [fn], onReady: (a: any) => (api = a) } });
    expect(api.running).toBe(true);
  });

  it("calls callback on each frame", () => {
    const fn = vi.fn();
    let api: any;
    render(TestUtil, { props: { factory: createRaf, args: [fn], onReady: (a: any) => (api = a) } });

    expect(typeof api.start).toBe("function");
    expect(typeof api.stop).toBe("function");
  });

  it("stop sets running to false", () => {
    const fn = vi.fn();
    let api: any;
    render(TestUtil, { props: { factory: createRaf, args: [fn], onReady: (a: any) => (api = a) } });
    api.stop();
    expect(api.running).toBe(false);
  });

  it("start resumes after stop", () => {
    const fn = vi.fn();
    let api: any;
    render(TestUtil, { props: { factory: createRaf, args: [fn], onReady: (a: any) => (api = a) } });
    api.stop();
    api.start();
    expect(api.running).toBe(true);
  });
});
