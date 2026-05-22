import { describe, expect, it } from "bun:test";
import { progress } from "./progress.js";

describe("progress", () => {
  it("shows 0%", () => expect(progress(0, 10)).toContain("0%"));

  it("shows 100%", () => expect(progress(1, 10)).toContain("100%"));

  it("shows 50%", () => expect(progress(0.5, 10)).toContain("50%"));

  it("clamps below 0", () => expect(progress(-1, 10)).toContain("0%"));

  it("clamps above 1", () => expect(progress(2, 10)).toContain("100%"));

  it("includes left label", () =>
    expect(progress(0.5, 10, { left: "Loading" })).toContain("Loading"));

  it("includes right label", () => expect(progress(0.5, 10, { right: "5/10" })).toContain("5/10"));

  it("uses dot style", () => {
    const result = progress(0.5, 10, { style: "dot" });
    expect(result).toContain("•");
    expect(result).toContain("·");
  });

  it("produces different output for different ratios", () => {
    const a = progress(0, 10);
    const b = progress(1, 10);
    expect(a).not.toBe(b);
  });
});
