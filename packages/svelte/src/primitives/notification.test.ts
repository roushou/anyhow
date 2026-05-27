import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createNotification } from "./notification.svelte.js";

describe("createNotification", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports unsupported when API is unavailable", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createNotification, onReady: (a: any) => (api = a) },
    });
    expect(api.isSupported).toBe(false);
  });

  it("shows notification when permission is granted", () => {
    let lastTitle = "";
    const MockNotification = function (this: any, title: string, _opts?: NotificationOptions) {
      lastTitle = title;
    } as any;
    MockNotification.permission = "granted";
    vi.stubGlobal("Notification", MockNotification);
    vi.stubGlobal("navigator", {
      permissions: { query: () => Promise.resolve({ addEventListener: () => {} }) },
    });

    let api: any;
    render(TestUtil, {
      props: { factory: createNotification, onReady: (a: any) => (api = a) },
    });
    expect(api.isSupported).toBe(true);
    expect(api.permission).toBe("granted");

    const result = api.show("Hello");
    expect(result).toBe(true);
    expect(lastTitle).toBe("Hello");
  });

  it("does not show when denied", () => {
    const MockNotification = function () {} as any;
    MockNotification.permission = "denied";
    vi.stubGlobal("Notification", MockNotification);
    vi.stubGlobal("navigator", {
      permissions: { query: () => Promise.resolve({ addEventListener: () => {} }) },
    });

    let api: any;
    render(TestUtil, {
      props: { factory: createNotification, onReady: (a: any) => (api = a) },
    });
    expect(api.permission).toBe("denied");
    expect(api.show("Hello")).toBe(false);
  });
});
