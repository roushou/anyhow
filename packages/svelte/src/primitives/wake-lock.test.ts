import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createWakeLock } from "./wake-lock.svelte.js";

describe("createWakeLock", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts inactive", () => {
    vi.stubGlobal("navigator", { wakeLock: { request: () => Promise.resolve() } });

    let api: any;
    render(TestUtil, {
      props: { factory: createWakeLock, onReady: (a: any) => (api = a) },
    });

    expect(api.isActive).toBe(false);
    expect(api.isSupported).toBe(true);
  });

  it("reports unsupported when API is unavailable", () => {
    vi.stubGlobal("navigator", {});

    let api: any;
    render(TestUtil, {
      props: { factory: createWakeLock, onReady: (a: any) => (api = a) },
    });

    expect(api.isSupported).toBe(false);
  });

  it("activates on request", async () => {
    const sentinel = {
      release: () => Promise.resolve(),
      addEventListener: () => {},
    };
    vi.stubGlobal("navigator", {
      wakeLock: { request: () => Promise.resolve(sentinel) },
    });

    let api: any;
    render(TestUtil, {
      props: { factory: createWakeLock, onReady: (a: any) => (api = a) },
    });

    await api.request();
    expect(api.isActive).toBe(true);
  });

  it("deactivates on release", async () => {
    let releaseCalled = false;
    const sentinel = {
      release: () => Promise.resolve(void (releaseCalled = true)),
      addEventListener: () => {},
    };
    vi.stubGlobal("navigator", {
      wakeLock: { request: () => Promise.resolve(sentinel) },
    });

    let api: any;
    render(TestUtil, {
      props: { factory: createWakeLock, onReady: (a: any) => (api = a) },
    });

    await api.request();
    await api.release();
    expect(api.isActive).toBe(false);
    expect(releaseCalled).toBe(true);
  });
});
