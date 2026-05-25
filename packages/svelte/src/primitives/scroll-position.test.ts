import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createScrollPosition } from "./scroll-position.svelte.js";

describe("createScrollPosition", () => {
  it("starts with x=0 and y=0", () => {
    let api: any;
    render(TestUtil, { props: { factory: createScrollPosition, onReady: (a: any) => (api = a) } });
    expect(api.x).toBe(0);
    expect(api.y).toBe(0);
  });

  it("isScrolling starts as false", () => {
    let api: any;
    render(TestUtil, { props: { factory: createScrollPosition, onReady: (a: any) => (api = a) } });
    expect(api.isScrolling).toBe(false);
  });

  it("returns an object with x, y, isScrolling", () => {
    let api: any;
    render(TestUtil, { props: { factory: createScrollPosition, onReady: (a: any) => (api = a) } });
    expect(api).toHaveProperty("x");
    expect(api).toHaveProperty("y");
    expect(api).toHaveProperty("isScrolling");
  });

  it("has a direction property", () => {
    let api: any;
    render(TestUtil, { props: { factory: createScrollPosition, onReady: (a: any) => (api = a) } });
    expect(api).toHaveProperty("direction");
    expect(api.direction).toBeUndefined();
  });
});
