import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import { tick } from "svelte";
import TestUtil from "../test-util.svelte";
import { createColorScheme } from "./color-scheme.svelte.js";

describe("createColorScheme", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns light when media query is false", async () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    let api: any;
    render(TestUtil, { props: { factory: createColorScheme, onReady: (a: any) => (api = a) } });
    await tick();
    expect(api.scheme).toBe("light");
  });

  it("returns dark when media query is true", async () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    let api: any;
    render(TestUtil, { props: { factory: createColorScheme, onReady: (a: any) => (api = a) } });
    await tick();
    expect(api.scheme).toBe("dark");
  });

  it("scheme is light or dark", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    let api: any;
    render(TestUtil, { props: { factory: createColorScheme, onReady: (a: any) => (api = a) } });
    expect(["light", "dark"]).toContain(api.scheme);
  });
});
