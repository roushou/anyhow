import { describe, it, expect, vi } from "vitest";
import { createKeydown } from "./keydown.js";

describe("createKeydown", () => {
  it("fires handler for matching shortcut", () => {
    const node = document.createElement("div");
    const handler = vi.fn();

    createKeydown(node, { Escape: handler });
    node.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("fires handler for combo with modifier", () => {
    const node = document.createElement("div");
    const handler = vi.fn();

    createKeydown(node, { "Control+s": handler });
    node.dispatchEvent(new KeyboardEvent("keydown", { key: "s", ctrlKey: true, bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not fire for non-matching key", () => {
    const node = document.createElement("div");
    const handler = vi.fn();

    createKeydown(node, { Escape: handler });
    node.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
  });
});
