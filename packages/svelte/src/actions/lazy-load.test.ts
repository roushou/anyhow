import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createLazyLoad } from "./lazy-load.svelte.js";

describe("createLazyLoad", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts with isIntersecting false", () => {
    // Stub IntersectionObserver to never fire
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );

    let api: any;
    render(TestUtil, {
      props: { factory: createLazyLoad, onReady: (a: any) => (api = a) },
    });

    expect(api.isIntersecting).toBe(false);
  });
});
