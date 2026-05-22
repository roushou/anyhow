/**
 * Creates a `Date` from a Unix timestamp in seconds.
 *
 * @param seconds - Unix timestamp in seconds.
 * @returns A new `Date`.
 *
 * @example
 * ```ts
 * fromUnix(1704067200); // Date for 2024-01-01T00:00:00Z
 * ```
 */
export const fromUnix = (seconds: number): Date => new Date(seconds * 1000);

/**
 * Creates a `Date` from a Unix timestamp in milliseconds.
 *
 * @param ms - Unix timestamp in milliseconds.
 * @returns A new `Date`.
 *
 * @example
 * ```ts
 * fromUnixMs(1704067200000); // Date for 2024-01-01T00:00:00Z
 * ```
 */
export const fromUnixMs = (ms: number): Date => new Date(ms);

/**
 * Returns the Unix timestamp of `date` in seconds (truncated to integer).
 *
 * @param date - The date to convert.
 * @returns Unix timestamp in whole seconds.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T00:00:00.500Z");
 * toUnix(d); // 1704067200
 * ```
 */
export const toUnix = (date: Date): number => Math.trunc(date.getTime() / 1000);

/**
 * Returns the Unix timestamp of `date` in milliseconds.
 *
 * @param date - The date to convert.
 * @returns Unix timestamp in milliseconds.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T00:00:00.000Z");
 * toUnixMs(d); // 1704067200000
 * ```
 */
export const toUnixMs = (date: Date): number => date.getTime();
