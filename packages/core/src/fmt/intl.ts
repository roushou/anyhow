import { LRU } from "../cache/lru.js";
import { locale } from "./locale.js";

const CACHE_SIZE = 256;

const numCache = new LRU<string, Intl.NumberFormat>(CACHE_SIZE);
const dtCache = new LRU<string, Intl.DateTimeFormat>(CACHE_SIZE);
const rtCache = new LRU<string, Intl.RelativeTimeFormat>(CACHE_SIZE);
const liCache = new LRU<string, Intl.ListFormat>(CACHE_SIZE);

/**
 * Format a number as currency using
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat | Intl.NumberFormat}.
 *
 * The formatter is cached per `(locale, currency)` pair for performance.
 *
 * @param value - The numeric value to format.
 * @param currency - ISO 4217 currency code (e.g. `"USD"`, `"EUR"`).
 * @param loc - Locale string (defaults to the runtime locale).
 * @returns The formatted currency string.
 *
 * @example
 * ```ts
 * currency(9.99, "USD"); // "$9.99"
 * currency(1234.5, "EUR"); // "€1,234.50"
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
 * Format a number using
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat | Intl.NumberFormat}.
 *
 * The formatter is cached per `(locale, options)` pair for performance.
 *
 * @param value - The number to format.
 * @param opts - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options | Intl.NumberFormatOptions}.
 * @param loc - Locale string (defaults to the runtime locale).
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
 * Format a date using
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat | Intl.DateTimeFormat}.
 *
 * The formatter is cached per `(locale, options)` pair for performance.
 *
 * @param value - The date to format.
 * @param opts - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options | Intl.DateTimeFormatOptions},
 *   or `"full"` / `"short"` for the corresponding
 *   {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#datestyle | dateStyle} preset.
 * @param loc - Locale string (defaults to the runtime locale).
 * @returns The formatted date string.
 *
 * @example
 * ```ts
 * date(new Date(), "full"); // "Monday, January 1, 2024"
 * date(new Date(), { month: "long", day: "numeric" }); // "January 1"
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
 * Format a relative time using
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat | Intl.RelativeTimeFormat}.
 *
 * The formatter is cached per locale for performance.
 *
 * @param value - The numeric value (e.g. `-3`, `1`).
 * @param unit - The time unit (e.g. `"day"`, `"hour"`).
 * @param loc - Locale string (defaults to the runtime locale).
 * @returns The formatted relative time string.
 *
 * @example
 * ```ts
 * relativeTime(-3, "day"); // "3 days ago"
 * relativeTime(1, "week"); // "next week"
 * ```
 */
export const relativeTime = (value: number, unit: Intl.RelativeTimeFormatUnit, loc = locale()) =>
  rtCache
    .getOrSet(`rt:${loc}`, () => new Intl.RelativeTimeFormat(loc, { numeric: "auto" }))
    .format(value, unit);

/**
 * Format a list of strings using
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat | Intl.ListFormat}.
 *
 * The formatter is cached per `(locale, type)` pair for performance.
 *
 * @param items - The strings to join.
 * @param type - `"conjunction"` ("A, B, and C") or `"disjunction"` ("A, B, or C").
 *   Defaults to `"conjunction"`.
 * @param loc - Locale string (defaults to the runtime locale).
 * @returns The formatted list string.
 *
 * @example
 * ```ts
 * list(["Alice", "Bob", "Carol"]); // "Alice, Bob, and Carol"
 * list(["Alice", "Bob", "Carol"], "disjunction"); // "Alice, Bob, or Carol"
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
