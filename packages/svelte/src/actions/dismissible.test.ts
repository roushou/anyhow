import { describe, it, expect, vi } from "vitest";
import { createDismissible } from "./dismissible.js";

describe("createDismissible", () => {
  function setup() {
    const container = document.createElement("div");
    const inner = document.createElement("span");
    container.appendChild(inner);
    document.body.appendChild(container);
    return { container, inner };
  }

  it("returns an action with a destroy method", () => {
    const { container } = setup();
    const action = createDismissible(container, { handler: () => {} });
    expect(action).toHaveProperty("destroy");
    action.destroy();
  });

  it("calls handler on Escape key", () => {
    const { container } = setup();
    const handler = vi.fn();
    const action = createDismissible(container, { handler });

    container.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    expect(handler).toHaveBeenCalledOnce();
    action.destroy();
  });

  it("does not call handler on non-Escape keys", () => {
    const { container } = setup();
    const handler = vi.fn();
    const action = createDismissible(container, { handler });

    container.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
    action.destroy();
  });

  it("respects escape: false", () => {
    const { container } = setup();
    const handler = vi.fn();
    const action = createDismissible(container, { handler, escape: false });

    container.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
    action.destroy();
  });

  it("calls handler when clicking outside", async () => {
    const { container } = setup();
    const handler = vi.fn();
    const action = createDismissible(container, { handler });

    const outside = document.createElement("div");
    document.body.appendChild(outside);
    outside.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));

    // handler is deferred via queueMicrotask
    await vi.waitFor(() => expect(handler).toHaveBeenCalledOnce());

    action.destroy();
  });

  it("respects outside: false", () => {
    const { container } = setup();
    const handler = vi.fn();
    const action = createDismissible(container, { handler, outside: false });

    const outside = document.createElement("div");
    document.body.appendChild(outside);
    outside.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));

    expect(handler).not.toHaveBeenCalled();
    action.destroy();
  });

  it("destroy removes all listeners", () => {
    const { container } = setup();
    const handler = vi.fn();
    const action = createDismissible(container, { handler });
    action.destroy();

    container.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
  });
});
