import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import { tick } from "svelte";
import TestUtil from "../test-util.svelte";
import { createGeolocation } from "./geolocation.svelte.js";

describe("createGeolocation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts in loading state", () => {
    vi.stubGlobal("navigator", {
      geolocation: { watchPosition: () => 0, clearWatch: () => {} },
    });

    let api: any;
    render(TestUtil, {
      props: { factory: createGeolocation, onReady: (a: any) => (api = a) },
    });

    expect(api.loading).toBe(true);
    expect(api.latitude).toBe(null);
  });

  it("updates on position", async () => {
    let successCallback: any;
    vi.stubGlobal("navigator", {
      geolocation: {
        watchPosition: (success: any) => {
          successCallback = success;
          return 1;
        },
        clearWatch: () => {},
      },
    });

    let api: any;
    render(TestUtil, {
      props: { factory: createGeolocation, onReady: (a: any) => (api = a) },
    });

    successCallback?.({
      coords: { latitude: 51.5, longitude: -0.1, accuracy: 10 },
    });
    await tick();

    expect(api.latitude).toBe(51.5);
    expect(api.longitude).toBe(-0.1);
    expect(api.accuracy).toBe(10);
    expect(api.loading).toBe(false);
    expect(api.error).toBeUndefined();
  });

  it("handles errors", async () => {
    let errorCallback: any;
    vi.stubGlobal("navigator", {
      geolocation: {
        watchPosition: (_success: any, error: any) => {
          errorCallback = error;
          return 2;
        },
        clearWatch: () => {},
      },
    });

    let api: any;
    render(TestUtil, {
      props: { factory: createGeolocation, onReady: (a: any) => (api = a) },
    });

    errorCallback?.(new Error("Permission denied"));
    await tick();

    expect(api.error).toBeInstanceOf(Error);
    expect(api.loading).toBe(false);
  });

  it("sets error when geolocation is unsupported", async () => {
    vi.stubGlobal("navigator", { geolocation: undefined });

    let api: any;
    render(TestUtil, {
      props: { factory: createGeolocation, onReady: (a: any) => (api = a) },
    });
    await tick();

    expect(api.error).toBeInstanceOf(Error);
    expect(api.loading).toBe(false);
  });
});
