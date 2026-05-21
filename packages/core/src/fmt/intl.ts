import { LRU } from "../cache/lru.js";
import { locale } from "./locale.js";

const CACHE_SIZE = 256;

const numCache = new LRU<string, Intl.NumberFormat>(CACHE_SIZE);
const dtCache = new LRU<string, Intl.DateTimeFormat>(CACHE_SIZE);
const rtCache = new LRU<string, Intl.RelativeTimeFormat>(CACHE_SIZE);
const liCache = new LRU<string, Intl.ListFormat>(CACHE_SIZE);

export const currency = (value: number, currency: string, loc = locale()) =>
  numCache
    .getOrSet(
      `num:${loc}:${currency}`,
      () => new Intl.NumberFormat(loc, { style: "currency", currency }),
    )
    .format(value);

export const number = (value: number, opts?: Intl.NumberFormatOptions, loc = locale()) =>
  numCache
    .getOrSet(`num:${loc}:${JSON.stringify(opts)}`, () => new Intl.NumberFormat(loc, opts))
    .format(value);

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

export const relativeTime = (value: number, unit: Intl.RelativeTimeFormatUnit, loc = locale()) =>
  rtCache
    .getOrSet(`rt:${loc}`, () => new Intl.RelativeTimeFormat(loc, { numeric: "auto" }))
    .format(value, unit);

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
