import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createMutationObserver } from "./mutation-observer.svelte.js";

describe("createMutationObserver", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts with empty records", () => {
    vi.stubGlobal(
      "MutationObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );

    let api: any;
    render(TestUtil, {
      props: { factory: createMutationObserver, onReady: (a: any) => (api = a) },
    });

    expect(api.records).toEqual([]);
  });
});
