import { describe, it, expect } from "vitest";
import { createToggle } from "./toggle.svelte.js";

describe("createToggle", () => {
  it("defaults to false", () => {
    const t = createToggle();
    expect(t.value).toBe(false);
  });

  it("accepts initial value", () => {
    const t = createToggle(true);
    expect(t.value).toBe(true);
  });

  it("toggle flips the value", () => {
    const t = createToggle();
    t.toggle();
    expect(t.value).toBe(true);
    t.toggle();
    expect(t.value).toBe(false);
  });

  it("on sets to true", () => {
    const t = createToggle(false);
    t.on();
    expect(t.value).toBe(true);
  });

  it("off sets to false", () => {
    const t = createToggle(true);
    t.off();
    expect(t.value).toBe(false);
  });

  it("value setter works directly", () => {
    const t = createToggle();
    t.value = true;
    expect(t.value).toBe(true);
  });
});
