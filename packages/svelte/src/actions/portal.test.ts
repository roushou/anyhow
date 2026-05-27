import { describe, it, expect } from "vitest";
import { createPortal } from "./portal.js";

describe("createPortal", () => {
  it("moves element to body", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const child = document.createElement("div");
    container.appendChild(child);

    const portal = createPortal();
    portal.action(child);

    expect(child.parentNode).toBe(document.body);

    document.body.removeChild(child);
    document.body.removeChild(container);
  });
});
