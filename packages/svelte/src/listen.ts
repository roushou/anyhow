/**
 * Attaches an event listener to a target and returns a cleanup object.
 *
 * Internal utility used by both `createEventListener` (Svelte 5 `$effect`
 * wrapper) and actions (manual lifecycle). Unlike `createEventListener`,
 * this does **not** use `$effect` — the caller is responsible for calling
 * `destroy()` at the appropriate time.
 *
 * @typeParam E - The expected event type.
 * @param target - The `EventTarget` to listen on.
 * @param type - The event type string.
 * @param handler - The event handler.
 * @param opts - Optional `AddEventListenerOptions` or capture boolean.
 * @returns An object with a `destroy` method that removes the listener.
 *
 * @internal
 */
export function listen<E extends Event>(
  target: EventTarget,
  type: string,
  handler: (e: E) => void,
  opts?: boolean | AddEventListenerOptions,
): { destroy(): void } {
  target.addEventListener(type, handler as EventListener, opts);
  return {
    destroy() {
      target.removeEventListener(type, handler as EventListener, opts);
    },
  };
}
