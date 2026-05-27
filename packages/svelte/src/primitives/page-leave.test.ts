import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import { tick } from "svelte";
import TestUtil from "../test-util.svelte";
import { createPageLeave } from "./page-leave.svelte.js";

describe("createPageLeave", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not register listener when not dirty", () => {
    const listeners: string[] = [];
    vi.stubGlobal("addEventListener", (type: string) => {
      listeners.push(type);
    });
    vi.stubGlobal("removeEventListener", () => {});

    render(TestUtil, {
      props: { factory: createPageLeave, onReady: () => {} },
    });

    expect(listeners).not.toContain("beforeunload");
  });

  it("registers beforeunload listener when dirty", async () => {
    const listeners: string[] = [];
    vi.stubGlobal("addEventListener", (type: string) => {
      listeners.push(type);
    });
    vi.stubGlobal("removeEventListener", () => {});

    let api: any;
    render(TestUtil, {
      props: { factory: createPageLeave, onReady: (a: any) => (api = a) },
    });

    api.setDirty(true);
    await tick();
    expect(listeners).toContain("beforeunload");
  });

  it("disables the guard", async () => {
    const removed: string[] = [];
    vi.stubGlobal("addEventListener", () => {});
    vi.stubGlobal("removeEventListener", (type: string) => {
      removed.push(type);
    });

    let api: any;
    render(TestUtil, {
      props: { factory: createPageLeave, onReady: (a: any) => (api = a) },
    });

    api.setDirty(true);
    await tick();
    api.disable();
    await tick();
    expect(removed).toContain("beforeunload");
  });
});
