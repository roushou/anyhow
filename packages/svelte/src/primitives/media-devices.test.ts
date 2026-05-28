/**
 * Reactive MediaDevices API tests.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createMediaDevices } from "./media-devices.svelte.js";

describe("createMediaDevices", () => {
  let mockStream: any;

  beforeEach(() => {
    mockStream = {
      getTracks: vi.fn().mockReturnValue([{ stop: vi.fn() }]),
    };

    (navigator as any).mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue(mockStream),
      enumerateDevices: vi.fn().mockResolvedValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
  });

  afterEach(() => {
    delete (navigator as any).mediaDevices;
  });

  it("exposes isSupported and default values", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createMediaDevices, args: [], onReady: (a: any) => (api = a) },
    });
    expect(api.isSupported).toBe(true);
    expect(api.stream).toBeNull();
    expect(api.error).toBeUndefined();
    expect(api.loading).toBe(false);
  });

  it("returns isSupported false when API is missing", () => {
    delete (navigator as any).mediaDevices;

    let api: any;
    render(TestUtil, {
      props: { factory: createMediaDevices, args: [], onReady: (a: any) => (api = a) },
    });
    expect(api.isSupported).toBe(false);
  });

  it("request sets stream on success", async () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createMediaDevices, args: [], onReady: (a: any) => (api = a) },
    });

    await api.request({ video: true });

    expect(api.stream).toStrictEqual(mockStream);
    expect(api.error).toBeUndefined();
    expect(api.loading).toBe(false);
  });

  it("request sets error on failure", async () => {
    (navigator as any).mediaDevices.getUserMedia = vi
      .fn()
      .mockRejectedValue(new Error("NotAllowedError"));

    let api: any;
    render(TestUtil, {
      props: { factory: createMediaDevices, args: [], onReady: (a: any) => (api = a) },
    });

    await api.request();

    expect(api.stream).toBeNull();
    expect(api.error).toBe("NotAllowedError");
  });

  it("stop clears the stream and stops tracks", async () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createMediaDevices, args: [], onReady: (a: any) => (api = a) },
    });

    await api.request();
    api.stop();

    expect(api.stream).toBeNull();
    expect(mockStream.getTracks).toHaveBeenCalled();
  });
});
