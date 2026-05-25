import { describe, it, expect } from "vitest";
import { render } from "@testing-library/svelte/svelte5";
import TestUtil from "../test-util.svelte";
import { createActiveElement } from "./active-element.svelte.js";

describe("createActiveElement", () => {
  it("returns an object with element", () => {
    let api: any;
    render(TestUtil, { props: { factory: createActiveElement, onReady: (a: any) => (api = a) } });
    expect(api).toHaveProperty("element");
  });

  it("element is null when nothing is focused", () => {
    let api: any;
    render(TestUtil, { props: { factory: createActiveElement, onReady: (a: any) => (api = a) } });
    expect(api.element).toBe(document.body);
  });
});
