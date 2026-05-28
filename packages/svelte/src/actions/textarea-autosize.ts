/**
 * Svelte action that auto-resizes a `<textarea>` to fit its content.
 *
 * Sets `overflow: hidden` and `resize: none` so the element grows
 * vertically as the user types. Optionally clamp to `minHeight` /
 * `maxHeight` in pixels. Uses `scrollHeight` for measurement and
 * re-sizes on `input`, window resize, and form reset events.
 *
 * @param node - The `<textarea>` element.
 * @param opts.minHeight - Minimum height in pixels (default: `0`).
 * @param opts.maxHeight - Maximum height in pixels (default: no limit).
 * @returns An action object with a `destroy` method for cleanup.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createTextareaAutosize } from "@anyhow/svelte/actions";
 * </script>
 *
 * <textarea
 *   use:createTextareaAutosize={{ maxHeight: 300 }}
 *   bind:value
 * ></textarea>
 * ```
 */
import { listen } from "../listen.js";

export function createTextareaAutosize(
  node: HTMLTextAreaElement,
  opts?: { minHeight?: number; maxHeight?: number },
): { destroy(): void } {
  const minHeight = opts?.minHeight ?? 0;
  const maxHeight = opts?.maxHeight;

  // Store original styles to restore on destroy
  const originalOverflow = node.style.overflow;
  const originalResize = node.style.resize;
  const originalHeight = node.style.height;

  node.style.overflow = "hidden";
  node.style.resize = "none";

  function resize() {
    // Reset height so scrollHeight measures the true content height
    node.style.height = "0px";
    const scroll = node.scrollHeight;
    let h = Math.max(scroll, minHeight);
    if (maxHeight !== undefined) h = Math.min(h, maxHeight);
    node.style.height = `${h}px`;

    // If maxHeight is reached, allow scrolling
    node.style.overflowY = maxHeight !== undefined && scroll > maxHeight ? "auto" : "hidden";
  }

  // Initial resize
  resize();

  const listeners = [listen(node, "input", resize), listen(window, "resize", resize)];

  // Re-measure after form resets
  const form = node.closest("form");
  if (form) listeners.push(listen(form, "reset", resize));

  return {
    destroy() {
      for (const l of listeners) l.destroy();

      // Restore original styles
      node.style.overflow = originalOverflow;
      node.style.resize = originalResize;
      node.style.height = originalHeight;
      node.style.overflowY = "";
    },
  };
}
