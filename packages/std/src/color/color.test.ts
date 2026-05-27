import { describe, expect, it } from "bun:test";
import { Color } from "./color.js";

// ── fromHex ──

describe("Color.fromHex", () => {
  it("parses 6-digit hex", () => {
    const c = Color.fromHex("#3b82f6");
    expect(c.toRgb()).toEqual({ r: 59, g: 130, b: 246 });
  });

  it("parses 3-digit hex", () => {
    const c = Color.fromHex("#fff");
    expect(c.toRgb()).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("parses 8-digit hex with alpha", () => {
    const c = Color.fromHex("#ff000080");
    expect(c.alpha).toBeCloseTo(128 / 255, 2);
  });

  it("parses without # prefix", () => {
    const c = Color.fromHex("ff8800");
    expect(c.toRgb()).toEqual({ r: 255, g: 136, b: 0 });
  });

  it("throws on invalid hex", () => {
    expect(() => Color.fromHex("xyz")).toThrow("Invalid hex color");
  });
});

// ── fromRgb ──

describe("Color.fromRgb", () => {
  it("creates from individual channels", () => {
    const c = Color.fromRgb(59, 130, 246);
    expect(c.toRgb()).toEqual({ r: 59, g: 130, b: 246 });
    expect(c.alpha).toBe(1);
  });

  it("creates from object", () => {
    const c = Color.fromRgb({ r: 255, g: 0, b: 0, a: 0.5 });
    expect(c.alpha).toBe(0.5);
  });
});

// ── fromHsl ──

describe("Color.fromHsl", () => {
  it("creates from individual values", () => {
    const c = Color.fromHsl(0, 100, 50);
    expect(c.toRgb()).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("handles grayscale", () => {
    const c = Color.fromHsl(0, 0, 50);
    expect(c.toRgb()).toEqual({ r: 128, g: 128, b: 128 });
  });

  it("creates from object", () => {
    const c = Color.fromHsl({ h: 120, s: 100, l: 50 });
    expect(c.toRgb()).toEqual({ r: 0, g: 255, b: 0 });
  });
});

// ── toHex ──

describe("Color.toHex", () => {
  it("returns lowercase hex with #", () => {
    expect(Color.fromRgb(255, 136, 0).toHex()).toBe("#ff8800");
  });

  it("includes alpha when < 1", () => {
    expect(Color.fromRgb(255, 0, 0, 0.5).toHex()).toBe("#ff000080");
  });
});

// ── toRgbString ──

describe("Color.toRgbString", () => {
  it("returns rgb() when fully opaque", () => {
    expect(Color.fromRgb(59, 130, 246).toRgbString()).toBe("rgb(59,130,246)");
  });

  it("returns rgba() when translucent", () => {
    expect(Color.fromRgb(59, 130, 246, 0.5).toRgbString()).toBe("rgba(59,130,246,0.5)");
  });
});

// ── toHsl ──

describe("Color.toHsl", () => {
  it("converts red", () => {
    expect(Color.fromHex("#ff0000").toHsl()).toEqual({ h: 0, s: 100, l: 50 });
  });

  it("converts green", () => {
    expect(Color.fromHex("#00ff00").toHsl()).toEqual({ h: 120, s: 100, l: 50 });
  });

  it("converts blue", () => {
    expect(Color.fromHex("#0000ff").toHsl()).toEqual({ h: 240, s: 100, l: 50 });
  });

  it("round-trips hsl → rgb → hsl", () => {
    const original = Color.fromHsl(217, 91, 60);
    const hsl = original.toHsl();
    expect(hsl.h).toBeCloseTo(217, -1);
    expect(hsl.s).toBeCloseTo(91, -1);
    expect(hsl.l).toBeCloseTo(60, -1);
  });
});

// ── manipulation ──

describe("Color manipulation", () => {
  it("lightens", () => {
    const c = Color.fromHex("#000000").lighten(0.5);
    expect(c.toRgb()).toEqual({ r: 128, g: 128, b: 128 });
  });

  it("darkens", () => {
    const c = Color.fromHex("#ffffff").darken(0.5);
    expect(c.toRgb()).toEqual({ r: 128, g: 128, b: 128 });
  });

  it("saturates", () => {
    const gray = Color.fromHsl(0, 0, 50);
    const saturated = gray.saturate(0.5);
    expect(saturated.toHsl().s).toBeGreaterThan(0);
  });

  it("desaturates", () => {
    const red = Color.fromHex("#ff0000");
    const dull = red.desaturate(0.5);
    expect(dull.toHsl().s).toBeLessThan(100);
  });

  it("mixes two colors", () => {
    const mid = Color.fromHex("#000000").mix(Color.fromHex("#ffffff"), 0.5);
    expect(mid.toRgb()).toEqual({ r: 128, g: 128, b: 128 });
  });

  it("withAlpha returns new color", () => {
    const c = Color.fromHex("#ff0000");
    const semi = c.withAlpha(0.5);
    expect(semi.alpha).toBe(0.5);
    expect(c.alpha).toBe(1); // original unchanged
  });
});

// ── luminance / contrast ──

describe("Color.luminance", () => {
  it("returns 0 for black", () => {
    expect(Color.fromHex("#000000").luminance()).toBe(0);
  });

  it("returns 1 for white", () => {
    expect(Color.fromHex("#ffffff").luminance()).toBe(1);
  });
});

describe("Color.contrast", () => {
  it("returns 21 for black vs white", () => {
    expect(Color.fromHex("#000000").contrast(Color.fromHex("#ffffff"))).toBe(21);
  });

  it("returns 1 for identical colors", () => {
    expect(Color.fromHex("#ff0000").contrast(Color.fromHex("#ff0000"))).toBe(1);
  });

  it("is commutative", () => {
    const a = Color.fromHex("#3b82f6");
    const b = Color.fromHex("#ffffff");
    expect(a.contrast(b)).toBe(b.contrast(a));
  });
});
