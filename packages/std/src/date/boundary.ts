/**
 * Returns a new `Date` set to the start of the day (00:00:00.000).
 *
 * @param date - The source date.
 * @returns A new `Date` at the start of the same day.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T15:30:45.123Z");
 * startOfDay(d); // 2024-01-01T00:00:00.000Z
 * ```
 */
export const startOfDay = (date: Date): Date => {
  const out = new Date(date);
  out.setHours(0, 0, 0, 0);
  return out;
};

/**
 * Returns a new `Date` set to the end of the day (23:59:59.999).
 *
 * @param date - The source date.
 * @returns A new `Date` at the end of the same day.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T15:30:45.000Z");
 * endOfDay(d); // 2024-01-01T23:59:59.999Z
 * ```
 */
export const endOfDay = (date: Date): Date => {
  const out = new Date(date);
  out.setHours(23, 59, 59, 999);
  return out;
};

/**
 * Returns a new `Date` set to the start of the hour (mm:ss.ms set to 0).
 *
 * @param date - The source date.
 * @returns A new `Date` at the start of the same hour.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T15:30:45.123Z");
 * startOfHour(d); // 2024-01-01T15:00:00.000Z
 * ```
 */
export const startOfHour = (date: Date): Date => {
  const out = new Date(date);
  out.setMinutes(0, 0, 0);
  return out;
};

/**
 * Returns a new `Date` set to the end of the hour (59:59.999).
 *
 * @param date - The source date.
 * @returns A new `Date` at the end of the same hour.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T15:30:45.000Z");
 * endOfHour(d); // 2024-01-01T15:59:59.999Z
 * ```
 */
export const endOfHour = (date: Date): Date => {
  const out = new Date(date);
  out.setMinutes(59, 59, 999);
  return out;
};

/**
 * Returns a new `Date` set to the start of the minute (ss.ms set to 0).
 *
 * @param date - The source date.
 * @returns A new `Date` at the start of the same minute.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T15:30:45.123Z");
 * startOfMinute(d); // 2024-01-01T15:30:00.000Z
 * ```
 */
export const startOfMinute = (date: Date): Date => {
  const out = new Date(date);
  out.setSeconds(0, 0);
  return out;
};

/**
 * Returns a new `Date` set to the end of the minute (59.999).
 *
 * @param date - The source date.
 * @returns A new `Date` at the end of the same minute.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-01T15:30:45.000Z");
 * endOfMinute(d); // 2024-01-01T15:30:59.999Z
 * ```
 */
export const endOfMinute = (date: Date): Date => {
  const out = new Date(date);
  out.setSeconds(59, 999);
  return out;
};

/**
 * Returns a new `Date` set to the start of the ISO week (Monday, 00:00:00.000).
 * If `date` is already Monday, returns that Monday.
 *
 * @param date - The source date.
 * @returns A new `Date` at the start of the ISO week containing `date`.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-03T15:30:00Z"); // Wednesday
 * startOfWeek(d); // 2024-01-01T00:00:00.000Z (Monday)
 * ```
 */
export const startOfWeek = (date: Date): Date => {
  const out = new Date(date);
  const day = out.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  out.setDate(out.getDate() + diff);
  out.setHours(0, 0, 0, 0);
  return out;
};

/**
 * Returns a new `Date` set to the end of the ISO week (Sunday, 23:59:59.999).
 *
 * @param date - The source date.
 * @returns A new `Date` at the end of the ISO week containing `date`.
 *
 * @example
 * ```ts
 * const d = new Date("2024-01-03T15:30:00Z"); // Wednesday
 * endOfWeek(d); // 2024-01-07T23:59:59.999Z (Sunday)
 * ```
 */
export const endOfWeek = (date: Date): Date => {
  const out = new Date(date);
  const day = out.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  out.setDate(out.getDate() + diff);
  out.setHours(23, 59, 59, 999);
  return out;
};

/**
 * Returns a new `Date` set to the start of the month (1st day, 00:00:00.000).
 *
 * @param date - The source date.
 * @returns A new `Date` at the start of the month.
 *
 * @example
 * ```ts
 * const d = new Date("2024-03-15T12:30:00Z");
 * startOfMonth(d); // 2024-03-01T00:00:00.000Z
 * ```
 */
export const startOfMonth = (date: Date): Date => {
  const out = new Date(date);
  out.setDate(1);
  out.setHours(0, 0, 0, 0);
  return out;
};

/**
 * Returns a new `Date` set to the end of the month (last day, 23:59:59.999).
 *
 * @param date - The source date.
 * @returns A new `Date` at the end of the month.
 *
 * @example
 * ```ts
 * const d = new Date("2024-03-15T12:30:00Z");
 * endOfMonth(d); // 2024-03-31T23:59:59.999Z
 * ```
 */
export const endOfMonth = (date: Date): Date => {
  const out = new Date(date);
  out.setMonth(out.getMonth() + 1, 0);
  out.setHours(23, 59, 59, 999);
  return out;
};

/**
 * Returns a new `Date` set to the start of the year (Jan 1, 00:00:00.000).
 *
 * @param date - The source date.
 * @returns A new `Date` at the start of the year.
 *
 * @example
 * ```ts
 * const d = new Date("2024-06-15T12:30:00Z");
 * startOfYear(d); // 2024-01-01T00:00:00.000Z
 * ```
 */
export const startOfYear = (date: Date): Date => {
  const out = new Date(date);
  out.setMonth(0, 1);
  out.setHours(0, 0, 0, 0);
  return out;
};

/**
 * Returns a new `Date` set to the end of the year (Dec 31, 23:59:59.999).
 *
 * @param date - The source date.
 * @returns A new `Date` at the end of the year.
 *
 * @example
 * ```ts
 * const d = new Date("2024-06-15T12:30:00Z");
 * endOfYear(d); // 2024-12-31T23:59:59.999Z
 * ```
 */
export const endOfYear = (date: Date): Date => {
  const out = new Date(date);
  out.setMonth(11, 31);
  out.setHours(23, 59, 59, 999);
  return out;
};
