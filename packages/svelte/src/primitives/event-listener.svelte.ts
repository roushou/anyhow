/**
 * Typed event listener with automatic `$effect`-backed cleanup.
 *
 * Attaches a listener to `target` inside a Svelte 5 `$effect`. When the
 * component is destroyed — or when `target` becomes `null`/`undefined` —
 * the listener is automatically removed. SSR-safe: no-op when `target` is
 * falsy (e.g. `window`/`document` are unavailable during SSR).
 *
 * For non-`$effect` contexts (e.g. inside Svelte actions), use the
 * lower-level {@link listen} helper instead.
 *
 * @typeParam E - The expected event type.
 * @param target - The `EventTarget` (e.g. `window`, `document`, an
 *   `HTMLElement`, a `MediaQueryList`) or `null`/`undefined` for SSR.
 * @param type - The event type string.
 * @param handler - The event handler.
 * @param opts - Optional `AddEventListenerOptions` or capture boolean.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createEventListener } from "@anyhow/svelte";
 *
 *   let key = $state("");
 *
 *   createEventListener(window, "keydown", (e) => {
 *     key = e.key;
 *   });
 * </script>
 *
 * <p>Last key pressed: {key}</p>
 * ```
 */
import { listen } from "../listen.js";

export function createEventListener<E extends Event>(
  target: EventTarget | null | undefined,
  type: string,
  handler: (e: E) => void,
  opts?: boolean | AddEventListenerOptions,
): void {
  $effect(() => {
    if (!target) return;
    return listen(target, type, handler, opts).destroy;
  });
}
