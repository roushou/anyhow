import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import { tick } from "svelte";
import TestUtil from "../test-util.svelte";
import { createQueryParams } from "./query-params.svelte.js";

const DEFAULTS = { page: "1", sort: "name" };

describe("createQueryParams", () => {
  let calls: string[];

  beforeEach(() => {
    calls = [];
    vi.spyOn(history, "replaceState").mockImplementation((_data, _unused, url) => {
      if (typeof url === "string") calls.push(url);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with default values", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createQueryParams, args: [DEFAULTS], onReady: (a: any) => (api = a) },
    });
    expect(api.value).toEqual({ page: "1", sort: "name" });
  });

  it("updates value via setter", () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createQueryParams, args: [DEFAULTS], onReady: (a: any) => (api = a) },
    });
    api.value = { page: "5", sort: "date" };
    expect(api.value).toEqual({ page: "5", sort: "date" });
  });

  it("syncs to URL after change", async () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createQueryParams, args: [DEFAULTS], onReady: (a: any) => (api = a) },
    });
    api.value = { page: "2", sort: "name" };
    await tick();
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[calls.length - 1]).toContain("page=2");
  });

  it("reset returns all params to defaults", async () => {
    let api: any;
    render(TestUtil, {
      props: { factory: createQueryParams, args: [DEFAULTS], onReady: (a: any) => (api = a) },
    });
    api.value = { page: "99", sort: "date" };
    await tick();
    api.reset();
    expect(api.value).toEqual({ page: "1", sort: "name" });
  });
});
