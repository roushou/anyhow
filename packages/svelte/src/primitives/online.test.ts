import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createOnline } from "./online.svelte.js";

describe("createOnline", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns online status", () => {
    vi.stubGlobal("navigator", { onLine: true });
    let api: any;
    render(TestUtil, { props: { factory: createOnline, onReady: (a: any) => (api = a) } });
    expect(api.online).toBe(true);
  });

  it("detects offline status", () => {
    vi.stubGlobal("navigator", { onLine: false });
    let api: any;
    render(TestUtil, { props: { factory: createOnline, onReady: (a: any) => (api = a) } });
    expect(api.online).toBe(false);
  });
});
