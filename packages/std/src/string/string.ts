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

/**
 * Capitalizes the first character of a string and lowercases the rest.
 *
 * @param str - The input string.
 * @returns The capitalized string.
 *
 * @example
 * ```ts
 * capitalize("hello"); // "Hello"
 * capitalize("HELLO"); // "Hello"
 * ```
 */
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

/**
 * Generates a random alphanumeric string of the given length.
 *
 * Uses characters `[A-Za-z0-9]`.
 *
 * @param length - The desired string length.
 * @returns A random string.
 *
 * @example
 * ```ts
 * randomString(8); // "aB3xK9mQ"
 * ```
 */
export const randomString = (length: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

/**
 * Lowercases the first character of a string, leaving the rest unchanged.
 *
 * @param str - The input string.
 * @returns The string with the first character lowercased.
 *
 * @example
 * ```ts
 * decapitalize("Hello"); // "hello"
 * decapitalize("HELLO"); // "hELLO"
 * decapitalize(""); // ""
 * ```
 */
export const decapitalize = (str: string): string => str.charAt(0).toLowerCase() + str.slice(1);

/**
 * Reverses the string.
 *
 * @param str - The input string.
 * @returns The reversed string.
 *
 * @example
 * ```ts
 * reverse("hello"); // "olleh"
 * reverse(""); // ""
 * ```
 */
export const reverse = (str: string): string => [...str].reverse().join("");

/**
 * Pads the start of a string. Thin wrapper around `String.prototype.padStart`.
 *
 * @param str - The input string.
 * @param length - The target length.
 * @param padString - The string to pad with (default: `" "`).
 * @returns The padded string.
 *
 * @example
 * ```ts
 * padStart("42", 5, "0"); // "00042"
 * ```
 */
export const padStart = (str: string, length: number, padString?: string): string =>
  str.padStart(length, padString);

/**
 * Pads the end of a string. Thin wrapper around `String.prototype.padEnd`.
 *
 * @param str - The input string.
 * @param length - The target length.
 * @param padString - The string to pad with (default: `" "`).
 * @returns The padded string.
 *
 * @example
 * ```ts
 * padEnd("42", 5, "-"); // "42---"
 * ```
 */
export const padEnd = (str: string, length: number, padString?: string): string =>
  str.padEnd(length, padString);

/**
 * Wraps text at the given width, breaking at word boundaries where possible.
 * Words longer than the width are split mid-word.
 *
 * @param str - The input string.
 * @param width - The maximum line width.
 * @returns The wrapped string with lines joined by `"\n"`.
 *
 * @example
 * ```ts
 * wrap("hello world foo", 9); // "hello\nworld foo"
 * wrap("abcdefghij", 4); // "abcd\nefgh\nij"
 * ```
 */
export const wrap = (str: string, width: number): string => {
  const words = str.split(/\s+/);
  if (words.length === 0 || words[0] === "") return "";
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (current.length === 0) {
      // First word on a new line
      if (word.length > width) {
        let remaining = word;
        while (remaining.length > width) {
          lines.push(remaining.slice(0, width));
          remaining = remaining.slice(width);
        }
        current = remaining;
      } else {
        current = word;
      }
    } else if (current.length + 1 + word.length <= width) {
      current += " " + word;
    } else {
      lines.push(current);
      if (word.length > width) {
        let remaining = word;
        while (remaining.length > width) {
          lines.push(remaining.slice(0, width));
          remaining = remaining.slice(width);
        }
        current = remaining;
      } else {
        current = word;
      }
    }
  }
  if (current.length > 0) lines.push(current);
  return lines.join("\n");
};

/**
 * Returns the UTF-8 byte length of a string.
 *
 * @param str - The input string.
 * @returns The number of bytes in the UTF-8 encoding.
 *
 * @example
 * ```ts
 * byteLength("hello"); // 5
 * byteLength("你好"); // 6
 * ```
 */
export const byteLength = (str: string): number => new TextEncoder().encode(str).length;
