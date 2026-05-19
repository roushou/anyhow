import { describe, expect, it } from "bun:test";
import { err, ok } from "./constructors.js";

describe("ok", () => {
  it("creates a success result", () => {
    const r = ok(42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });
});

describe("err", () => {
  it("creates an error result", () => {
    const r = err("something went wrong");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe("something went wrong");
  });
});
