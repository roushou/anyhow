import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createVisibility } from "./visibility.svelte.js";

describe("createVisibility", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns an object with visible", () => {
    let api: any;
    render(TestUtil, { props: { factory: createVisibility, onReady: (a: any) => (api = a) } });
    expect(api).toHaveProperty("visible");
    expect(typeof api.visible).toBe("boolean");
  });

  it("visible is true by default in jsdom", () => {
    let api: any;
    render(TestUtil, { props: { factory: createVisibility, onReady: (a: any) => (api = a) } });
    expect(api.visible).toBe(true);
  });
});
