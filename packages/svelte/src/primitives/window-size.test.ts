import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createWindowSize } from "./window-size.svelte.js";

describe("createWindowSize", () => {
  it("returns an object with width and height", () => {
    let api: any;
    render(TestUtil, { props: { factory: createWindowSize, onReady: (a: any) => (api = a) } });
    expect(typeof api.width).toBe("number");
    expect(typeof api.height).toBe("number");
  });

  it("width and height are positive", () => {
    let api: any;
    render(TestUtil, { props: { factory: createWindowSize, onReady: (a: any) => (api = a) } });
    expect(api.width).toBeGreaterThan(0);
    expect(api.height).toBeGreaterThan(0);
  });
});
