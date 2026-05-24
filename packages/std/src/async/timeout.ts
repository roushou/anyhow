import { ok, err, type Result } from "../result/result.js";

/**
 * Wraps `promise` so that it rejects (via {@link Result}) if it does not
 * settle within `ms` milliseconds.
 *
 * Uses `AbortSignal.timeout` internally — no `setTimeout` leak possible.
 *
 * @typeParam T - The type the promise resolves to.
 * @param promise - The promise to wrap.
 * @param ms - The timeout in milliseconds.
 * @returns A `Result<T>` — `Ok` if the promise resolves in time, `Err` with a
 *   `TimeoutError` otherwise.
 *
 * @example
 * ```ts
 * const result = await timeout(fetch("/api/data"), 5_000);
 * if (result.ok) console.log(result.value);
 * ```
 */
export async function timeout<T>(promise: Promise<T>, ms: number): Promise<Result<T, Error>> {
  if (ms <= 0) return err(new Error("Timeout must be positive"));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new TimeoutError(ms)), ms);

  try {
    const value = await raceWithAbort(promise, controller.signal);
    return ok(value);
  } catch (e) {
    if (e instanceof TimeoutError) return err(e);
    return err(e instanceof Error ? e : new Error(String(e)));
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Races a promise against an AbortSignal.  Rejects with the abort reason
 * if the signal fires before the promise settles.
 */
function raceWithAbort<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) return Promise.reject(signal.reason);

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      reject(signal.reason ?? new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });

    promise.then(
      (v) => {
        signal.removeEventListener("abort", onAbort);
        resolve(v);
      },
      (e) => {
        signal.removeEventListener("abort", onAbort);
        reject(e);
      },
    );
  });
}

/**
 * Error thrown when a {@link timeout} expires.
 */
export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}
