/**
 * Options for {@link progress}.
 */
export interface ProgressOpts {
  /** Character style for the bar. Defaults to `"bar"`. */
  style?: "bar" | "dot";
  /** Label shown to the left of the bar. */
  left?: string;
  /** Label shown to the right of the bar. */
  right?: string;
}

const BAR_CHARS = [" ", "▏", "▎", "▍", "▌", "▋", "▊", "▉", "█"];

/**
 * Renders a stateless progress bar string.  You manage the state; this
 * handles the rendering.
 *
 * @param ratio - Progress as a value between 0 and 1.
 * @param width - Total width of the bar in characters (excluding labels).
 * @param opts - See {@link ProgressOpts}.
 * @returns The rendered progress bar string.
 *
 * @example
 * ```ts
 * for (let i = 0; i <= 100; i++) {
 *   process.stdout.write(`\r${progress(i / 100, 30)}`);
 *   await sleep(50);
 * }
 * process.stdout.write("\n");
 * ```
 */
export function progress(ratio: number, width: number, opts?: ProgressOpts): string {
  const clamped = Math.max(0, Math.min(1, ratio));
  const char = opts?.style === "dot" ? "•" : "█";
  const empty = opts?.style === "dot" ? "·" : "─";
  const pct = Math.round(clamped * 100);

  let bar: string;
  if (opts?.style === "dot") {
    const filled = Math.round(clamped * width);
    bar = char.repeat(filled) + empty.repeat(width - filled);
  } else {
    const totalTicks = width * 8;
    const ticks = Math.round(clamped * totalTicks);
    const full = Math.floor(ticks / 8);
    const partial = ticks % 8;
    bar =
      char.repeat(full) + (BAR_CHARS[partial] ?? "") + empty.repeat(Math.max(0, width - full - 1));
  }

  const parts: string[] = [];
  if (opts?.left) parts.push(opts.left);
  parts.push(bar);
  parts.push(`${pct}%`);
  if (opts?.right) parts.push(opts.right);

  return parts.join(" ");
}
