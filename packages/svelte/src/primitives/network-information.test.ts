import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createNetworkInformation } from "./network-information.svelte.js";

describe("createNetworkInformation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports unsupported when API is unavailable", () => {
    vi.stubGlobal("navigator", {});
    let api: any;
    render(TestUtil, {
      props: { factory: createNetworkInformation, onReady: (a: any) => (api = a) },
    });
    expect(api.isSupported).toBe(false);
    expect(api.effectiveType).toBeUndefined();
  });

  it("returns connection info when supported", () => {
    vi.stubGlobal("navigator", {
      connection: {
        effectiveType: "4g",
        downlink: 10,
        rtt: 50,
        saveData: false,
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    });
    let api: any;
    render(TestUtil, {
      props: { factory: createNetworkInformation, onReady: (a: any) => (api = a) },
    });
    expect(api.isSupported).toBe(true);
    expect(api.effectiveType).toBe("4g");
    expect(api.downlink).toBe(10);
    expect(api.rtt).toBe(50);
    expect(api.saveData).toBe(false);
  });
});
