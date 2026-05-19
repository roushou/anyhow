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
