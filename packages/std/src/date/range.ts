import { addDays } from "./manipulate.js";

/**
 * Returns an iterator over dates from `start` to `end` (inclusive), stepping by `step` days.
 *
 * @param start - The start date (inclusive).
 * @param end - The end date (inclusive).
 * @param step - Number of days between each yielded date (default 1). Must be positive.
 * @returns An iterable iterator of `Date` objects.
 *
 * @example
 * ```ts
 * const start = new Date("2024-01-01");
 * const end = new Date("2024-01-03");
 * for (const d of dateRange(start, end)) {
 *   console.log(d.toISOString());
 * }
 * // 2024-01-01, 2024-01-02, 2024-01-03
 * ```
 */
export function* dateRange(start: Date, end: Date, step = 1): IterableIterator<Date> {
  if (step <= 0) return;
  const startTime = start.getTime();
  const endTime = end.getTime();
  if (startTime > endTime) return;
  let current = new Date(start);
  while (current.getTime() <= endTime) {
    yield new Date(current);
    current = addDays(current, step);
  }
}

/**
 * Returns a new `Date` clamped between `min` and `max` (inclusive).
 *
 * @param date - The date to clamp.
 * @param min - The earliest allowed date.
 * @param max - The latest allowed date.
 * @returns `min` if `date < min`, `max` if `date > max`, otherwise `date`.
 *
 * @example
 * ```ts
 * const d = new Date("2024-06-15");
 * const min = new Date("2024-01-01");
 * const max = new Date("2024-12-31");
 * clampDate(d, min, max); // d (within range)
 * ```
 */
export const clampDate = (date: Date, min: Date, max: Date): Date => {
  const t = date.getTime();
  if (t < min.getTime()) return new Date(min);
  if (t > max.getTime()) return new Date(max);
  return new Date(date);
};

/**
 * Returns the earliest date from an array.
 *
 * @param dates - Array of dates (must have at least one element).
 * @returns The earliest `Date`.
 *
 * @example
 * ```ts
 * const a = new Date("2024-03-01");
 * const b = new Date("2024-01-01");
 * const c = new Date("2024-06-01");
 * minDate([a, b, c]); // b
 * ```
 */
export const minDate = (dates: Date[]): Date =>
  new Date(Math.min(...dates.map((d) => d.getTime())));

/**
 * Returns the latest date from an array.
 *
 * @param dates - Array of dates (must have at least one element).
 * @returns The latest `Date`.
 *
 * @example
 * ```ts
 * const a = new Date("2024-03-01");
 * const b = new Date("2024-01-01");
 * const c = new Date("2024-06-01");
 * maxDate([a, b, c]); // c
 * ```
 */
export const maxDate = (dates: Date[]): Date =>
  new Date(Math.max(...dates.map((d) => d.getTime())));
