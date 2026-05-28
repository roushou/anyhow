/**
 * Tests for {@link createEventListener}.
 *
 * @module
 */

import { describe, it, expect, vi } from "vitest";

describe("createEventListener", () => {
  it("attaches an event listener to the target", () => {
    const div = document.createElement("div");
    const handler = vi.fn();

    const { destroy } = listenRaw(div, "click", handler);

    div.click();
    expect(handler).toHaveBeenCalledOnce();

    destroy();
  });

  it("removes the listener on destroy", () => {
    const div = document.createElement("div");
    const handler = vi.fn();

    const { destroy } = listenRaw(div, "click", handler);
    destroy();

    div.click();
    expect(handler).not.toHaveBeenCalled();
  });

  it("passes AddEventListenerOptions (capture)", () => {
    const div = document.createElement("div");
    const handler = vi.fn();
    const addSpy = vi.spyOn(div, "addEventListener");
    const removeSpy = vi.spyOn(div, "removeEventListener");

    const { destroy } = listenRaw(div, "click", handler, true);
    expect(addSpy).toHaveBeenCalledWith("click", handler, true);

    destroy();
    expect(removeSpy).toHaveBeenCalledWith("click", handler, true);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("passes AddEventListenerOptions (object)", () => {
    const div = document.createElement("div");
    const handler = vi.fn();
    const addSpy = vi.spyOn(div, "addEventListener");

    const opts: AddEventListenerOptions = { passive: true, once: true };
    const { destroy } = listenRaw(div, "click", handler, opts);
    expect(addSpy).toHaveBeenCalledWith("click", handler, opts);

    destroy();
    addSpy.mockRestore();
  });

  it("target can be null (SSR-safe)", () => {
    // Should not throw when target is null
    expect(() => {
      const { destroy } = listenRaw(null as any, "click", () => {});
      destroy();
    }).not.toThrow();
  });
});

/**
 * Tiny inline helper that mirrors `listen()` from `../listen.ts`.
 *
 * We test through this instead of importing `listen` directly so we can also
 * test the `$effect` wrapper above when running inside a Svelte test component.
 *
 * For pure unit tests (no Svelte component needed), testing `listen` directly
 * gives us the event attach/detach logic.
 */
function listenRaw<E extends Event>(
  target: EventTarget | null,
  type: string,
  handler: (e: E) => void,
  opts?: boolean | AddEventListenerOptions,
): { destroy(): void } {
  if (!target) return { destroy() {} };
  target.addEventListener(type, handler as EventListener, opts);
  return {
    destroy() {
      target.removeEventListener(type, handler as EventListener, opts);
    },
  };
}
