/**
 * Returns a promise that resolves after `ms` milliseconds.
 *
 * @param ms - Milliseconds to wait.
 * @returns A promise that resolves after the delay.
 *
 * @example
 * ```ts
 * await sleep(1000); // waits 1 second
 * ```
 */
export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Debounce ──

/** Options for {@link debounce}. */
export interface DebounceOpts {
  /** Fire immediately on the first call, then debounce subsequent calls. */
  leading?: boolean;
  /** Fire one final call after the debounce window ends with the most recent args. */
  trailing?: boolean;
}

/**
 * A debounced function that can also be flushed or cancelled.
 *
 * Returned by {@link debounce}.
 */
export interface DebouncedFn<T extends (...a: any[]) => void> {
  (...args: Parameters<T>): void;
  /** Immediately invokes the pending call (if any) and cancels the timer. */
  flush(): void;
  /** Cancels the pending call without invoking it. */
  cancel(): void;
}

/**
 * Creates a debounced version of `fn` that delays invocation until `ms`
 * milliseconds have elapsed since the last call.
 *
 * @typeParam T - The function type.
 * @param fn - The function to debounce.
 * @param ms - The debounce window in milliseconds.
 * @param opts - See {@link DebounceOpts}.
 * @returns A {@link DebouncedFn}.
 *
 * @example
 * ```ts
 * const save = debounce(flushToDisk, 300);
 * input.addEventListener("input", () => save());
 *
 * // Force the pending call immediately (e.g. on form submit)
 * save.flush();
 *
 * // Cancel the pending call
 * save.cancel();
 * ```
 */
export function debounce<T extends (...a: any[]) => void>(
  fn: T,
  ms: number,
  opts?: DebounceOpts,
): DebouncedFn<T> {
  const leading = opts?.leading ?? false;
  const trailing = opts?.trailing ?? true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let hasLed = false;
  let lastArgs: Parameters<T> | undefined;
  let pending = false;

  const invoke = () => {
    if (!lastArgs) return;
    pending = false;
    fn(...lastArgs);
    lastArgs = undefined;
  };

  const debounced = (...args: Parameters<T>) => {
    if (leading && !hasLed) {
      hasLed = true;
      fn(...args);
    }
    if (trailing) {
      lastArgs = args;
      pending = true;
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      hasLed = false;
      if (trailing) invoke();
    }, ms);
  };

  debounced.flush = () => {
    if (pending) {
      clearTimeout(timer);
      hasLed = false;
      invoke();
    }
  };

  debounced.cancel = () => {
    clearTimeout(timer);
    hasLed = false;
    lastArgs = undefined;
    pending = false;
  };

  return debounced;
}

// ── Throttle ──

/** Options for {@link throttle}. */
export interface ThrottleOpts {
  /** Fire immediately on the first call in each window. */
  leading?: boolean;
  /** Fire one final call after the throttle window ends with the most recent args. */
  trailing?: boolean;
}

/**
 * A throttled function that can also be flushed or cancelled.
 *
 * Returned by {@link throttle}.
 */
export interface ThrottledFn<T extends (...a: any[]) => void> {
  (...args: Parameters<T>): void;
  /** Immediately invokes the pending trailing call (if any). */
  flush(): void;
  /** Cancels the pending trailing call without invoking it. */
  cancel(): void;
}

/**
 * Creates a throttled version of `fn` that fires at most once every `ms`
 * milliseconds.
 *
 * @typeParam T - The function type.
 * @param fn - The function to throttle.
 * @param ms - The minimum interval between invocations in milliseconds.
 * @param opts - See {@link ThrottleOpts}.
 * @returns A {@link ThrottledFn}.
 *
 * @example
 * ```ts
 * const onScroll = throttle(() => updatePosition(), 100);
 * window.addEventListener("scroll", onScroll);
 *
 * // Force the pending trailing call immediately
 * onScroll.flush();
 *
 * // Cancel the pending trailing call
 * onScroll.cancel();
 * ```
 */
export function throttle<T extends (...a: any[]) => void>(
  fn: T,
  ms: number,
  opts?: ThrottleOpts,
): ThrottledFn<T> {
  const leading = opts?.leading ?? true;
  const trailing = opts?.trailing ?? false;
  let last = 0;
  let trailingTimer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let pending = false;

  const invoke = () => {
    if (!lastArgs) return;
    pending = false;
    fn(...lastArgs);
    lastArgs = undefined;
  };

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - last >= ms) {
      last = now;
      if (leading) fn(...args);
    } else if (trailing) {
      lastArgs = args;
      pending = true;
      clearTimeout(trailingTimer);
      trailingTimer = setTimeout(
        () => {
          last = Date.now();
          invoke();
        },
        ms - (now - last),
      );
    }
  };

  throttled.flush = () => {
    if (pending) {
      clearTimeout(trailingTimer);
      last = Date.now();
      invoke();
    }
  };

  throttled.cancel = () => {
    clearTimeout(trailingTimer);
    lastArgs = undefined;
    pending = false;
  };

  return throttled;
}
