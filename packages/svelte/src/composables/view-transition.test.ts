/**
 * Reactive view transition tests.
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createViewTransition } from "./view-transition.svelte.js";

describe("createViewTransition", () => {
  it("exposes navigating, from, to, type as defaults", () => {
    const onNavigate = vi.fn().mockReturnValue(() => {});

    let api: any;
    render(TestUtil, {
      props: {
        factory: createViewTransition,
        args: [{ onNavigate }],
        onReady: (a: any) => (api = a),
      },
    });

    expect(api.navigating).toBe(false);
    expect(api.from).toBeUndefined();
    expect(api.to).toBeUndefined();
    expect(api.type).toBeUndefined();
  });

  it("calls onNavigate and updates state on navigation", () => {
    const toUrl = new URL("https://example.com/about");
    let capturedCb: any;

    const onNavigate = vi.fn().mockImplementation((cb) => {
      capturedCb = cb;
      return () => {};
    });

    let api: any;
    render(TestUtil, {
      props: {
        factory: createViewTransition,
        args: [{ onNavigate }],
        onReady: (a: any) => (api = a),
      },
    });

    // Simulate a navigation event
    capturedCb({
      from: null,
      to: { url: toUrl },
      type: "link",
    });

    expect(api.navigating).toBe(true);
    expect(api.to).toBe(toUrl);
    expect(api.type).toBe("link");
  });
});
