import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createMousePosition } from "./mouse-position.svelte.js";

describe("createMousePosition", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns initial zero coordinates", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createMousePosition, onReady: (a: any) => (api = a) },
    });
    expect(api.pageX).toBe(0);
    expect(api.pageY).toBe(0);
    expect(api.clientX).toBe(0);
    expect(api.clientY).toBe(0);
  });

  it("updates on mousemove", () => {
    let listeners: Record<string, (e: any) => void> = {};
    vi.stubGlobal("addEventListener", (type: string, fn: any) => {
      listeners[type] = fn;
    });
    vi.stubGlobal("removeEventListener", () => {});

    let api: any;
    render(TestUtil, {
      props: { factory: createMousePosition, onReady: (a: any) => (api = a) },
    });

    listeners["mousemove"]?.({ pageX: 150, pageY: 200, clientX: 100, clientY: 150 });
    expect(api.pageX).toBe(150);
    expect(api.pageY).toBe(200);
    expect(api.clientX).toBe(100);
    expect(api.clientY).toBe(150);
  });
});
