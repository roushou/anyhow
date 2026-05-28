/**
 * Reactive text selection backed by Svelte 5 `$state`.
 *
 * Tracks `window.getSelection()` and exposes the current selected text and
 * its bounding rectangles. Updates on `selectionchange`. SSR-safe.
 *
 * @returns `{ text, ranges, rects }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createTextSelection } from "@anyhow/svelte";
 *   const sel = createTextSelection();
 * </script>
 *
 * {#if sel.text}
 *   <div class="toolbar">Selected: "{sel.text}"</div>
 * {/if}
 * ```
 */
import { listen } from "../listen.js";

export function createTextSelection() {
  let text = $state("");
  let ranges = $state<Range[]>([]);
  let rects = $state<DOMRect[]>([]);

  $effect(() => {
    if (typeof document === "undefined") return;

    function update() {
      const sel = window.getSelection();
      text = sel?.toString() ?? "";

      if (sel && sel.rangeCount > 0) {
        ranges = [];
        rects = [];
        for (let i = 0; i < sel.rangeCount; i++) {
          const range = sel.getRangeAt(i);
          ranges.push(range.cloneRange());
          const rangeRects = Array.from(range.getClientRects());
          rects.push(...rangeRects);
        }
      } else {
        ranges = [];
        rects = [];
      }
    }

    return listen(document, "selectionchange", update).destroy;
  });

  return {
    /** The current selected text, or `""` if nothing is selected. */
    get text() {
      return text;
    },
    /** The selected `Range` objects (cloned for safety). */
    get ranges() {
      return ranges;
    },
    /** The bounding rectangles for the current selection. */
    get rects() {
      return rects;
    },
  };
}
