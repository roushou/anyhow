import { describe, expect, it } from "bun:test";
import { none, some } from "./constructors.js";

describe("some", () => {
  it("creates a Some variant", () => {
    const opt = some(42);
    expect(opt.some).toBe(true);
    if (opt.some) expect(opt.value).toBe(42);
  });

  it("round-trips the value", () => {
    const value = { name: "Alice", age: 30 };
    const opt = some(value);
    expect(opt.some).toBe(true);
    if (opt.some) expect(opt.value).toBe(value);
  });

  it("works with primitives", () => {
    expect(some("hello").some).toBe(true);
    expect(some(true).some).toBe(true);
    expect(some(null).some).toBe(true);
  });
});

describe("none", () => {
  it("creates a None variant", () => {
    const opt = none();
    expect(opt.some).toBe(false);
  });

  it("is referentially equal (singleton)", () => {
    expect(none() === none()).toBe(true);
  });
});
