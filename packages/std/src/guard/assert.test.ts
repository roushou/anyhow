import { describe, expect, it } from "bun:test";
import { assert, assertDefined, assertNever } from "./assert.js";

describe("assert", () => {
  it("does not throw for truthy values", () => {
    expect(() => assert(true)).not.toThrow();
    expect(() => assert(1)).not.toThrow();
    expect(() => assert("hello")).not.toThrow();
    expect(() => assert({})).not.toThrow();
  });

  it("throws for falsy values", () => {
    expect(() => assert(false)).toThrow("Assertion failed");
    expect(() => assert(0)).toThrow("Assertion failed");
    expect(() => assert("")).toThrow("Assertion failed");
    expect(() => assert(null)).toThrow("Assertion failed");
    expect(() => assert(undefined)).toThrow("Assertion failed");
  });

  it("uses custom message", () => {
    expect(() => assert(false, "Custom error")).toThrow("Custom error");
  });
});

describe("assertDefined", () => {
  it("does not throw for defined values", () => {
    expect(() => assertDefined("hello")).not.toThrow();
    expect(() => assertDefined(0)).not.toThrow();
    expect(() => assertDefined(false)).not.toThrow();
    expect(() => assertDefined({})).not.toThrow();
  });

  it("throws for null", () => {
    expect(() => assertDefined(null)).toThrow("is not defined");
  });

  it("throws for undefined", () => {
    expect(() => assertDefined(undefined)).toThrow("is not defined");
  });

  it("uses custom name in message", () => {
    expect(() => assertDefined(null, "userId")).toThrow("userId is not defined");
  });
});

describe("assertNever", () => {
  it("always throws", () => {
    expect(() => assertNever(42 as never)).toThrow("Unhandled case: 42");
    expect(() => assertNever("foo" as never)).toThrow('Unhandled case: "foo"');
  });
});
