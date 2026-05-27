import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createPreferredLanguages } from "./preferred-languages.svelte.js";

describe("createPreferredLanguages", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns navigator languages", () => {
    vi.stubGlobal("navigator", { languages: ["en-US", "fr"] });

    let api: any;
    render(TestUtil, {
      props: { factory: createPreferredLanguages, onReady: (a: any) => (api = a) },
    });

    expect(api.languages).toEqual(["en-US", "fr"]);
  });

  it("returns empty array when navigator is unavailable", () => {
    vi.stubGlobal("navigator", undefined);

    let api: any;
    render(TestUtil, {
      props: { factory: createPreferredLanguages, onReady: (a: any) => (api = a) },
    });

    expect(api.languages).toEqual([]);
  });
});
