import { LRU } from "../cache/lru.js";
import { locale } from "./locale.js";

const CACHE_SIZE = 256;

const numCache = new LRU<string, Intl.NumberFormat>(CACHE_SIZE);
const dtCache = new LRU<string, Intl.DateTimeFormat>(CACHE_SIZE);
const rtCache = new LRU<string, Intl.RelativeTimeFormat>(CACHE_SIZE);
const liCache = new LRU<string, Intl.ListFormat>(CACHE_SIZE);

/**
 * Format a number as currency using `Intl.NumberFormat`.
 * The formatter is cached per `(locale, currency)` pair.
 *
 * @param value - The numeric value.
 * @param currency - ISO 4217 currency code (e.g. `"USD"`, `"EUR"`).
 * @param loc - Locale string (defaults to runtime locale).
 * @returns The formatted currency string.
 *
 * @example
 * ```ts
 * currency(9.99, "USD"); // "$9.99"
 * ```
 */
export const currency = (value: number, currency: string, loc = locale()) =>
  numCache
    .getOrSet(
      `num:${loc}:${currency}`,
      () => new Intl.NumberFormat(loc, { style: "currency", currency }),
    )
    .format(value);

/**
 * Format a number using `Intl.NumberFormat`.
 * The formatter is cached per `(locale, options)` pair.
 *
 * @param value - The number to format.
 * @param opts - `Intl.NumberFormatOptions`.
 * @param loc - Locale string (defaults to runtime locale).
 * @returns The formatted number string.
 *
 * @example
 * ```ts
 * number(1_234_567.89); // "1,234,567.89"
 * number(0.42, { style: "percent" }); // "42%"
 * ```
 */
export const number = (value: number, opts?: Intl.NumberFormatOptions, loc = locale()) =>
  numCache
    .getOrSet(`num:${loc}:${JSON.stringify(opts)}`, () => new Intl.NumberFormat(loc, opts))
    .format(value);

/**
 * Format a date using `Intl.DateTimeFormat`.
 * The formatter is cached per `(locale, options)` pair.
 *
 * @param value - The date to format.
 * @param opts - `Intl.DateTimeFormatOptions`, or `"full"` / `"short"` presets.
 * @param loc - Locale string (defaults to runtime locale).
 * @returns The formatted date string.
 *
 * @example
 * ```ts
 * date(new Date(), "full"); // "Monday, January 1, 2024"
 * ```
 */
export const date = (
  value: Date,
  opts?: Intl.DateTimeFormatOptions | "full" | "short",
  loc = locale(),
) => {
  const resolved =
    opts === "full"
      ? { dateStyle: "full" as const }
      : opts === "short"
        ? { dateStyle: "short" as const }
        : opts;
  return dtCache
    .getOrSet(`dt:${loc}:${JSON.stringify(resolved)}`, () => new Intl.DateTimeFormat(loc, resolved))
    .format(value);
};

/**
 * Format a relative time using `Intl.RelativeTimeFormat`.
 * The formatter is cached per locale.
 *
 * @param value - The numeric value (e.g. `-3`, `1`).
 * @param unit - The time unit (e.g. `"day"`, `"hour"`).
 * @param loc - Locale string (defaults to runtime locale).
 * @returns The formatted relative time string.
 *
 * @example
 * ```ts
 * relativeTime(-3, "day"); // "3 days ago"
 * relativeTime(1, "week");  // "next week"
 * ```
 */
export const relativeTime = (value: number, unit: Intl.RelativeTimeFormatUnit, loc = locale()) =>
  rtCache
    .getOrSet(`rt:${loc}`, () => new Intl.RelativeTimeFormat(loc, { numeric: "auto" }))
    .format(value, unit);

/**
 * Format a list of strings using `Intl.ListFormat`.
 * The formatter is cached per `(locale, type)` pair.
 *
 * @param items - The strings to join.
 * @param type - `"conjunction"` ("A, B, and C") or `"disjunction"` ("A, B, or C").
 * @param loc - Locale string (defaults to runtime locale).
 * @returns The formatted list string.
 *
 * @example
 * ```ts
 * list(["Alice", "Bob", "Carol"]); // "Alice, Bob, and Carol"
 * ```
 */
export const list = (
  items: string[],
  type: "conjunction" | "disjunction" = "conjunction",
  loc = locale(),
) =>
  liCache
    .getOrSet(`list:${loc}:${type}`, () => new Intl.ListFormat(loc, { style: "long", type }))
    .format(items);

// ── relativeTimeFromNow ──

const MINUTE = 60;
const HOUR = 3600;
const DAY = 86400;
const WEEK = 604800;
const MONTH = 2_629_800;
const YEAR = 31_557_600;

const RT_UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: "year", seconds: YEAR },
  { unit: "month", seconds: MONTH },
  { unit: "week", seconds: WEEK },
  { unit: "day", seconds: DAY },
  { unit: "hour", seconds: HOUR },
  { unit: "minute", seconds: MINUTE },
  { unit: "second", seconds: 1 },
];

/**
 * Formats a date as a relative time string ("3 days ago", "in 1 hour").
 *
 * Uses `Intl.RelativeTimeFormat` with `numeric: "auto"` so the result is
 * locale-aware (e.g. "yesterday" instead of "1 day ago" where supported).
 *
 * @param date - The date to format relative to now.
 * @param now - The reference date (defaults to `Date.now()`).
 * @param loc - Locale string (defaults to the runtime locale).
 * @returns A relative time string.
 *
 * @example
 * ```ts
 * relativeTimeFromNow(new Date(Date.now() - 86_400_000)); // "yesterday" or "1 day ago"
 * relativeTimeFromNow(new Date(Date.now() + 3_600_000));  // "in 1 hour"
 * ```
 */
export const relativeTimeFromNow = (date: Date, now = new Date(), loc = locale()): string => {
  const diff = (date.getTime() - now.getTime()) / 1000;
  const abs = Math.abs(diff);
  for (const { unit, seconds } of RT_UNITS) {
    if (abs >= seconds || unit === "second") {
      const value = Math.round(diff / seconds);
      return rtCache
        .getOrSet(`rt:${loc}`, () => new Intl.RelativeTimeFormat(loc, { numeric: "auto" }))
        .format(value, unit);
    }
  }
  return "";
};
