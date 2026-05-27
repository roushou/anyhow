import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createScreenOrientation } from "./screen-orientation.svelte.js";

describe("createScreenOrientation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports unsupported when API is unavailable", () => {
    vi.stubGlobal("screen", {});
    let api: any;
    render(TestUtil, {
      props: { factory: createScreenOrientation, onReady: (a: any) => (api = a) },
    });
    expect(api.isSupported).toBe(false);
  });

  it("returns orientation info", () => {
    vi.stubGlobal("screen", {
      orientation: {
        type: "landscape-primary",
        angle: 90,
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    });
    let api: any;
    render(TestUtil, {
      props: { factory: createScreenOrientation, onReady: (a: any) => (api = a) },
    });
    expect(api.isSupported).toBe(true);
    expect(api.type).toBe("landscape-primary");
    expect(api.angle).toBe(90);
  });
});
