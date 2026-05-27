import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createTextSelection } from "./text-selection.svelte.js";

describe("createTextSelection", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns empty text by default", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createTextSelection, onReady: (a: any) => (api = a) },
    });

    expect(api.text).toBe("");
    expect(api.ranges).toEqual([]);
    expect(api.rects).toEqual([]);
  });

  it("tracks selection text", () => {
    const listeners: Record<string, () => void> = {};
    const originalAdd = document.addEventListener.bind(document);
    const originalRemove = document.removeEventListener.bind(document);

    vi.spyOn(document, "addEventListener").mockImplementation((type: string, fn: any) => {
      listeners[type] = fn;
      return originalAdd(type as any, fn);
    });
    vi.spyOn(document, "removeEventListener").mockImplementation((type: string, fn: any) => {
      delete listeners[type];
      return originalRemove(type as any, fn);
    });

    vi.stubGlobal("getSelection", () => ({
      toString: () => "hello world",
      rangeCount: 0,
    }));

    let api: any;
    render(TestUtil, {
      props: { factory: createTextSelection, onReady: (a: any) => (api = a) },
    });

    listeners["selectionchange"]?.();
    expect(api.text).toBe("hello world");
  });
});
