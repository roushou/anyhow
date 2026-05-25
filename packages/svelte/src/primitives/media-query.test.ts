import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import { tick } from "svelte";
import TestUtil from "../test-util.svelte";
import { createMediaQuery } from "./media-query.svelte.js";

describe("createMediaQuery", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a boolean current value", () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    let api: any;
    render(TestUtil, {
      props: {
        factory: createMediaQuery,
        args: ["(min-width: 768px)"],
        onReady: (a: any) => (api = a),
      },
    });
    expect(typeof api.current).toBe("boolean");
  });

  it("respects matchMedia result", async () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    let api: any;
    render(TestUtil, {
      props: {
        factory: createMediaQuery,
        args: ["(min-width: 768px)"],
        onReady: (a: any) => (api = a),
      },
    });
    await tick();
    expect(api.current).toBe(true);
  });
});
