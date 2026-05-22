/**
 * Returns a new `Date` with `ms` milliseconds added.
 *
 * @param date - The source date.
 * @param ms - Milliseconds to add.
 * @returns A new `Date` offset by `ms`.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T00:00:00.000Z");
 * addMilliseconds(d, 500); // 2024-01-01T00:00:00.500Z
 * ```
 */
export const addMilliseconds = (date: Date, ms: number): Date => new Date(date.getTime() + ms);

/**
 * Returns a new `Date` with `s` seconds added.
 *
 * @param date - The source date.
 * @param s - Seconds to add.
 * @returns A new `Date` offset by `s` seconds.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T00:00:00Z");
 * addSeconds(d, 30); // 2024-01-01T00:00:30Z
 * ```
 */
export const addSeconds = (date: Date, s: number): Date => addMilliseconds(date, s * 1000);

/**
 * Returns a new `Date` with `m` minutes added.
 *
 * @param date - The source date.
 * @param m - Minutes to add.
 * @returns A new `Date` offset by `m` minutes.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T00:00:00Z");
 * addMinutes(d, 30); // 2024-01-01T00:30:00Z
 * ```
 */
export const addMinutes = (date: Date, m: number): Date => addMilliseconds(date, m * 60_000);

/**
 * Returns a new `Date` with `h` hours added.
 *
 * @param date - The source date.
 * @param h - Hours to add.
 * @returns A new `Date` offset by `h` hours.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T00:00:00Z");
 * addHours(d, 2); // 2024-01-01T02:00:00Z
 * ```
 */
export const addHours = (date: Date, h: number): Date => addMilliseconds(date, h * 3_600_000);

/**
 * Returns a new `Date` with `d` days added.
 *
 * @param date - The source date.
 * @param d - Days to add.
 * @returns A new `Date` offset by `d` days.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T00:00:00Z");
 * addDays(d, 5); // 2024-01-06T00:00:00Z
 * ```
 */
export const addDays = (date: Date, d: number): Date => {
  const out = new Date(date);
  out.setDate(out.getDate() + d);
  return out;
};

/**
 * Returns a new `Date` with `w` weeks added.
 *
 * @param date - The source date.
 * @param w - Weeks to add.
 * @returns A new `Date` offset by `w` weeks.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T00:00:00Z");
 * addWeeks(d, 2); // 2024-01-15T00:00:00Z
 * ```
 */
export const addWeeks = (date: Date, w: number): Date => addDays(date, w * 7);

/**
 * Returns a new `Date` with `m` months added.
 * Clamps the day if the target month has fewer days (e.g. Jan 31 + 1 month → Feb 28).
 *
 * @param date - The source date.
 * @param m - Months to add.
 * @returns A new `Date` offset by `m` months.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-31T12:00:00Z");
 * addMonths(d, 1); // 2024-02-29T12:00:00Z (leap year)
 * ```
 */
export const addMonths = (date: Date, m: number): Date => {
  const out = new Date(date);
  const day = out.getDate();
  out.setDate(1);
  out.setMonth(out.getMonth() + m);
  const maxDay = new Date(out.getFullYear(), out.getMonth() + 1, 0).getDate();
  out.setDate(Math.min(day, maxDay));
  return out;
};

/**
 * Returns a new `Date` with `y` years added.
 * Clamps the day if the target year is not a leap year (e.g. Feb 29 + 1 year → Feb 28).
 *
 * @param date - The source date.
 * @param y - Years to add.
 * @returns A new `Date` offset by `y` years.
 *
 * @example
 * ```ts
 * const d = new Date("2024-02-29T12:00:00Z");
 * addYears(d, 1); // 2025-02-28T12:00:00Z (not a leap year)
 * ```
 */
export const addYears = (date: Date, y: number): Date => {
  const out = new Date(date);
  const month = out.getMonth();
  out.setFullYear(out.getFullYear() + y);
  if (out.getMonth() !== month) out.setDate(0);
  return out;
};

/**
 * Returns a new `Date` with `ms` milliseconds subtracted.
 *
 * @param date - The source date.
 * @param ms - Milliseconds to subtract.
 * @returns A new `Date` offset by `-ms`.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T00:00:01.000Z");
 * subMilliseconds(d, 500); // 2024-01-01T00:00:00.500Z
 * ```
 */
export const subMilliseconds = (date: Date, ms: number): Date => addMilliseconds(date, -ms);

/**
 * Returns a new `Date` with `s` seconds subtracted.
 *
 * @param date - The source date.
 * @param s - Seconds to subtract.
 * @returns A new `Date` offset by `-s` seconds.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T00:01:00Z");
 * subSeconds(d, 30); // 2024-01-01T00:00:30Z
 * ```
 */
export const subSeconds = (date: Date, s: number): Date => addSeconds(date, -s);

/**
 * Returns a new `Date` with `m` minutes subtracted.
 *
 * @param date - The source date.
 * @param m - Minutes to subtract.
 * @returns A new `Date` offset by `-m` minutes.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T01:00:00Z");
 * subMinutes(d, 30); // 2024-01-01T00:30:00Z
 * ```
 */
export const subMinutes = (date: Date, m: number): Date => addMinutes(date, -m);

/**
 * Returns a new `Date` with `h` hours subtracted.
 *
 * @param date - The source date.
 * @param h - Hours to subtract.
 * @returns A new `Date` offset by `-h` hours.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T12:00:00Z");
 * subHours(d, 2); // 2024-01-01T10:00:00Z
 * ```
 */
export const subHours = (date: Date, h: number): Date => addHours(date, -h);

/**
 * Returns a new `Date` with `d` days subtracted.
 *
 * @param date - The source date.
 * @param d - Days to subtract.
 * @returns A new `Date` offset by `-d` days.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-10T00:00:00Z");
 * subDays(d, 5); // 2024-01-05T00:00:00Z
 * ```
 */
export const subDays = (date: Date, d: number): Date => addDays(date, -d);

/**
 * Returns a new `Date` with `w` weeks subtracted.
 *
 * @param date - The source date.
 * @param w - Weeks to subtract.
 * @returns A new `Date` offset by `-w` weeks.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-15T00:00:00Z");
 * subWeeks(d, 2); // 2024-01-01T00:00:00Z
 * ```
 */
export const subWeeks = (date: Date, w: number): Date => addWeeks(date, -w);

/**
 * Returns a new `Date` with `m` months subtracted.
 * Clamps the day if the target month has fewer days.
 *
 * @param date - The source date.
 * @param m - Months to subtract.
 * @returns A new `Date` offset by `-m` months.
 *
 * @example
 * ```ts
 * const d = new Date("2024-03-31T12:00:00Z");
 * subMonths(d, 1); // 2024-02-29T12:00:00Z (leap year)
 * ```
 */
export const subMonths = (date: Date, m: number): Date => addMonths(date, -m);

/**
 * Returns a new `Date` with `y` years subtracted.
 * Clamps the day if the target year is not a leap year.
 *
 * @param date - The source date.
 * @param y - Years to subtract.
 * @returns A new `Date` offset by `-y` years.
 *
 * @example
 * ```ts
 * const d = new Date("2024-02-29T12:00:00Z");
 * subYears(d, 4); // 2020-02-29T12:00:00Z (leap year)
 * ```
 */
export const subYears = (date: Date, y: number): Date => addYears(date, -y);
