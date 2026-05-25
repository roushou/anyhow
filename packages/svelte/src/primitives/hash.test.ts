import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createHash } from "./hash.svelte.js";

describe("createHash", () => {
  it("returns an object with hash getter and setter", () => {
    let api: any;
    render(TestUtil, { props: { factory: createHash, onReady: (a: any) => (api = a) } });
    expect(api).toHaveProperty("hash");
    expect(typeof api.hash).toBe("string");
  });

  it("starts with empty string when no hash is present", () => {
    let api: any;
    render(TestUtil, { props: { factory: createHash, onReady: (a: any) => (api = a) } });
    expect(api.hash).toBe("");
  });

  it("can set the hash", () => {
    let api: any;
    render(TestUtil, { props: { factory: createHash, onReady: (a: any) => (api = a) } });
    api.hash = "settings";
    expect(api.hash).toBe("settings");
  });
});
