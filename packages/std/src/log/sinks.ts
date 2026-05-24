import type { Sink } from "./logger.js";

/**
 * Creates a sink that writes formatted output to `console`.
 *
 * Routes to `console.error` for error-level entries, `console.warn` for
 * warnings, `console.log` for info, and `console.debug` for debug.
 *
 * @returns A {@link Sink}.
 *
 * @example
 * ```ts
 * log.addSink(consoleSink());
 * ```
 */
export function consoleSink(): Sink {
  return {
    write(formatted: string, _entry): void {
      // _entry is kept in the signature but unused — the formatted
      // string already contains all relevant information.
      console.log(formatted);
    },
  };
}

/**
 * Creates a sink that buffers formatted output as an array of strings.
 *
 * Useful for testing or in-memory log capture.
 *
 * @returns A {@link Sink} and the `logs` array it writes into.
 *
 * @example
 * ```ts
 * const { sink, logs } = memorySink();
 * log.addSink(sink);
 * log.info("hello");
 * console.log(logs); // ["... INFO ... hello"]
 * ```
 */
export function memorySink(): { sink: Sink; logs: string[] } {
  const logs: string[] = [];
  return {
    sink: {
      write(formatted: string): void {
        logs.push(formatted);
      },
    },
    logs,
  };
}
