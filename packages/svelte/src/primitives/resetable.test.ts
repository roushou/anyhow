import { describe, it, expect } from "vitest";
import { createResetable } from "./resetable.svelte.js";

describe("createResetable", () => {
  it("starts with the initial value", () => {
    const r = createResetable(42);
    expect(r.value).toBe(42);
  });

  it("setter updates the value", () => {
    const r = createResetable("hello");
    r.value = "world";
    expect(r.value).toBe("world");
  });

  it("reset returns to the initial value", () => {
    const r = createResetable(10);
    r.value = 99;
    r.reset();
    expect(r.value).toBe(10);
  });

  it("works with object values", () => {
    const obj = { name: "Alice" };
    const r = createResetable(obj);
    r.value = { name: "Bob" };
    expect(r.value).toEqual({ name: "Bob" });
    r.reset();
    expect(r.value).toEqual({ name: "Alice" });
  });

  it("reset after multiple mutations", () => {
    const r = createResetable(0);
    r.value = 1;
    r.value = 2;
    r.value = 3;
    r.reset();
    expect(r.value).toBe(0);
  });

  it("reset is idempotent", () => {
    const r = createResetable("x");
    r.reset();
    r.reset();
    expect(r.value).toBe("x");
  });
});
