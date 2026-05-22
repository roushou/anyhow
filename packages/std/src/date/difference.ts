const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;

/**
 * Returns the difference between `left` and `right` in milliseconds (`left - right`).
 *
 * @param left - The later (or earlier) date.
 * @param right - The earlier (or later) date.
 * @returns The signed difference in milliseconds.
 *
 * @example
 * ```ts
 * const a = new Date("2024-01-01T00:00:01.500Z");
 * const b = new Date("2024-01-01T00:00:01.000Z");
 * differenceInMilliseconds(a, b); // 500
 * ```
 */
export const differenceInMilliseconds = (left: Date, right: Date): number =>
  left.getTime() - right.getTime();

/**
 * Returns the difference between `left` and `right` in whole seconds.
 *
 * @param left - The later date.
 * @param right - The earlier date.
 * @returns The signed difference in whole seconds.
 *
 * @example
 * ```ts
 * const a = new Date("2024-01-01T00:01:30Z");
 * const b = new Date("2024-01-01T00:00:00Z");
 * differenceInSeconds(a, b); // 90
 * ```
 */
export const differenceInSeconds = (left: Date, right: Date): number =>
  Math.trunc(differenceInMilliseconds(left, right) / MS_PER_SECOND);

/**
 * Returns the difference between `left` and `right` in whole minutes.
 *
 * @param left - The later date.
 * @param right - The earlier date.
 * @returns The signed difference in whole minutes.
 *
 * @example
 * ```ts
 * const a = new Date("2024-01-01T01:30:00Z");
 * const b = new Date("2024-01-01T00:00:00Z");
 * differenceInMinutes(a, b); // 90
 * ```
 */
export const differenceInMinutes = (left: Date, right: Date): number =>
  Math.trunc(differenceInMilliseconds(left, right) / MS_PER_MINUTE);

/**
 * Returns the difference between `left` and `right` in whole hours.
 *
 * @param left - The later date.
 * @param right - The earlier date.
 * @returns The signed difference in whole hours.
 *
 * @example
 * ```ts
 * const a = new Date("2024-01-02T00:00:00Z");
 * const b = new Date("2024-01-01T00:00:00Z");
 * differenceInHours(a, b); // 24
 * ```
 */
export const differenceInHours = (left: Date, right: Date): number =>
  Math.trunc(differenceInMilliseconds(left, right) / MS_PER_HOUR);

/**
 * Returns the difference between `left` and `right` in whole calendar days.
 * Uses UTC midnight for DST-safe comparison.
 *
 * @param left - The later date.
 * @param right - The earlier date.
 * @returns The signed difference in whole days.
 *
 * @example
 * ```ts
 * const a = new Date("2024-01-10T12:00:00Z");
 * const b = new Date("2024-01-01T00:00:00Z");
 * differenceInDays(a, b); // 9
 * ```
 */
export const differenceInDays = (left: Date, right: Date): number => {
  const utcLeft = Date.UTC(left.getFullYear(), left.getMonth(), left.getDate());
  const utcRight = Date.UTC(right.getFullYear(), right.getMonth(), right.getDate());
  return Math.trunc((utcLeft - utcRight) / MS_PER_DAY);
};

/**
 * Returns the difference between `left` and `right` in whole weeks.
 *
 * @param left - The later date.
 * @param right - The earlier date.
 * @returns The signed difference in whole weeks.
 *
 * @example
 * ```ts
 * const a = new Date("2024-01-22T00:00:00Z");
 * const b = new Date("2024-01-01T00:00:00Z");
 * differenceInWeeks(a, b); // 3
 * ```
 */
export const differenceInWeeks = (left: Date, right: Date): number =>
  Math.trunc(differenceInDays(left, right) / 7);

/**
 * Returns the difference between `left` and `right` in whole months.
 * Partial months are not counted: only full calendar months are included.
 *
 * @param left - The later date.
 * @param right - The earlier date.
 * @returns The signed difference in whole months.
 *
 * @example
 * ```ts
 * const a = new Date("2024-06-15T00:00:00Z");
 * const b = new Date("2024-01-01T00:00:00Z");
 * differenceInMonths(a, b); // 5
 * ```
 */
export const differenceInMonths = (left: Date, right: Date): number => {
  let months = (left.getFullYear() - right.getFullYear()) * 12 + left.getMonth() - right.getMonth();
  if (left.getDate() < right.getDate()) months--;
  return months;
};

/**
 * Returns the difference between `left` and `right` in whole years.
 * Partial years are not counted: only full calendar years are included.
 *
 * @param left - The later date.
 * @param right - The earlier date.
 * @returns The signed difference in whole years.
 *
 * @example
 * ```ts
 * const a = new Date("2025-06-01T00:00:00Z");
 * const b = new Date("2024-01-01T00:00:00Z");
 * differenceInYears(a, b); // 1
 * ```
 */
export const differenceInYears = (left: Date, right: Date): number => {
  let years = left.getFullYear() - right.getFullYear();
  const monthDiff = left.getMonth() - right.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && left.getDate() < right.getDate())) years--;
  return years;
};
