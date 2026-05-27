import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createInfiniteScroll } from "./infinite-scroll.svelte.js";

describe("createInfiniteScroll", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads first page on init", async () => {
    const fetcher = vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]);
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );

    let api: any;
    render(TestUtil, {
      props: {
        factory: createInfiniteScroll,
        args: [fetcher],
        onReady: (a: any) => (api = a),
      },
    });

    // Wait for async load
    await vi.waitFor(() => expect(api.items.length).toBe(2));
    expect(api.items).toEqual([{ id: 1 }, { id: 2 }]);
    expect(api.hasMore).toBe(true);
  });

  it("sets hasMore to false on empty response", async () => {
    const fetcher = vi.fn().mockResolvedValue([]);
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        observe() {}
        disconnect() {}
      },
    );

    let api: any;
    render(TestUtil, {
      props: {
        factory: createInfiniteScroll,
        args: [fetcher],
        onReady: (a: any) => (api = a),
      },
    });

    await vi.waitFor(() => expect(api.hasMore).toBe(false));
    expect(api.items).toEqual([]);
  });
});
