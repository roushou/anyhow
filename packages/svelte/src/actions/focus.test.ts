import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createFocus } from "./focus.svelte.js";

describe("createFocus", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts not focused", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createFocus, onReady: (a: any) => (api = a) },
    });

    expect(api.focused).toBe(false);
  });
});
