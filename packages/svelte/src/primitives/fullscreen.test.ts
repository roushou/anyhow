import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createFullscreen } from "./fullscreen.svelte.js";

describe("createFullscreen", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns isFullscreen false by default", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createFullscreen, onReady: (a: any) => (api = a) },
    });

    expect(api.isFullscreen).toBe(false);
  });

  it("tracks fullscreen state via event", () => {
    // Capture the listener registered on document
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

    let api: any;
    render(TestUtil, {
      props: { factory: createFullscreen, onReady: (a: any) => (api = a) },
    });

    // Simulate entering fullscreen
    Object.defineProperty(document, "fullscreenElement", {
      value: {},
      configurable: true,
    });

    listeners["fullscreenchange"]?.();
    expect(api.isFullscreen).toBe(true);
  });
});
