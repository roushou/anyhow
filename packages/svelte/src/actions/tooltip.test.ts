import { describe, it, expect, vi, afterEach } from "vitest";
import { createTooltip } from "./tooltip.svelte.js";

describe("createTooltip", () => {
  afterEach(() => {
    // Clean up any tooltips left in the body
    document.body.querySelectorAll('[role="tooltip"]').forEach((el) => el.remove());
  });

  it("returns visible and action", () => {
    const tooltip = createTooltip({ content: "hello" });
    expect(tooltip).toHaveProperty("visible");
    expect(tooltip).toHaveProperty("action");
  });

  it("action returns a destroy method", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);

    const tooltip = createTooltip({ content: "hello" });
    const result = tooltip.action(button);
    expect(result).toHaveProperty("destroy");
    result.destroy();
    button.remove();
  });

  it("creates a tooltip element in the body", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);

    const tooltip = createTooltip({ content: "hello" });
    tooltip.action(button);

    const tip = document.body.querySelector('[role="tooltip"]');
    expect(tip).not.toBeNull();
    expect(tip!.textContent).toBe("hello");

    // Cleanup
    tip!.remove();
    button.remove();
  });

  it("sets aria-describedby on the trigger", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);

    const tooltip = createTooltip({ content: "hello" });
    tooltip.action(button);

    const describedBy = button.getAttribute("aria-describedby");
    expect(describedBy).toMatch(/^anyhow-tooltip-/);

    const tip = document.body.querySelector('[role="tooltip"]');
    // Cleanup
    tip?.remove();
    button.remove();
  });

  it("shows tooltip on mouseenter after delay", async () => {
    vi.useFakeTimers();

    const button = document.createElement("button");
    document.body.appendChild(button);

    const tooltip = createTooltip({ content: "hello", delay: 100 });
    tooltip.action(button);

    expect(tooltip.visible).toBe(false);

    button.dispatchEvent(new MouseEvent("mouseenter"));
    expect(tooltip.visible).toBe(false); // not yet — delay

    vi.advanceTimersByTime(100);
    expect(tooltip.visible).toBe(true);

    // Cleanup
    button.dispatchEvent(new MouseEvent("mouseleave"));
    vi.useRealTimers();
    const tip = document.body.querySelector('[role="tooltip"]');
    tip?.remove();
    button.remove();
  });

  it("hides on mouseleave immediately", async () => {
    vi.useFakeTimers();

    const button = document.createElement("button");
    document.body.appendChild(button);

    const tooltip = createTooltip({ content: "hello", delay: 0 });
    tooltip.action(button);

    button.dispatchEvent(new MouseEvent("mouseenter"));
    vi.advanceTimersByTime(0);
    expect(tooltip.visible).toBe(true);

    button.dispatchEvent(new MouseEvent("mouseleave"));
    expect(tooltip.visible).toBe(false);

    vi.useRealTimers();
    const tip = document.body.querySelector('[role="tooltip"]');
    tip?.remove();
    button.remove();
  });

  it("destroy removes tooltip element and aria attribute", () => {
    const button = document.createElement("button");
    document.body.appendChild(button);

    const tooltip = createTooltip({ content: "hello" });
    const { destroy } = tooltip.action(button);

    destroy();

    const tip = document.body.querySelector('[role="tooltip"]');
    expect(tip).toBeNull();
    expect(button.hasAttribute("aria-describedby")).toBe(false);

    button.remove();
  });
});
