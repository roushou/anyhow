/**
 * Reactive Battery Status API tests.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createBattery } from "./battery.svelte.js";

describe("createBattery", () => {
  let mockBattery: any;

  beforeEach(() => {
    mockBattery = {
      charging: true,
      level: 0.75,
      chargingTime: 1800,
      dischargingTime: Infinity,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    (navigator as any).getBattery = vi.fn().mockResolvedValue(mockBattery);
  });

  afterEach(() => {
    delete (navigator as any).getBattery;
  });

  it("exposes isSupported and default values", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createBattery, args: [], onReady: (a: any) => (api = a) },
    });
    expect(api.isSupported).toBe(true);
    expect(api.charging).toBe(false);
    expect(api.level).toBe(0);
  });

  it("returns isSupported false when API is missing", () => {
    delete (navigator as any).getBattery;

    let api: any;
    render(TestUtil, {
      props: { factory: createBattery, args: [], onReady: (a: any) => (api = a) },
    });
    expect(api.isSupported).toBe(false);
  });
});
