import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import Wrapper from "./element-size.test-wrapper.svelte";

describe("createElementSize", () => {
  beforeEach(() => {
    (window as any).ResizeObserver = class {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(_callback: any) {}
    };
  });

  afterEach(() => {
    delete (window as any).ResizeObserver;
  });
  it("returns width and height", () => {
    let api: any;
    render(Wrapper, { props: { onReady: (a: any) => (api = a) } });
    expect(typeof api.width).toBe("number");
    expect(typeof api.height).toBe("number");
  });

  it("has an action property", () => {
    let api: any;
    render(Wrapper, { props: { onReady: (a: any) => (api = a) } });
    expect(api).toHaveProperty("action");
  });
});
