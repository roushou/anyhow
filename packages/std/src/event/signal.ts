/**
 * A lightweight pub/sub signal — a single-event channel that replaces ad-hoc
 * callback arrays.
 *
 * @typeParam T - The payload type emitted to subscribers.
 *
 * @example
 * ```ts
 * const onLogout = createSignal<{ userId: string }>();
 * const off = onLogout.subscribe(({ userId }) => cleanupSession(userId));
 * await onLogout.emit({ userId: "abc" });
 * off(); // unsubscribe
 * ```
 */
export interface Signal<T> {
  /**
   * Registers a subscriber. Returns an unsubscribe function.
   *
   * @param fn - The callback (can be async).
   * @param opts.signal - An `AbortSignal` that removes the subscriber when aborted.
   * @returns A function that removes the subscriber.
   */
  subscribe(fn: (payload: T) => void | Promise<void>, opts?: { signal?: AbortSignal }): () => void;

  /**
   * Emits the payload to all subscribers, awaiting async callbacks in
   * registration order.
   *
   * @param payload - The data sent to every subscriber.
   */
  emit(payload: T): Promise<void>;
}

/**
 * Creates a lightweight pub/sub {@link Signal}.
 *
 * Use this when you need a single typed event channel without the overhead of
 * a full {@link EventEmitter}.
 *
 * @typeParam T - The payload type (defaults to `void`).
 * @returns A new `Signal`.
 *
 * @example
 * ```ts
 * const onReady = createSignal<void>();
 * onReady.subscribe(() => console.log("ready"));
 * await onReady.emit(undefined);
 *
 * // AbortSignal integration
 * const ctrl = new AbortController();
 * onReady.subscribe(handler, { signal: ctrl.signal });
 * ctrl.abort(); // subscriber removed
 * ```
 */
export function createSignal<T = void>(): Signal<T> {
  const listeners = new Set<(payload: T) => void | Promise<void>>();

  return {
    subscribe(
      fn: (payload: T) => void | Promise<void>,
      opts?: { signal?: AbortSignal },
    ): () => void {
      listeners.add(fn);

      const unsubscribe = () => {
        listeners.delete(fn);
      };

      if (opts?.signal) {
        if (opts.signal.aborted) {
          queueMicrotask(unsubscribe);
        } else {
          opts.signal.addEventListener("abort", unsubscribe, { once: true });
        }
      }

      return unsubscribe;
    },

    async emit(payload: T): Promise<void> {
      // Snapshot to handle subscribers that modify the set during emission
      const fns = [...listeners];
      for (const fn of fns) {
        await fn(payload);
      }
    },
  };
}
