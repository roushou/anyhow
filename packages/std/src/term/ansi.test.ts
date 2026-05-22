import { describe, expect, it } from "bun:test";
import { style, stripAnsi, visibleWidth, supportsColor } from "./ansi.js";

describe("style", () => {
  it("returns text unchanged with no modifiers", () => expect(style("hello")).toBe("hello"));

  it("applies foreground color", () => expect(style.red("error")).toBe("\x1b[31merror\x1b[39m"));

  it("chains multiple modifiers", () =>
    expect(style.bold.red("critical")).toBe("\x1b[1;31mcritical\x1b[22;39m"));

  it("applies background color", () =>
    expect(style.bgRed.white("DANGER")).toBe("\x1b[41;37mDANGER\x1b[49;39m"));

  it("supports modifiers: dim, italic, underline, strikethrough, inverse, hidden", () => {
    expect(style.dim("faint")).toContain("\x1b[2m");
    expect(style.italic("em")).toContain("\x1b[3m");
    expect(style.underline("ul")).toContain("\x1b[4m");
    expect(style.strikethrough("strike")).toContain("\x1b[9m");
    expect(style.inverse("inv")).toContain("\x1b[7m");
    expect(style.hidden("hid")).toContain("\x1b[8m");
  });

  it("supports rgb", () =>
    expect(style.rgb(255, 128, 0)("orange")).toBe("\x1b[38;2;255;128;0morange\x1b[39m"));

  it("supports hex", () =>
    expect(style.hex("#ff8000")("orange")).toBe("\x1b[38;2;255;128;0morange\x1b[39m"));

  it("supports 3-char hex", () =>
    expect(style.hex("#f80")("orange")).toBe("\x1b[38;2;255;136;0morange\x1b[39m"));

  it("throws on invalid hex", () => expect(() => style.hex("zzz")).toThrow());

  it("can be saved as a reusable style", () => {
    const err = style.bold.red;
    const result = err("fail");
    expect(result).toBe("\x1b[1;31mfail\x1b[22;39m");
  });

  it("nests correctly with multiple calls", () => {
    const result = style.red("normal " + style.bold("bold"));
    expect(result).toBe("\x1b[31mnormal \x1b[1mbold\x1b[22m\x1b[39m");
  });
});

describe("stripAnsi", () => {
  it("removes escape codes", () => expect(stripAnsi("\x1b[31merror\x1b[39m")).toBe("error"));

  it("handles plain text", () => expect(stripAnsi("hello")).toBe("hello"));

  it("handles empty string", () => expect(stripAnsi("")).toBe(""));
});

describe("visibleWidth", () => {
  it("returns visible length", () => expect(visibleWidth(style.red("hi"))).toBe(2));
});

describe("supportsColor", () => {
  it("returns a boolean", () => {
    expect(typeof supportsColor()).toBe("boolean");
  });
});
