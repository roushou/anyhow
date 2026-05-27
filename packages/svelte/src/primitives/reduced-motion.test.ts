import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import { tick } from "svelte";
import TestUtil from "../test-util.svelte";
import { createReducedMotion } from "./reduced-motion.svelte.js";

describe("createReducedMotion", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns false when media query is false", async () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    let api: any;
    render(TestUtil, {
      props: { factory: createReducedMotion, onReady: (a: any) => (api = a) },
    });
    await tick();
    expect(api.reduced).toBe(false);
  });

  it("returns true when media query is true", async () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    let api: any;
    render(TestUtil, {
      props: { factory: createReducedMotion, onReady: (a: any) => (api = a) },
    });
    await tick();
    expect(api.reduced).toBe(true);
  });
});
