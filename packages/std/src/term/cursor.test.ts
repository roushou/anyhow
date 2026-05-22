import { describe, expect, it } from "bun:test";
import {
  clearScreen,
  clearLine,
  cursorTo,
  cursorUp,
  cursorDown,
  cursorRight,
  cursorLeft,
  cursorHide,
  cursorShow,
  cursorSave,
  cursorRestore,
} from "./cursor.js";

describe("cursor", () => {
  it("clearScreen returns escape sequence", () => expect(clearScreen()).toBe("\x1b[2J\x1b[H"));

  it("clearLine returns escape sequence", () => expect(clearLine()).toBe("\x1b[2K\r"));

  it("cursorTo returns position sequence", () => expect(cursorTo(4, 2)).toBe("\x1b[3;5H"));

  it("cursorUp returns move sequence", () => expect(cursorUp(3)).toBe("\x1b[3A"));

  it("cursorUp defaults to 1", () => expect(cursorUp()).toBe("\x1b[1A"));

  it("cursorDown returns move sequence", () => expect(cursorDown(2)).toBe("\x1b[2B"));

  it("cursorRight returns move sequence", () => expect(cursorRight(5)).toBe("\x1b[5C"));

  it("cursorLeft returns move sequence", () => expect(cursorLeft(3)).toBe("\x1b[3D"));

  it("cursorHide returns hide sequence", () => expect(cursorHide()).toBe("\x1b[?25l"));

  it("cursorShow returns show sequence", () => expect(cursorShow()).toBe("\x1b[?25h"));

  it("cursorSave returns save sequence", () => expect(cursorSave()).toBe("\x1b[s"));

  it("cursorRestore returns restore sequence", () => expect(cursorRestore()).toBe("\x1b[u"));
});
