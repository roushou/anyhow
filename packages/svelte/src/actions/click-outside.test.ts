import { describe, it, expect } from "vitest";
import { createClickOutside } from "./click-outside.js";

describe("createClickOutside", () => {
  function setup() {
    const container = document.createElement("div");
    const inner = document.createElement("span");
    container.appendChild(inner);
    document.body.appendChild(container);
    return { container, inner };
  }

  it("returns an action with a destroy method", () => {
    const { container } = setup();
    const action = createClickOutside(container, () => {});
    expect(action).toHaveProperty("destroy");
    action.destroy();
  });

  it("calls handler when clicking outside", () => {
    const { container } = setup();
    const calls: MouseEvent[] = [];
    const action = createClickOutside(container, (e) => calls.push(e));

    const outside = document.createElement("div");
    document.body.appendChild(outside);
    outside.click();

    expect(calls.length).toBe(1);
    action.destroy();
  });

  it("does not call handler when clicking inside", () => {
    const { container, inner } = setup();
    const calls: MouseEvent[] = [];
    const action = createClickOutside(container, (e) => calls.push(e));

    inner.click();

    expect(calls.length).toBe(0);
    action.destroy();
  });

  it("destroy removes the listener", () => {
    const { container } = setup();
    const calls: MouseEvent[] = [];
    const action = createClickOutside(container, (e) => calls.push(e));

    action.destroy();

    const outside = document.createElement("div");
    document.body.appendChild(outside);
    outside.click();

    expect(calls.length).toBe(0);
  });
});
