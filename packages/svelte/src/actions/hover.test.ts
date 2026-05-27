import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createHover } from "./hover.svelte.js";

describe("createHover", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts not hovering", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createHover, onReady: (a: any) => (api = a) },
    });

    expect(api.isHovering).toBe(false);
  });
});
