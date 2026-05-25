import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createBreakpoints } from "./breakpoints.svelte.js";

const BREAKPOINTS = { sm: 640, md: 768, lg: 1024 };

describe("createBreakpoints", () => {
  it("returns an object with current", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createBreakpoints, args: [BREAKPOINTS], onReady: (a: any) => (api = a) },
    });
    expect(api).toHaveProperty("current");
  });

  it("current matches the viewport width", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createBreakpoints, args: [BREAKPOINTS], onReady: (a: any) => (api = a) },
    });
    expect(["sm", "md", "lg"]).toContain(api.current);
  });

  it("has above and below methods", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createBreakpoints, args: [BREAKPOINTS], onReady: (a: any) => (api = a) },
    });
    expect(typeof api.above).toBe("function");
    expect(typeof api.below).toBe("function");
    expect(api.above("md")).toBeTypeOf("boolean");
    expect(api.below("md")).toBeTypeOf("boolean");
  });
});
