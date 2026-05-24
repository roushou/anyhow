/**
 * A listener function that may be synchronous or return a `Promise`.
 *
 * @typeParam T - The payload type for the event.
 */
type ListenerFn<T> = (payload: T) => void | Promise<void>;

interface ListenerEntry<T> {
  fn: ListenerFn<T>;
  once: boolean;
}

type EventMap = Record<string, any>;

/**
 * A fully typed event emitter.
 *
 * Unlike Node's `EventEmitter`, this class enforces payload types per event
 * name and supports `AbortSignal`-based listener cleanup.
 *
 * @typeParam T - A map of event names to their payload types.
 *
 * @example
 * ```ts
 * type AppEvents = {
 *   request: { method: string; url: string };
 *   error: Error;
 *   close: void;
 * };
 *
 * const emitter = new EventEmitter<AppEvents>();
 * emitter.on("request", ({ method, url }) => console.log(method, url));
 * emitter.emit("request", { method: "GET", url: "/api" });
 * ```
 */
export class EventEmitter<T extends EventMap> {
  #listeners = new Map<keyof T, Set<ListenerEntry<any>>>();

  /**
   * Registers a listener for an event. Returns an unsubscribe function.
   *
   * Pass `{ signal }` to automatically remove the listener when the
   * `AbortSignal` fires.
   *
   * @param event - The event name.
   * @param listener - The callback (can be async).
   * @param opts.signal - An `AbortSignal` that removes the listener when aborted.
   * @returns A function that removes the listener.
   *
   * @example
   * ```ts
   * const off = emitter.on("request", handler);
   * off(); // unsubscribe
   *
   * // AbortSignal integration
   * const ctrl = new AbortController();
   * emitter.on("request", handler, { signal: ctrl.signal });
   * ctrl.abort(); // handler is removed
   * ```
   */
  on<K extends keyof T>(
    event: K,
    listener: (payload: T[K]) => void | Promise<void>,
    opts?: { signal?: AbortSignal },
  ): () => void {
    const entry: ListenerEntry<T[K]> = { fn: listener, once: false };
    return this.#register(event, entry, opts);
  }

  /**
   * Registers a one-shot listener that is automatically removed after its
   * first invocation.
   *
   * @param event - The event name.
   * @param listener - The callback (can be async).
   * @param opts.signal - An `AbortSignal` that removes the listener when aborted.
   * @returns A function that removes the listener early.
   *
   * @example
   * ```ts
   * emitter.once("close", () => console.log("shutting down"));
   * ```
   */
  once<K extends keyof T>(
    event: K,
    listener: (payload: T[K]) => void | Promise<void>,
    opts?: { signal?: AbortSignal },
  ): () => void {
    const entry: ListenerEntry<T[K]> = { fn: listener, once: true };
    return this.#register(event, entry, opts);
  }

  /**
   * Removes a previously registered listener.
   *
   * @param event - The event name.
   * @param listener - The same function reference passed to {@link on} or {@link once}.
   *
   * @example
   * ```ts
   * function handler(req: { method: string }) { ... }
   * emitter.on("request", handler);
   * emitter.off("request", handler);
   * ```
   */
  off<K extends keyof T>(event: K, listener: (payload: T[K]) => void | Promise<void>): void {
    const set = this.#listeners.get(event);
    if (!set) return;
    for (const entry of set) {
      if (entry.fn === listener) {
        set.delete(entry);
        break;
      }
    }
    if (set.size === 0) this.#listeners.delete(event);
  }

  /**
   * Emits an event to all registered listeners.
   *
   * Async listeners are awaited **in registration order**.  If an `"error"`
   * event is emitted and there are no listeners for it, the payload is thrown
   * (matching the Node.js convention).
   *
   * @param event - The event name.
   * @param payload - The event payload.
   *
   * @example
   * ```ts
   * await emitter.emit("request", { method: "GET", url: "/" });
   * emitter.emit("close", undefined); // void event
   * ```
   */
  async emit<K extends keyof T>(event: K, payload: T[K]): Promise<void> {
    const set = this.#listeners.get(event);
    if (!set || set.size === 0) {
      if (event === "error" && payload !== undefined && payload !== null) {
        throw payload;
      }
      return;
    }

    // Snapshot to safely handle listeners that modify the set during emission
    const entries = [...set];

    for (const entry of entries) {
      if (entry.once) set.delete(entry);
      await entry.fn(payload);
    }

    if (set.size === 0) this.#listeners.delete(event);
  }

  /**
   * Returns the number of listeners registered for an event.
   *
   * @param event - The event name.
   * @returns The listener count.
   */
  listenerCount<K extends keyof T>(event: K): number {
    return this.#listeners.get(event)?.size ?? 0;
  }

  // ── Internals ──

  #register<K extends keyof T>(
    event: K,
    entry: ListenerEntry<T[K]>,
    opts?: { signal?: AbortSignal },
  ): () => void {
    let set = this.#listeners.get(event);
    if (!set) {
      set = new Set();
      this.#listeners.set(event, set);
    }
    set.add(entry);

    const unsubscribe = () => this.off(event, entry.fn as (payload: T[K]) => void | Promise<void>);

    if (opts?.signal) {
      if (opts.signal.aborted) {
        // Edge case: signal already aborted — remove immediately without
        // calling the listener (it was never "registered" from the caller's
        // perspective).
        queueMicrotask(unsubscribe);
      } else {
        opts.signal.addEventListener("abort", unsubscribe, { once: true });
      }
    }

    return unsubscribe;
  }
}
