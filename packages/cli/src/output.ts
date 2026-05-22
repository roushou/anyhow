import { lines, padStart, padEnd } from "@anyhow/std/string";

// ── ANSI styles ──

/**
 * Wraps text in bold ANSI escape codes.
 *
 * @param str - The text to bold.
 * @returns The bold-formatted string.
 *
 * @example
 * ```ts
 * bold("Error:"); // "\x1b[1mError:\x1b[22m"
 * ```
 */
export const bold = (str: string): string => `\x1b[1m${str}\x1b[22m`;

/**
 * Wraps text in dim ANSI escape codes.
 */
export const dim = (str: string): string => `\x1b[2m${str}\x1b[22m`;

/**
 * Wraps text in red ANSI escape codes.
 */
export const red = (str: string): string => `\x1b[31m${str}\x1b[39m`;

/**
 * Wraps text in green ANSI escape codes.
 */
export const green = (str: string): string => `\x1b[32m${str}\x1b[39m`;

/**
 * Wraps text in blue ANSI escape codes.
 */
export const blue = (str: string): string => `\x1b[34m${str}\x1b[39m`;

/**
 * Wraps text in yellow ANSI escape codes.
 */
export const yellow = (str: string): string => `\x1b[33m${str}\x1b[39m`;

/**
 * Strips all ANSI escape sequences from a string.
 *
 * @param str - The string to clean.
 * @returns The string with ANSI escapes removed.
 *
 * @example
 * ```ts
 * stripAnsi("\x1b[31merror\x1b[39m"); // "error"
 * ```
 */
// eslint-disable-next-line no-control-regex
const STRIP_ANSI_RE = /\u001b\[\d+m/g;

export const stripAnsi = (str: string): string => str.replace(STRIP_ANSI_RE, "");

// ── Layout helpers ──

/**
 * Formats a 2D string array as an aligned table.
 *
 * Column widths are computed from the visible (non-ANSI) content of each cell.
 *
 * @param rows - The table data as rows of cells.
 * @returns The formatted table string.
 *
 * @example
 * ```ts
 * table([["Name", "Age"], ["Alice", "30"], ["Bob", "25"]]);
 * ```
 */
export function table(rows: string[][]): string {
  if (rows.length === 0) return "";
  const cols = rows[0]!.length;
  const widths: number[] = Array<number>(cols).fill(0);
  for (const row of rows) {
    for (let i = 0; i < cols; i++) {
      widths[i] = Math.max(widths[i]!, stripAnsi(row[i] ?? "").length);
    }
  }
  return rows
    .map((row) =>
      row
        .map((cell, i) => padEnd(cell, (widths[i] ?? 0) + cell.length - stripAnsi(cell).length))
        .join("  "),
    )
    .join("\n");
}

/**
 * Indents every line of text by the given number of spaces.
 *
 * @param text - The text to indent.
 * @param spaces - Number of spaces to prepend.
 * @returns The indented string.
 *
 * @example
 * ```ts
 * indent("hello\nworld", 2); // "  hello\n  world"
 * ```
 */
export function indent(text: string, spaces: number): string {
  return lines(text)
    .map((line) => padStart(line, line.length + spaces))
    .join("\n");
}

/**
 * Draws a horizontal rule, optionally with a centered title.
 *
 * @param title - Optional title to center in the rule.
 * @returns The horizontal rule string.
 *
 * @example
 * ```ts
 * hr();           // "──────────────────…"
 * hr("Options");  // "────── Options ──────"
 * ```
 */
export function hr(title?: string): string {
  const width = process.stdout.columns || 80;
  if (!title) return "─".repeat(width);
  const dashes = width - title.length - 2;
  const left = Math.floor(dashes / 2);
  const right = dashes - left;
  return "─".repeat(left) + ` ${title} ` + "─".repeat(right);
}

/**
 * Draws a box around text using box-drawing characters.
 *
 * @param text - The text to wrap in a box.
 * @returns The boxed string.
 *
 * @example
 * ```ts
 * box("hello"); // "┌───────┐\n│ hello │\n└───────┘"
 * ```
 */
export function box(text: string): string {
  const lines = text.split("\n");
  const width = Math.max(...lines.map((l) => stripAnsi(l).length));
  const top = "┌" + "─".repeat(width + 2) + "┐";
  const bottom = "└" + "─".repeat(width + 2) + "┘";
  const middle = lines
    .map((l) => {
      const padded = l + " ".repeat(width - stripAnsi(l).length);
      return `│ ${padded} │`;
    })
    .join("\n");
  return [top, middle, bottom].join("\n");
}
