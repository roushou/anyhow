import { style, stripAnsi } from "@anyhow/std/term";

// ── ANSI styles (re-export from @anyhow/std/term) ──

export const bold = style.bold;
export const dim = style.dim;
export const red = style.red;
export const green = style.green;
export const blue = style.blue;
export const yellow = style.yellow;
export { stripAnsi };

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
        .map((cell, i) => cell.padEnd((widths[i] ?? 0) + cell.length - stripAnsi(cell).length))
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
  return text
    .split("\n")
    .map((line) => line.padStart(line.length + spaces))
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
