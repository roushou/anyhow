import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createIdle } from "./idle.svelte.js";

describe("createIdle", () => {
  it("starts not idle", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createIdle, args: [1000], onReady: (a: any) => (api = a) },
    });
    expect(api.idle).toBe(false);
  });

  it("has an idle property", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createIdle, args: [1000], onReady: (a: any) => (api = a) },
    });
    expect(api).toHaveProperty("idle");
    expect(typeof api.idle).toBe("boolean");
  });
});
