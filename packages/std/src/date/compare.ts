/**
 * Returns `true` if `date` is strictly before `other`.
 *
 * @param date - The date to compare.
 * @param other - The date to compare against.
 * @returns `true` if `date < other`.
 *
 * @example
 * ```ts
 * isBefore(new Date("2024-01-01"), new Date("2024-01-02")); // true
 * ```
 */
export const isBefore = (date: Date, other: Date): boolean => date.getTime() < other.getTime();

/**
 * Returns `true` if `date` is strictly after `other`.
 *
 * @param date - The date to compare.
 * @param other - The date to compare against.
 * @returns `true` if `date > other`.
 *
 * @example
 * ```ts
 * isAfter(new Date("2024-01-02"), new Date("2024-01-01")); // true
 * ```
 */
export const isAfter = (date: Date, other: Date): boolean => date.getTime() > other.getTime();

/**
 * Returns `true` if `date` and `other` represent the same millisecond instant.
 *
 * @param date - The first date.
 * @param other - The second date.
 * @returns `true` if the timestamps are equal.
 *
 * @example
 * ```ts
 * const a = new Date("2024-01-01T00:00:00.000Z");
 * const b = new Date("2024-01-01T00:00:00.000Z");
 * isEqual(a, b); // true
 * ```
 */
export const isEqual = (date: Date, other: Date): boolean => date.getTime() === other.getTime();

/**
 * Returns `true` if `date` and `other` fall on the same calendar day.
 *
 * @param date - The first date.
 * @param other - The second date.
 * @returns `true` if they share the same year, month, and day.
 *
 * @example
 * ```ts
 * const a = new Date("2024-01-01T08:00:00Z");
 * const b = new Date("2024-01-01T20:00:00Z");
 * isSameDay(a, b); // true
 * ```
 */
export const isSameDay = (date: Date, other: Date): boolean =>
  date.getFullYear() === other.getFullYear() &&
  date.getMonth() === other.getMonth() &&
  date.getDate() === other.getDate();

/**
 * Returns `true` if `date` and `other` fall in the same calendar month.
 *
 * @param date - The first date.
 * @param other - The second date.
 * @returns `true` if they share the same year and month.
 *
 * @example
 * ```ts
 * const a = new Date("2024-03-01T00:00:00Z");
 * const b = new Date("2024-03-31T23:59:59Z");
 * isSameMonth(a, b); // true
 * ```
 */
export const isSameMonth = (date: Date, other: Date): boolean =>
  date.getFullYear() === other.getFullYear() && date.getMonth() === other.getMonth();

/**
 * Returns `true` if `date` and `other` fall in the same calendar year.
 *
 * @param date - The first date.
 * @param other - The second date.
 * @returns `true` if they share the same year.
 *
 * @example
 * ```ts
 * const a = new Date("2024-01-01T00:00:00Z");
 * const b = new Date("2024-12-31T23:59:59Z");
 * isSameYear(a, b); // true
 * ```
 */
export const isSameYear = (date: Date, other: Date): boolean =>
  date.getFullYear() === other.getFullYear();

/**
 * Returns `true` if `date` falls on today's date (local time).
 *
 * @param date - The date to check.
 * @returns `true` if `date` is today.
 *
 * @example
 * ```ts
 * isToday(new Date()); // true
 * ```
 */
export const isToday = (date: Date): boolean => isSameDay(date, new Date());

/**
 * Returns `true` if `date` falls on yesterday's date (local time).
 *
 * @param date - The date to check.
 * @returns `true` if `date` is yesterday.
 *
 * @example
 * ```ts
 * const d = addDays(new Date(), -1);
 * isYesterday(d); // true
 * ```
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

/**
 * Returns `true` if `date` falls on tomorrow's date (local time).
 *
 * @param date - The date to check.
 * @returns `true` if `date` is tomorrow.
 *
 * @example
 * ```ts
 * const d = addDays(new Date(), 1);
 * isTomorrow(d); // true
 * ```
 */
export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isSameDay(date, tomorrow);
};

/**
 * Returns `true` if `date` is in the past (strictly before now).
 *
 * @param date - The date to check.
 * @returns `true` if `date < now`.
 *
 * @example
 * ```ts
 * isPast(new Date("2020-01-01")); // true
 * ```
 */
export const isPast = (date: Date): boolean => date.getTime() < Date.now();

/**
 * Returns `true` if `date` is in the future (strictly after now).
 *
 * @param date - The date to check.
 * @returns `true` if `date > now`.
 *
 * @example
 * ```ts
 * isFuture(new Date("2099-01-01")); // true
 * ```
 */
export const isFuture = (date: Date): boolean => date.getTime() > Date.now();

/**
 * Returns `true` if `date` falls on a Saturday or Sunday.
 *
 * @param date - The date to check.
 * @returns `true` if the day is Saturday (6) or Sunday (0).
 *
 * @example
 * ```ts
 * isWeekend(new Date("2024-01-06")); // true (Saturday)
 * isWeekend(new Date("2024-01-08")); // false (Monday)
 * ```
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

/**
 * Returns `true` if `date` falls on a Monday through Friday.
 *
 * @param date - The date to check.
 * @returns `true` if the day is Monday–Friday.
 *
 * @example
 * ```ts
 * isWeekday(new Date("2024-01-08")); // true (Monday)
 * isWeekday(new Date("2024-01-06")); // false (Saturday)
 * ```
 */
export const isWeekday = (date: Date): boolean => !isWeekend(date);

/**
 * Returns `true` if `date` falls in a leap year.
 *
 * @param date - The date to check.
 * @returns `true` if the year is a leap year.
 *
 * @example
 * ```ts
 * isLeapYear(new Date("2024-01-01")); // true
 * isLeapYear(new Date("2025-01-01")); // false
 * ```
 */
export const isLeapYear = (date: Date): boolean => {
  const y = date.getFullYear();
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
};
