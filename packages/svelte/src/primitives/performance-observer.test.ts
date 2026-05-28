/**
 * Reactive PerformanceObserver tests.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createPerformanceObserver } from "./performance-observer.svelte.js";

describe("createPerformanceObserver", () => {
  beforeEach(() => {
    (window as any).PerformanceObserver = vi.fn().mockImplementation((_cb: any) => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    delete (window as any).PerformanceObserver;
  });

  it("exposes isSupported and empty entries", () => {
    let api: any;
    render(TestUtil, {
      props: {
        factory: createPerformanceObserver,
        args: [{ type: "largest-contentful-paint" }],
        onReady: (a: any) => (api = a),
      },
    });
    expect(api.isSupported).toBe(true);
    expect(api.entries).toEqual([]);
  });

  it("returns isSupported false when API is missing", () => {
    delete (window as any).PerformanceObserver;

    let api: any;
    render(TestUtil, {
      props: {
        factory: createPerformanceObserver,
        args: [{ type: "paint" }],
        onReady: (a: any) => (api = a),
      },
    });
    expect(api.isSupported).toBe(false);
  });

  it("creates an observer with the given type", () => {
    render(TestUtil, {
      props: {
        factory: createPerformanceObserver,
        args: [{ type: "paint" }],
        onReady: () => {},
      },
    });
    expect(window.PerformanceObserver).toHaveBeenCalled();
  });
});
