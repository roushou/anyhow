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
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Creates a debounced version of `fn` that delays invocation until `ms`
 * milliseconds have elapsed since the last call.
 *
 * @typeParam T - The function type.
 * @param fn - The function to debounce.
 * @param ms - The debounce window in milliseconds.
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
): (...args: Parameters<T>) => void {
  let t: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Creates a throttled version of `fn` that fires at most once every `ms`
 * milliseconds.
 *
 * @typeParam T - The function type.
 * @param fn - The function to throttle.
 * @param ms - The minimum interval between invocations in milliseconds.
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
): (...args: Parameters<T>) => void {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}
