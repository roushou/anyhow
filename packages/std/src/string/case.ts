// ── Runtime helpers ──

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

// ── Runtime case conversion ──

/**
 * Converts a string to `camelCase`.
 *
 * @param str - The input string.
 * @returns The camelCased string.
 *
 * @example
 * ```ts
 * camelCase("hello-world"); // "helloWorld"
 * camelCase("HelloWorld");  // "helloWorld"
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
 * pascalCase("hello-world"); // "HelloWorld"
 * pascalCase("helloWorld");  // "HelloWorld"
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
 * snakeCase("helloWorld");  // "hello_world"
 * snakeCase("HelloWorld");  // "hello_world"
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
 * kebabCase("helloWorld");  // "hello-world"
 * kebabCase("HelloWorld");  // "hello-world"
 * ```
 */
export const kebabCase = (str: string): string => toDelimited(splitWords(str), "-");

// ── Shared type-level helper ──

/**
 * @internal Shared helper that inserts a delimiter before uppercase→lowercase
 * transitions.  Parameterised by the delimiter (`"_"` or `"-"`).
 */
type DelimitCaseHelper<S extends string, D extends string> = S extends `${infer A}${infer Rest}`
  ? A extends Uppercase<A>
    ? A extends Lowercase<A>
      ? `${A}${DelimitCaseHelper<Rest, D>}`
      : Rest extends `${infer B}${string}`
        ? B extends Lowercase<B>
          ? B extends Uppercase<B>
            ? `${Lowercase<A>}${D}${DelimitCaseHelper<Rest, D>}`
            : `${D}${Lowercase<A>}${DelimitCaseHelper<Rest, D>}`
          : `${Lowercase<A>}${DelimitCaseHelper<Rest, D>}`
        : Lowercase<A>
    : `${A}${DelimitCaseHelper<Rest, D>}`
  : Lowercase<S>;

// ── Type-level case conversion ──

/**
 * Converts a string literal type to `snake_case`.
 *
 * Handles `camelCase` and `PascalCase`.  Already-delimited input passes
 * through unchanged.
 *
 * @typeParam S - The input string literal type.
 *
 * @example
 * ```ts
 * type A = SnakeCase<"helloWorld">;   // "hello_world"
 * type B = SnakeCase<"HelloWorld">;   // "hello_world"
 * type C = SnakeCase<"XMLParser">;    // "xml_parser"
 * ```
 */
export type SnakeCase<S extends string> =
  DelimitCaseHelper<S, "_"> extends `_${infer T}` ? T : DelimitCaseHelper<S, "_">;

/**
 * Converts a string literal type to `SCREAMING_SNAKE_CASE`.
 *
 * Equivalent to `Uppercase<SnakeCase<S>>`.
 *
 * @typeParam S - The input string literal type.
 *
 * @example
 * ```ts
 * type A = ScreamingSnakeCase<"helloWorld">; // "HELLO_WORLD"
 * type B = ScreamingSnakeCase<"HelloWorld">; // "HELLO_WORLD"
 * ```
 */
export type ScreamingSnakeCase<S extends string> = Uppercase<SnakeCase<S>>;

/**
 * Converts a string literal type to `kebab-case`.
 *
 * Handles `camelCase` and `PascalCase`.  Already-delimited input passes
 * through unchanged.
 *
 * @typeParam S - The input string literal type.
 *
 * @example
 * ```ts
 * type A = KebabCase<"helloWorld">;   // "hello-world"
 * type B = KebabCase<"HelloWorld">;   // "hello-world"
 * ```
 */
export type KebabCase<S extends string> =
  DelimitCaseHelper<S, "-"> extends `-${infer T}` ? T : DelimitCaseHelper<S, "-">;

/**
 * Converts a string literal type to `camelCase`.
 *
 * Splits on `_` and `-`, lowercases the first segment, and capitalizes
 * subsequent segments.
 *
 * @typeParam S - The input string literal type.
 *
 * @example
 * ```ts
 * type A = CamelCase<"hello_world">;  // "helloWorld"
 * type B = CamelCase<"kebab-case">;   // "kebabCase"
 * type C = CamelCase<"FOO_BAR_BAZ">;  // "fooBarBaz"
 * ```
 */
export type CamelCase<S extends string> = S extends `${infer A}_${infer B}`
  ? `${Lowercase<A>}${Capitalize<CamelCase<B>>}`
  : S extends `${infer A}-${infer B}`
    ? `${Lowercase<A>}${Capitalize<CamelCase<B>>}`
    : Lowercase<S>;

/**
 * Converts a string literal type to `PascalCase`.
 *
 * Splits on `_` and `-`, and capitalizes every segment (including the first).
 *
 * @typeParam S - The input string literal type.
 *
 * @example
 * ```ts
 * type A = PascalCase<"hello_world">; // "HelloWorld"
 * type B = PascalCase<"kebab-case">;  // "KebabCase"
 * ```
 */
export type PascalCase<S extends string> = Capitalize<CamelCase<S>>;
