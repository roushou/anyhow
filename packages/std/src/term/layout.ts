import { stripAnsi } from "./ansi.js";

/**
 * Formats an array of strings into aligned columns, like `ls` output.
 * Automatically calculates the optimal number of columns to fit within
 * `maxWidth`. ANSI escape codes are ignored for width measurement.
 *
 * @param items - The strings to arrange in columns.
 * @param maxWidth - Maximum total width per row.
 * @returns Column-formatted text.
 *
 * @example
 * ```ts
 * const files = ["index.ts", "README.md", "package.json", "build.ts"];
 * console.log(columns(files, 40));
 * // index.ts      package.json
 * // README.md     build.ts
 * ```
 */
export function columns(items: string[], maxWidth: number): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;

  // Find the widest item
  let colWidth = 0;
  for (const item of items) {
    const w = stripAnsi(item).length;
    if (w > colWidth) colWidth = w;
  }
  colWidth += 2; // gutter between columns

  // How many columns can fit?
  const numCols = Math.max(1, Math.floor(maxWidth / colWidth));

  // Single column: just join, no padding
  if (numCols === 1) return items.join("\n");
  const numRows = Math.ceil(items.length / numCols);

  const out: string[] = [];
  for (let row = 0; row < numRows; row++) {
    const line: string[] = [];
    for (let col = 0; col < numCols; col++) {
      const idx = col * numRows + row;
      if (idx < items.length) {
        const item = items[idx]!;
        const visibleLen = stripAnsi(item).length;
        line.push(item + " ".repeat(colWidth - visibleLen));
      }
    }
    out.push(line.join(""));
  }
  return out.join("\n");
}
