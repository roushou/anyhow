/**
 * Returns the number of days in the month of `date`.
 *
 * @param date - The date whose month to query.
 * @returns The number of days (28–31).
 *
 * @example
 * ```ts
 * daysInMonth(new Date("2024-02-01")); // 29 (leap year)
 * daysInMonth(new Date("2025-02-01")); // 28
 * ```
 */
export const daysInMonth = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

/**
 * Returns the number of days in the year of `date`.
 *
 * @param date - The date whose year to query.
 * @returns 365 or 366.
 *
 * @example
 * ```ts
 * daysInYear(new Date("2024-01-01")); // 366 (leap year)
 * daysInYear(new Date("2025-01-01")); // 365
 * ```
 */
export const daysInYear = (date: Date): number => {
  const y = date.getFullYear();
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 366 : 365;
};

/**
 * Returns the day of the year (1-based, Jan 1 = 1).
 *
 * @param date - The date to query.
 * @returns The day of the year (1–366).
 *
 * @example
 * ```ts
 * dayOfYear(new Date("2024-01-01")); // 1
 * dayOfYear(new Date("2024-12-31")); // 366
 * ```
 */
export const dayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
};

/**
 * Returns the ISO 8601 week number of the year.
 * Week 1 is the week containing the first Thursday of the year.
 *
 * @param date - The date to query.
 * @returns The ISO week number (1–53).
 *
 * @example
 * ```ts
 * weekOfYear(new Date("2024-01-01")); // 1
 * weekOfYear(new Date("2024-12-31")); // 1 (of 2025 by ISO rules)
 * ```
 */
export const weekOfYear = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
};

/**
 * Returns the calendar quarter of `date` (1–4).
 *
 * @param date - The date to query.
 * @returns The quarter: 1 = Jan–Mar, 2 = Apr–Jun, 3 = Jul–Sep, 4 = Oct–Dec.
 *
 * @example
 * ```ts
 * getQuarter(new Date("2024-01-15")); // 1
 * getQuarter(new Date("2024-07-01")); // 3
 * ```
 */
export const getQuarter = (date: Date): number => Math.floor(date.getMonth() / 3) + 1;
