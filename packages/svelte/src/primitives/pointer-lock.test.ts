import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createPointerLock } from "./pointer-lock.svelte.js";

describe("createPointerLock", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts unlocked", () => {
    // pointerLockElement is not on jsdom's document; define it so isSupported returns true
    Object.defineProperty(document, "pointerLockElement", {
      value: null,
      configurable: true,
      writable: true,
    });

    let api: any;
    render(TestUtil, {
      props: { factory: createPointerLock, onReady: (a: any) => (api = a) },
    });
    expect(api.isSupported).toBe(true);
    expect(api.locked).toBe(false);
  });

  it("tracks lock state via event", () => {
    const listeners: Record<string, (e?: any) => void> = {};
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

    Object.defineProperty(document, "pointerLockElement", {
      value: null,
      configurable: true,
      writable: true,
    });

    let api: any;
    render(TestUtil, {
      props: { factory: createPointerLock, onReady: (a: any) => (api = a) },
    });

    expect(api.isSupported).toBe(true);
    expect(api.locked).toBe(false);

    // Simulate lock
    Object.defineProperty(document, "pointerLockElement", {
      value: {},
      configurable: true,
      writable: true,
    });
    listeners["pointerlockchange"]?.();
    expect(api.locked).toBe(true);
  });
});
