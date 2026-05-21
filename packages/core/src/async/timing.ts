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
}

/**
 * Creates a debounced version of `fn` that delays invocation until `ms`
 * milliseconds have elapsed since the last call.
 *
 * @typeParam T - The function type.
 * @param fn - The function to debounce.
 * @param ms - The debounce window in milliseconds.
 * @param opts - See {@link DebounceOpts}.
 * @returns A debounced version of `fn`.
 *
 * @example
 * ```ts
 * const onChange = debounce((query: string) => search(query), 300);
 * input.addEventListener("input", e => onChange(e.target.value));
 * ```
 */
export function debounce<T extends (...a: any[]) => void>(
  fn: T,
  ms: number,
  opts?: DebounceOpts,
): (...args: Parameters<T>) => void {
  const leading = opts?.leading ?? false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let hasLed = false;

  return (...args) => {
    if (leading && !hasLed) {
      hasLed = true;
      fn(...args);
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      hasLed = false;
      fn(...args);
    }, ms);
  };
}

// ── Throttle ──

/** Options for {@link throttle}. */
export interface ThrottleOpts {
  /** Fire one final call after the throttle window ends with the most recent args. */
  trailing?: boolean;
}

/**
 * Creates a throttled version of `fn` that fires at most once every `ms`
 * milliseconds.
 *
 * @typeParam T - The function type.
 * @param fn - The function to throttle.
 * @param ms - The minimum interval between invocations in milliseconds.
 * @param opts - See {@link ThrottleOpts}.
 * @returns A throttled version of `fn`.
 *
 * @example
 * ```ts
 * const onScroll = throttle(() => updatePosition(), 100);
 * window.addEventListener("scroll", onScroll);
 * ```
 */
export function throttle<T extends (...a: any[]) => void>(
  fn: T,
  ms: number,
  opts?: ThrottleOpts,
): (...args: Parameters<T>) => void {
  const trailing = opts?.trailing ?? false;
  let last = 0;
  let trailingTimer: ReturnType<typeof setTimeout> | undefined;

  return (...args) => {
    const now = Date.now();

    if (now - last >= ms) {
      last = now;
      fn(...args);
    } else if (trailing) {
      clearTimeout(trailingTimer);
      trailingTimer = setTimeout(
        () => {
          last = Date.now();
          fn(...args);
        },
        ms - (now - last),
      );
    }
  };
}
