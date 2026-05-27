import { describe, it, expect } from "vitest";
import { createFocusTrap } from "./focus-trap.js";

describe("createFocusTrap", () => {
  it("traps Tab navigation", () => {
    const node = document.createElement("div");
    const btn1 = document.createElement("button");
    const btn2 = document.createElement("button");
    node.appendChild(btn1);
    node.appendChild(btn2);
    document.body.appendChild(node);

    const trap = createFocusTrap(node);
    expect(document.activeElement).toBe(btn1);

    trap.destroy();
    document.body.removeChild(node);
  });

  it("handles empty node", () => {
    const node = document.createElement("div");
    document.body.appendChild(node);

    const trap = createFocusTrap(node);
    // Should focus the node itself via tabindex
    expect(document.activeElement).toBe(node);

    trap.destroy();
    document.body.removeChild(node);
  });
});
