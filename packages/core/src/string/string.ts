// ── Character predicates ──────────────────────────────────────────

const isUpper = (ch: string): boolean => ch >= "A" && ch <= "Z";
const isLower = (ch: string): boolean => ch >= "a" && ch <= "z";
const isDigit = (ch: string): boolean => ch >= "0" && ch <= "9";
const isAlpha = (ch: string): boolean => isUpper(ch) || isLower(ch);
const isAlphanumeric = (ch: string): boolean => isAlpha(ch) || isDigit(ch);

// ── Word splitting ───────────────────────────────────────────────

/**
 * Splits a string into word tokens using case transitions and
 * non-alphanumeric characters as boundaries.
 */
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

// ── Case conversion helpers ──────────────────────────────────────

const toCamel = (words: string[]): string =>
  words
    .map((w, i) => (i === 0 ? w.toLowerCase() : w[0]!.toUpperCase() + w.slice(1).toLowerCase()))
    .join("");

const toPascal = (words: string[]): string =>
  words.map((w) => w[0]!.toUpperCase() + w.slice(1).toLowerCase()).join("");

const toDelimited = (words: string[], sep: string): string =>
  words.map((w) => w.toLowerCase()).join(sep);

// ── Public API ───────────────────────────────────────────────────

/**
 * Converts a string to `camelCase`.
 *
 * Word boundaries are detected at lowercase→uppercase, letter→digit,
 * digit→letter, and non-alphanumeric characters.
 *
 * @param str - The input string.
 * @returns The camelCased string.
 *
 * @example
 * ```ts
 * camelCase("hello-world");   // "helloWorld"
 * camelCase("hello world");   // "helloWorld"
 * camelCase("helloWorld");    // "helloWorld"
 * camelCase("HelloWorld");    // "helloWorld"
 * ```
 */
export const camelCase = (str: string): string => toCamel(splitWords(str));

/**
 * Converts a string to `PascalCase`.
 *
 * @param str - The input string.
 * @returns The PascalCased string.
 *
 * @example
 * ```ts
 * pascalCase("hello-world");  // "HelloWorld"
 * pascalCase("helloWorld");   // "HelloWorld"
 * ```
 */
export const pascalCase = (str: string): string => toPascal(splitWords(str));

/**
 * Converts a string to `snake_case`.
 *
 * @param str - The input string.
 * @returns The snake_cased string.
 *
 * @example
 * ```ts
 * snakeCase("helloWorld");    // "hello_world"
 * snakeCase("HelloWorld");    // "hello_world"
 * snakeCase("hello-world");   // "hello_world"
 * ```
 */
export const snakeCase = (str: string): string => toDelimited(splitWords(str), "_");

/**
 * Converts a string to `kebab-case`.
 *
 * @param str - The input string.
 * @returns The kebab-cased string.
 *
 * @example
 * ```ts
 * kebabCase("helloWorld");    // "hello-world"
 * kebabCase("HelloWorld");    // "hello-world"
 * kebabCase("hello_world");   // "hello-world"
 * ```
 */
export const kebabCase = (str: string): string => toDelimited(splitWords(str), "-");

/**
 * Creates a URL-friendly slug from a string.
 *
 * Lowercases, replaces non-alphanumeric runs with a single hyphen,
 * and trims leading / trailing hyphens.
 *
 * @param str - The input string.
 * @returns The slugified string.
 *
 * @example
 * ```ts
 * slugify("Hello World!");    // "hello-world"
 * slugify("  Foo & Bar  ");   // "foo-bar"
 * slugify("a---b");           // "a-b"
 * ```
 */
export const slugify = (str: string): string =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Removes the common leading whitespace from every line.
 *
 * Empty lines are ignored when computing the common indent.
 *
 * @param str - The input string.
 * @returns The dedented string.
 *
 * @example
 * ```ts
 * stripIndent("  hello\n  world");       // "hello\nworld"
 * stripIndent("  hello\n    world");     // "hello\n  world"
 * stripIndent("hello\nworld");           // "hello\nworld"
 * ```
 */
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

/**
 * Substitutes `{{key}}` placeholders in a template string with values.
 *
 * Throws if a referenced key is missing from `values`.
 *
 * @param str - The template string containing `{{key}}` placeholders.
 * @param values - A map of placeholder keys to replacement values.
 * @returns The interpolated string.
 *
 * @example
 * ```ts
 * template("Hello {{name}}!", { name: "Alice" });  // "Hello Alice!"
 * template("{{a}} + {{b}}", { a: 1, b: 2 });       // "1 + 2"
 * ```
 */
export const template = (str: string, values: Record<string, string | number>): string =>
  str.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (!(key in values)) {
      throw new Error(`Missing template key: "${key}"`);
    }
    return String(values[key]!);
  });
