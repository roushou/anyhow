import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import Wrapper from "./intersection-observer.test-wrapper.svelte";

describe("createIntersectionObserver", () => {
  beforeEach(() => {
    (window as any).IntersectionObserver = class {
      observe = vi.fn();
      disconnect = vi.fn();
      constructor(_callback: any, _opts?: any) {}
    };
  });

  afterEach(() => {
    delete (window as any).IntersectionObserver;
  });
  it("returns isIntersecting and entry", () => {
    let api: any;
    render(Wrapper, { props: { onReady: (a: any) => (api = a) } });
    expect(api).toHaveProperty("isIntersecting");
    expect(api).toHaveProperty("entry");
  });

  it("isIntersecting is a boolean", () => {
    let api: any;
    render(Wrapper, { props: { onReady: (a: any) => (api = a) } });
    expect(typeof api.isIntersecting).toBe("boolean");
  });

  it("has an action property", () => {
    let api: any;
    render(Wrapper, { props: { onReady: (a: any) => (api = a) } });
    expect(api).toHaveProperty("action");
  });
});
