import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createLongPress } from "./long-press.js";

describe("createLongPress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a destroy method", () => {
    const el = document.createElement("div");
    const action = createLongPress(el, { duration: 500, handler: () => {} });
    expect(action).toHaveProperty("destroy");
    action.destroy();
  });

  it("fires handler after duration", () => {
    const el = document.createElement("div");
    const handler = vi.fn();
    createLongPress(el, { duration: 500, handler });

    el.dispatchEvent(new PointerEvent("pointerdown"));
    vi.advanceTimersByTime(499);
    expect(handler).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("cancels on pointerup before duration", () => {
    const el = document.createElement("div");
    const handler = vi.fn();
    createLongPress(el, { duration: 500, handler });

    el.dispatchEvent(new PointerEvent("pointerdown"));
    vi.advanceTimersByTime(200);
    el.dispatchEvent(new PointerEvent("pointerup"));

    vi.advanceTimersByTime(400);
    expect(handler).not.toHaveBeenCalled();
  });
});
