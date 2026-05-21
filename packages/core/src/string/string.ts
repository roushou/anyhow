import { ResultStatic as Result } from "../result/static.js";
import type { Result as R } from "../result/result.js";

const isUpper = (ch: string): boolean => ch >= "A" && ch <= "Z";
const isLower = (ch: string): boolean => ch >= "a" && ch <= "z";
const isDigit = (ch: string): boolean => ch >= "0" && ch <= "9";
const isAlpha = (ch: string): boolean => isUpper(ch) || isLower(ch);
const isAlphanumeric = (ch: string): boolean => isAlpha(ch) || isDigit(ch);

const splitWords = (str: string): string[] => {
  let out = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]!;
    const prev = str[i - 1];
    if (i > 0) {
      if (isLower(prev!) && isUpper(ch)) out += " ";
      else if (isAlpha(prev!) && isDigit(ch)) out += " ";
      else if (isDigit(prev!) && isAlpha(ch)) out += " ";
    }
    out += isAlphanumeric(ch) ? ch : " ";
  }
  return out.split(" ").filter(Boolean);
};

const toCamel = (words: string[]): string =>
  words
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0]!.toUpperCase() + w.slice(1).toLowerCase()))
    .join("");
const toPascal = (words: string[]): string =>
  words.map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase()).join("");
const toDelimited = (words: string[], sep: string): string =>
  words.map((w) => w.toLowerCase()).join(sep);

export const camelCase = (str: string): string => toCamel(splitWords(str));
export const pascalCase = (str: string): string => toPascal(splitWords(str));
export const snakeCase = (str: string): string => toDelimited(splitWords(str), "_");
export const kebabCase = (str: string): string => toDelimited(splitWords(str), "-");

export const slugify = (str: string): string =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const stripIndent = (str: string): string => {
  const lines = str.split("\n");
  let min = Infinity;
  for (const line of lines) {
    if (line.trim().length === 0) continue;
    const match = line.match(/^[ \t]*/);
    if (match) min = Math.min(min, match[0].length);
  }
  if (!isFinite(min)) return str;
  return lines.map((l) => l.slice(min)).join("\n");
};

export const template = (str: string, values: Record<string, string | number>): R<string> =>
  Result.from(() =>
    str.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      if (!(key in values)) throw new Error(`Missing template key: "${key}"`);
      return String(values[key]!);
    }),
  );

// ── HTML escaping ──

const HTML_ESCAPE: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const HTML_UNESCAPE: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
};

/**
 * Escapes HTML special characters (`&`, `<`, `>`, `"`, `'`).
 */
export const escapeHtml = (str: string): string =>
  str.replace(/[&<>"']/g, (ch) => HTML_ESCAPE[ch]!);

/**
 * Unescapes HTML entities (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`).
 */
export const unescapeHtml = (str: string): string =>
  str.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => HTML_UNESCAPE[entity] ?? entity);

/**
 * Escapes special regex characters in a string so it can be used as a literal
 * pattern inside `new RegExp()`.
 */
export const escapeRegExp = (str: string): string => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Splits a string into lines (preserving empty lines).
 */
export const lines = (str: string): string[] => str.split("\n");

/**
 * Splits a string into words on whitespace.
 */
export const words = (str: string): string[] => str.trim().split(/\s+/).filter(Boolean);
