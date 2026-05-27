import { describe, it, expect, vi } from "vitest";
import { createSwipe } from "./swipe.js";

describe("createSwipe", () => {
  it("detects swipe left", () => {
    const node = document.createElement("div");
    const onSwipe = vi.fn();

    createSwipe(node, { threshold: 30, onSwipe });

    // Simulate touch start
    node.dispatchEvent(
      new TouchEvent("touchstart", {
        touches: [{ clientX: 200, clientY: 100, identifier: 0 } as unknown as Touch],
      }),
    );

    // Simulate touch end (swipe left)
    node.dispatchEvent(
      new TouchEvent("touchend", {
        changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 } as unknown as Touch],
      }),
    );

    expect(onSwipe).toHaveBeenCalledTimes(1);
    expect(onSwipe).toHaveBeenCalledWith(expect.objectContaining({ direction: "left" }));
  });

  it("ignores touches below threshold", () => {
    const node = document.createElement("div");
    const onSwipe = vi.fn();

    createSwipe(node, { threshold: 50, onSwipe });

    node.dispatchEvent(
      new TouchEvent("touchstart", {
        touches: [{ clientX: 100, clientY: 100, identifier: 0 } as unknown as Touch],
      }),
    );

    node.dispatchEvent(
      new TouchEvent("touchend", {
        changedTouches: [{ clientX: 110, clientY: 100, identifier: 0 } as unknown as Touch],
      }),
    );

    expect(onSwipe).not.toHaveBeenCalled();
  });
});
