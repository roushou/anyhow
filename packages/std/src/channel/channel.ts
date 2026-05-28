import { none, some, type Option } from "../option/option.js";

// ── Types ──

/**
 * A CSP-style async channel for message-passing between concurrent tasks.
 *
 * Supports buffered (capacity > 0) and unbuffered (capacity = 0) channels.
 * Multiple producers and consumers are safe — sends queue when the channel
 * is full and receives queue when it is empty.
 *
 * @typeParam T - The type of values sent through the channel.
 *
 * @example
 * ```ts
 * const ch = channel<number>({ capacity: 5 });
 * await ch.send(42);
 * const val = await ch.recv(); // some(42)
 * ch.close();
 * ```
 */
export interface Channel<T> {
  /**
   * Sends a value into the channel. If the channel is full (buffered) or
   * has no waiting receiver (unbuffered), the returned promise only resolves
   * once a slot is available.  Rejects if the channel is closed.
   *
   * @param value - The value to send.
   * @returns A promise that resolves when the value is accepted.
   */
  send(value: T): Promise<void>;

  /**
   * Receives the next value from the channel. If the channel is empty and
   * still open, waits until a sender provides a value or the channel closes.
   *
   * @returns `some(value)` when a value is received, or `none` if the channel
   *          is closed and drained.
   */
  recv(): Promise<Option<T>>;

  /**
   * Attempts to send a value without waiting. Returns `true` if the value
   * was accepted immediately, `false` if the channel is full or closed.
   *
   * @param value - The value to send.
   * @returns Whether the value was accepted.
   */
  trySend(value: T): boolean;

  /**
   * Attempts to receive a value without waiting. Returns `some(value)` if
   * a value is available, or `none` if the channel is empty (still open)
   * or closed and drained.
   *
   * @returns The value, if immediately available.
   */
  tryRecv(): Option<T>;

  /**
   * Closes the channel.  Once closed, no more values can be sent.
   * Pending sends reject; pending receives resolve with `none`.
   * Values already buffered can still be received until drained.
   */
  close(): void;

  /** Whether the channel has been closed. */
  readonly closed: boolean;

  /** The maximum number of buffered items (0 = unbuffered). */
  readonly capacity: number;

  /** The number of items currently buffered. */
  readonly size: number;
}

/** Result from a {@link select} call — the branch index and its value. */
export interface SelectResult<T extends readonly Channel<any>[]> {
  index: number;
  value: Option<T[number] extends Channel<infer V> ? V : never>;
}

// ── Internals ──

interface Sender<T> {
  value: T;
  resolve(): void;
  reject(reason: unknown): void;
}

interface Receiver<T> {
  resolve(value: Option<T>): void;
  reject(reason: unknown): void;
}

class ChannelImpl<T> implements Channel<T> {
  readonly capacity: number;

  #buf: T[] = [];
  #closed = false;
  #senders: Sender<T>[] = [];
  #receivers: Receiver<T>[] = [];

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  get closed(): boolean {
    return this.#closed && this.#buf.length === 0;
  }

  get size(): number {
    return this.#buf.length;
  }

  send(value: T): Promise<void> {
    if (this.#closed) return Promise.reject(new Error("channel closed"));

    // Fast path: a receiver is already waiting — pair directly
    if (this.#receivers.length > 0) {
      const w = this.#receivers.shift()!;
      w.resolve(some(value));
      return Promise.resolve();
    }

    // Buffered path: room in the buffer
    if (this.#buf.length < this.capacity) {
      this.#buf.push(value);
      return Promise.resolve();
    }

    // Unbuffered or full: queue sender with the value
    return new Promise<void>((resolve, reject) => {
      this.#senders.push({ value, resolve, reject });
    });
  }

  recv(): Promise<Option<T>> {
    // Fast path: items in buffer
    if (this.#buf.length > 0) {
      const val = this.#buf.shift()!;
      this.#wakeSenderIntoBuffer();
      return Promise.resolve(some(val));
    }

    // A sender is waiting — take their value directly (bypass buffer)
    if (this.#senders.length > 0) {
      const s = this.#senders.shift()!;
      s.resolve();
      return Promise.resolve(some(s.value));
    }

    // Closed and drained
    if (this.#closed) return Promise.resolve(none());

    // Queue receiver
    return new Promise<Option<T>>((resolve, reject) => {
      this.#receivers.push({ resolve, reject });
    });
  }

  trySend(value: T): boolean {
    if (this.#closed) return false;

    // A receiver is waiting
    if (this.#receivers.length > 0) {
      const w = this.#receivers.shift()!;
      w.resolve(some(value));
      return true;
    }

    // Room in buffer
    if (this.#buf.length < this.capacity) {
      this.#buf.push(value);
      return true;
    }

    return false;
  }

  tryRecv(): Option<T> {
    if (this.#buf.length > 0) {
      const val = this.#buf.shift()!;
      this.#wakeSenderIntoBuffer();
      return some(val);
    }
    // Check waiting senders (unbuffered)
    if (this.#senders.length > 0) {
      const s = this.#senders.shift()!;
      s.resolve();
      return some(s.value);
    }
    return none();
  }

  close(): void {
    if (this.#closed) return;
    this.#closed = true;

    // Reject pending senders
    const err = new Error("channel closed");
    for (const s of this.#senders) s.reject(err);
    this.#senders.length = 0;

    // If buffer is empty, resolve pending receivers with none
    if (this.#buf.length === 0) {
      for (const r of this.#receivers) r.resolve(none());
      this.#receivers.length = 0;
    }
  }

  /** After popping from buffer, wake a queued sender by pushing their value in. */
  #wakeSenderIntoBuffer(): void {
    if (this.#senders.length === 0) return;
    const s = this.#senders.shift()!;
    this.#buf.push(s.value);
    s.resolve();
  }
}

// ── Public API ──

/**
 * Creates a new {@link Channel}.
 *
 * @param opts - Optional channel configuration.
 * @param opts.capacity - Buffer size (default `0` = unbuffered). Must be >= 0.
 * @returns A new channel instance.
 *
 * @example
 * ```ts
 * // Unbuffered — send blocks until a receiver is ready
 * const ch = channel<string>();
 *
 * // Buffered — up to 10 items can be sent without blocking
 * const buf = channel<number>({ capacity: 10 });
 * ```
 */
export function channel<T>(opts?: { capacity?: number }): Channel<T> {
  const cap = opts?.capacity ?? 0;
  if (!Number.isInteger(cap) || cap < 0) {
    throw new RangeError("capacity must be a non-negative integer");
  }
  return new ChannelImpl<T>(cap);
}

/**
 * Waits on multiple channels and resolves with the first one that receives
 * a value. Useful for racing between channels or combining a channel read
 * with a timeout.
 *
 * @typeParam T - Tuple of channels.
 * @param chs - Channels to race on.
 * @returns The winning branch index and value.
 *
 * @example
 * ```ts
 * const orders = channel<Order>({ capacity: 5 });
 * const cancels = channel<string>({ capacity: 5 });
 *
 * const result = await select(orders, cancels);
 * if (result.index === 0) processOrder(result.value.unwrap());
 * else cancelOrder(result.value.unwrap());
 * ```
 */
export async function select<T extends readonly Channel<any>[]>(
  ...chs: T
): Promise<SelectResult<T>> {
  // Build a promise for each channel's next recv
  const promises = chs.map((ch, i) => ch.recv().then((v) => ({ index: i, value: v })));
  return Promise.race(promises) as Promise<SelectResult<T>>;
}
