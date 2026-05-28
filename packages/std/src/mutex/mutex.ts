import { none, some, type Option } from "../option/option.js";

// ── Mutex ──

/**
 * A guard returned by {@link Mutex.lock} that provides exclusive access
 * to the mutex's value. Call {@link MutexGuard.unlock} to release the lock
 * early. The lock is not released automatically — callers must `unlock()`.
 *
 * @typeParam T - The type of the guarded value.
 */
export interface MutexGuard<T> {
  /** The guarded value. Mutate freely while the guard is held. */
  value: T;
  /** Releases the lock. Idempotent — subsequent calls are no-ops. */
  unlock(): void;
}

/**
 * An async mutual exclusion primitive that guards access to a value.
 *
 * Only one caller can hold the lock at a time. Callers queue in FIFO order.
 * The type system prevents accessing the guarded value without acquiring
 * the lock first.
 *
 * @typeParam T - The type of the guarded value.
 *
 * @example
 * ```ts
 * const counter = new Mutex(0);
 *
 * await Promise.all(
 *   Array.from({ length: 100 }, async () => {
 *     const guard = await counter.lock();
 *     guard.value += 1;
 *     guard.unlock();
 *   })
 * );
 *
 * const final = await counter.lock();
 * console.log(final.value); // 100
 * final.unlock();
 * ```
 */
export class Mutex<T> {
  #value: T;
  #locked = false;
  #queue: ((guard: MutexGuard<T>) => void)[] = [];

  /**
   * Creates a mutex wrapping `value`.
   *
   * @param value - The initial value to guard.
   */
  constructor(value: T) {
    this.#value = value;
  }

  /**
   * Acquires the lock and returns a guard with exclusive access to
   * the value.  Call `guard.unlock()` when done.
   *
   * @returns A promise resolving to a {@link MutexGuard}.
   *
   * @example
   * ```ts
   * const guard = await mutex.lock();
   * guard.value.push(item);
   * guard.unlock();
   * ```
   */
  lock(): Promise<MutexGuard<T>> {
    if (!this.#locked) {
      this.#locked = true;
      return Promise.resolve(this.#makeGuard());
    }
    return new Promise<MutexGuard<T>>((resolve) => {
      this.#queue.push(resolve);
    });
  }

  /**
   * Attempts to acquire the lock without waiting.
   *
   * @returns `some(guard)` if the lock was acquired, or `none` if it is
   *          already held.
   *
   * @example
   * ```ts
   * const guard = mutex.tryLock();
   * if (guard.isSome()) {
   *   guard.unwrap().value += 1;
   *   guard.unwrap().unlock();
   * }
   * ```
   */
  tryLock(): Option<MutexGuard<T>> {
    if (this.#locked) return none();
    this.#locked = true;
    return some(this.#makeGuard());
  }

  /** Whether the lock is currently held. */
  get locked(): boolean {
    return this.#locked;
  }

  #makeGuard(): MutexGuard<T> {
    let released = false;
    const guard = {} as MutexGuard<T>;
    // Use defineProperty so arrow functions capture the class's `this`,
    // avoiding a `const self = this` alias.
    Object.defineProperty(guard, "value", {
      get: () => this.#value,
      set: (v: T) => {
        this.#value = v;
      },
      enumerable: true,
      configurable: true,
    });
    guard.unlock = () => {
      if (released) return;
      released = true;
      const next = this.#queue.shift();
      if (next) {
        next(this.#makeGuard());
      } else {
        this.#locked = false;
      }
    };
    return guard;
  }
}

/**
 * Creates a {@link Mutex} guarding the given value.
 *
 * @typeParam T - The type of the guarded value.
 * @param value - The initial value to guard.
 * @returns A new `Mutex<T>`.
 *
 * @example
 * ```ts
 * const counter = mutex(0);
 * const guard = await counter.lock();
 * guard.value++;
 * guard.unlock();
 * ```
 */
export function mutex<T>(value: T): Mutex<T> {
  return new Mutex(value);
}

// ── RwLock ──

/**
 * A read guard returned by {@link RwLock.read}. Multiple readers can
 * hold read guards concurrently. The value is read-only through the guard.
 *
 * @typeParam T - The type of the guarded value.
 */
export interface RwLockReadGuard<T> {
  /** The guarded value (immutable view). */
  readonly value: T;
  /** Releases the read lock. Idempotent. */
  unlock(): void;
}

/**
 * A write guard returned by {@link RwLock.write}. Only one writer can
 * hold the lock, and no readers can be active while a writer holds it.
 *
 * @typeParam T - The type of the guarded value.
 */
export interface RwLockWriteGuard<T> {
  /** The guarded value. Mutate freely while the guard is held. */
  value: T;
  /** Releases the write lock. Idempotent. */
  unlock(): void;
}

type RwWaiter<T> = (guard: RwLockReadGuard<T> | RwLockWriteGuard<T>) => void;

/**
 * An async readers-writer lock that guards access to a value.
 *
 * Multiple readers can access the value concurrently, but writers
 * require exclusive access. Writers are prioritised over readers
 * to prevent writer starvation.
 *
 * @typeParam T - The type of the guarded value.
 *
 * @example
 * ```ts
 * const cache = new RwLock(new Map<string, User>());
 *
 * // Many readers can read concurrently
 * const reader = await cache.read();
 * const user = reader.value.get("alice");
 * reader.unlock();
 *
 * // Only one writer at a time, and no concurrent readers
 * const writer = await cache.write();
 * writer.value.set("alice", newUser);
 * writer.unlock();
 * ```
 */
export class RwLock<T> {
  #value: T;
  #readers = 0;
  #writer = false;
  #queue: { kind: "read" | "write"; resolve: RwWaiter<T> }[] = [];

  /**
   * Creates a read-write lock wrapping `value`.
   *
   * @param value - The initial value to guard.
   */
  constructor(value: T) {
    this.#value = value;
  }

  /**
   * Acquires a read lock. Multiple readers can hold read locks
   * concurrently as long as no writer is active.
   *
   * @returns A promise resolving to a read guard.
   */
  read(): Promise<RwLockReadGuard<T>> {
    if (!this.#writer && this.#queue.length === 0) {
      this.#readers++;
      return Promise.resolve(this.#makeReadGuard());
    }
    return new Promise<RwLockReadGuard<T>>((resolve) => {
      this.#queue.push({ kind: "read", resolve: resolve as RwWaiter<T> });
    });
  }

  /**
   * Acquires a write lock. Only one writer can hold the lock,
   * and no readers can be active.
   *
   * @returns A promise resolving to a write guard.
   */
  write(): Promise<RwLockWriteGuard<T>> {
    if (!this.#writer && this.#readers === 0 && this.#queue.length === 0) {
      this.#writer = true;
      return Promise.resolve(this.#makeWriteGuard());
    }
    return new Promise<RwLockWriteGuard<T>>((resolve) => {
      this.#queue.push({ kind: "write", resolve: resolve as RwWaiter<T> });
    });
  }

  /**
   * Attempts to acquire a read lock without waiting.
   *
   * @returns `some(guard)` if acquired, `none` if not immediately available.
   */
  tryRead(): Option<RwLockReadGuard<T>> {
    if (this.#writer || this.#queue.length > 0) return none();
    this.#readers++;
    return some(this.#makeReadGuard());
  }

  /**
   * Attempts to acquire a write lock without waiting.
   *
   * @returns `some(guard)` if acquired, `none` if not immediately available.
   */
  tryWrite(): Option<RwLockWriteGuard<T>> {
    if (this.#writer || this.#readers > 0 || this.#queue.length > 0) return none();
    this.#writer = true;
    return some(this.#makeWriteGuard());
  }

  /** Whether the write lock (or any read locks via tryRead) is held. */
  get locked(): boolean {
    return this.#writer || this.#readers > 0;
  }

  #makeReadGuard(): RwLockReadGuard<T> {
    let released = false;
    const guard = {} as RwLockReadGuard<T>;
    Object.defineProperty(guard, "value", {
      get: () => this.#value,
      enumerable: true,
      configurable: true,
    });
    guard.unlock = () => {
      if (released) return;
      released = true;
      this.#readers--;
      this.#wake();
    };
    return guard;
  }

  #makeWriteGuard(): RwLockWriteGuard<T> {
    let released = false;
    const guard = {} as RwLockWriteGuard<T>;
    Object.defineProperty(guard, "value", {
      get: () => this.#value,
      set: (v: T) => {
        this.#value = v;
      },
      enumerable: true,
      configurable: true,
    });
    guard.unlock = () => {
      if (released) return;
      released = true;
      this.#writer = false;
      this.#wake();
    };
    return guard;
  }

  #wake(): void {
    // Process queued waiters. Prioritise writers to prevent starvation.
    while (this.#queue.length > 0) {
      const next = this.#queue[0]!;

      if (next.kind === "write") {
        if (this.#readers > 0 || this.#writer) break;
        this.#queue.shift()!;
        this.#writer = true;
        next.resolve(this.#makeWriteGuard());
        break;
      }

      // Read: drain all contiguous readers (since they can run concurrently)
      if (next.kind === "read") {
        if (this.#writer) break;
        const batch: { kind: "read" | "write"; resolve: RwWaiter<T> }[] = [];
        while (this.#queue.length > 0 && this.#queue[0]!.kind === "read") {
          batch.push(this.#queue.shift()!);
        }
        this.#readers += batch.length;
        for (const w of batch) {
          w.resolve(this.#makeReadGuard());
        }
        // If a writer is next in the queue, stop (don't let more readers in)
        if (this.#queue.length > 0 && this.#queue[0]!.kind === "write") break;
        continue;
      }
    }
  }
}

/**
 * Creates an {@link RwLock} guarding the given value.
 *
 * @typeParam T - The type of the guarded value.
 * @param value - The initial value to guard.
 * @returns A new `RwLock<T>`.
 *
 * @example
 * ```ts
 * const cache = rwlock(new Map<string, User>());
 * const reader = await cache.read();
 * const user = reader.value.get("alice");
 * reader.unlock();
 * ```
 */
export function rwlock<T>(value: T): RwLock<T> {
  return new RwLock(value);
}
