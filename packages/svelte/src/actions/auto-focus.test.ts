import { describe, it, expect } from "vitest";
import { createAutoFocus } from "./auto-focus.js";

describe("createAutoFocus", () => {
  it("focuses element on mount", () => {
    const input = document.createElement("input");
    document.body.appendChild(input);

    createAutoFocus(input);
    expect(document.activeElement).toBe(input);

    document.body.removeChild(input);
  });
});
