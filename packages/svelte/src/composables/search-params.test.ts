/**
 * Typed search params tests.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createSearchParams } from "./search-params.svelte.js";

describe("createSearchParams", () => {
  beforeEach(() => {
    delete (window as any).location;
    (window as any).location = new URL("https://example.com/");
    vi.stubGlobal("history", { ...history, replaceState: vi.fn(), state: null });
  });

  afterEach(() => {
    delete (window as any).location;
  });

  it("reads defaults when URL has no params", () => {
    let api: any;
    render(TestUtil, {
      props: {
        factory: createSearchParams,
        args: [
          {
            page: { default: 1, parse: Number, serialize: String },
            sort: { default: "name", parse: (v: string) => v, serialize: (v: string) => v },
          },
        ],
        onReady: (a: any) => (api = a),
      },
    });

    expect(api.params.page).toBe(1);
    expect(api.params.sort).toBe("name");
  });

  it("reads values from URL", () => {
    (window as any).location = new URL("https://example.com/?page=5&sort=date");

    let api: any;
    render(TestUtil, {
      props: {
        factory: createSearchParams,
        args: [
          {
            page: { default: 1, parse: Number, serialize: String },
            sort: { default: "name", parse: (v: string) => v, serialize: (v: string) => v },
          },
        ],
        onReady: (a: any) => (api = a),
      },
    });

    expect(api.params.page).toBe(5);
    expect(api.params.sort).toBe("date");
  });

  it("supports boolean parsing", () => {
    (window as any).location = new URL("https://example.com/?active=true");

    let api: any;
    render(TestUtil, {
      props: {
        factory: createSearchParams,
        args: [
          { active: { default: false, parse: (v: string) => v === "true", serialize: String } },
        ],
        onReady: (a: any) => (api = a),
      },
    });

    expect(api.params.active).toBe(true);
  });

  it("supports array parsing", () => {
    (window as any).location = new URL("https://example.com/?tags=a,b,c");

    let api: any;
    render(TestUtil, {
      props: {
        factory: createSearchParams,
        args: [
          {
            tags: {
              default: [] as string[],
              parse: (v: string) => v.split(","),
              serialize: (v: string[]) => v.join(","),
            },
          },
        ],
        onReady: (a: any) => (api = a),
      },
    });

    expect(api.params.tags).toEqual(["a", "b", "c"]);
  });

  it("reset restores defaults", () => {
    let api: any;
    render(TestUtil, {
      props: {
        factory: createSearchParams,
        args: [{ page: { default: 1, parse: Number, serialize: String } }],
        onReady: (a: any) => (api = a),
      },
    });

    api.params = { page: 99 };
    expect(api.params.page).toBe(99);

    api.reset();
    expect(api.params.page).toBe(1);
  });
});
