import { describe, expect, it } from "bun:test";
import { invariant } from "./invariant.js";

describe("invariant", () => {
  it("does not throw for truthy values", () => {
    expect(() => invariant(true)).not.toThrow();
    expect(() => invariant(1)).not.toThrow();
    expect(() => invariant("ok")).not.toThrow();
  });

  it("throws for falsy values", () => {
    expect(() => invariant(false)).toThrow("Invariant failed");
    expect(() => invariant(0)).toThrow("Invariant failed");
    expect(() => invariant(null)).toThrow("Invariant failed");
  });

  it("uses custom static message", () => {
    expect(() => invariant(false, "Value must be positive")).toThrow(
      "Invariant: Value must be positive",
    );
  });

  it("uses custom message function", () => {
    expect(() => invariant(false, () => "computed error")).toThrow("Invariant: computed error");
  });

  it("message function is not called when condition passes", () => {
    let called = false;
    invariant(true, () => {
      called = true;
      return "nope";
    });
    expect(called).toBe(false);
  });
});
