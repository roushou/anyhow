import { locale as defaultLocale } from "./locale.js";

// ── truncate ──

interface TruncateOpts {
  ellipsis?: string;
  /** Where to place the ellipsis.  Defaults to `"end"`. */
  position?: "start" | "middle" | "end";
}

/**
 * Truncate a string to at most `maxLen` characters, appending an ellipsis
 * when truncation occurs.
 *
 * @param str - The string to truncate.
 * @param maxLen - The maximum length (including ellipsis).
 * @param opts - Ellipsis string or options object.
 * @param opts.ellipsis - The ellipsis string (default: `"…"`).
 * @param opts.position - Where to place the ellipsis (default: `"end"`).
 * @returns The truncated string.
 *
 * @example
 * ```ts
 * truncate("hello world", 8);            // "hello…"
 * truncate("hello world", 8, "…");       // "hello w…"
 * truncate("hello world", 8, { ellipsis: "…", position: "middle" }); // "hel…rld"
 * ```
 */
export function truncate(str: string, maxLen: number): string;
export function truncate(str: string, maxLen: number, ellipsis: string): string;
export function truncate(str: string, maxLen: number, opts: TruncateOpts): string;
export function truncate(str: string, maxLen: number, opts?: string | TruncateOpts): string {
  if (str.length <= maxLen) return str;

  const { ellipsis = "…", position = "end" } =
    typeof opts === "string" ? { ellipsis: opts } : (opts ?? {});

  const keep = maxLen - ellipsis.length;
  if (keep <= 0) return ellipsis.slice(0, maxLen);

  switch (position) {
    case "start":
      return ellipsis + str.slice(str.length - keep);
    case "middle": {
      const left = Math.ceil(keep / 2);
      const right = keep - left;
      return str.slice(0, left) + ellipsis + str.slice(str.length - right);
    }
    default:
      return str.slice(0, keep) + ellipsis;
  }
}

// ── pluralize ──

type PluralCategory = Intl.LDMLPluralRule;

type PluralForms = Partial<Record<PluralCategory, string>> & { other: string };

interface PluralizeOpts {
  locale?: string;
}

/**
 * Pluralize a word based on `count` using `Intl.PluralRules`.
 *
 * In the browser the locale is detected automatically; on the server it
 * defaults to `"en"`.  Pass `{ locale }` to override.
 *
 * @param count - The count (0 = plural in English).
 * @param singularOrForms - The singular form, or a `PluralForms` record.
 * @param pluralOrOpts - The plural form (when first arg is singular), or options.
 * @param maybeOpts - Options when using `PluralForms`.
 * @returns The formatted string (e.g. `"3 cats"`).
 *
 * @example
 * ```ts
 * pluralize(1, "cat");                                          // "1 cat"
 * pluralize(3, "cat");                                          // "3 cats"
 * pluralize(1, "child", "children");                            // "1 child"
 * pluralize(3, "child", "children");                            // "3 children"
 * pluralize(3, { one: "kota", other: "kotov" }, { locale: "ru" }); // "3 kotov"
 * ```
 */
export function pluralize(count: number, singular: string): string;
export function pluralize(count: number, singular: string, plural: string): string;
export function pluralize(count: number, forms: PluralForms, opts?: PluralizeOpts): string;
export function pluralize(
  count: number,
  singularOrForms: string | PluralForms,
  pluralOrOpts?: string | PluralizeOpts,
  maybeOpts?: PluralizeOpts,
): string {
  let forms: PluralForms;
  let locale: string;

  if (typeof singularOrForms === "string") {
    const plural = typeof pluralOrOpts === "string" ? pluralOrOpts : `${singularOrForms}s`;
    forms = { one: singularOrForms, other: plural };
    locale = defaultLocale();
  } else {
    forms = singularOrForms;
    locale = (pluralOrOpts as PluralizeOpts | undefined)?.locale ?? defaultLocale();
    void maybeOpts;
  }

  const rules = new Intl.PluralRules(locale);
  const cat = rules.select(count);

  const word =
    forms[cat as PluralCategory] ??
    forms.other ??
    forms.one ??
    Object.values(forms).find(Boolean) ??
    "";

  return `${count} ${word}`;
}
