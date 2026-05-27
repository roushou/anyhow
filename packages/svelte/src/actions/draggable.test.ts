import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createDraggable } from "./draggable.svelte.js";

describe("createDraggable", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts with zero position and not dragging", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createDraggable, onReady: (a: any) => (api = a) },
    });

    expect(api.x).toBe(0);
    expect(api.y).toBe(0);
    expect(api.dragging).toBe(false);
  });
});
