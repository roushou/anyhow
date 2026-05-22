// ── ANSI escape code tables ──────────────────────────────────────────────────

const FG: Record<string, number> = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  gray: 90,
};

const BG: Record<string, number> = {
  bgBlack: 40,
  bgRed: 41,
  bgGreen: 42,
  bgYellow: 43,
  bgBlue: 44,
  bgMagenta: 45,
  bgCyan: 46,
  bgWhite: 47,
};

const MOD: Record<string, [number, number]> = {
  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  strikethrough: [9, 29],
  inverse: [7, 27],
  hidden: [8, 28],
};

interface StyleState {
  opens: string[];
  closes: string[];
}

function makeStyle(base?: StyleState): any {
  const opens = base ? [...base.opens] : [];
  const closes = base ? [...base.closes] : [];

  const fn: any = (text: string): string => {
    if (opens.length === 0) return text;
    return `\x1b[${opens.join(";")}m${text}\x1b[${closes.join(";")}m`;
  };

  for (const name of Object.keys(FG)) {
    const code = String(FG[name]!);
    Object.defineProperty(fn, name, {
      get: () => makeStyle({ opens: [...opens, code], closes: [...closes, "39"] }),
      enumerable: true,
      configurable: true,
    });
  }

  for (const name of Object.keys(BG)) {
    const code = String(BG[name]!);
    Object.defineProperty(fn, name, {
      get: () => makeStyle({ opens: [...opens, code], closes: [...closes, "49"] }),
      enumerable: true,
      configurable: true,
    });
  }

  for (const name of Object.keys(MOD)) {
    const [open, close] = MOD[name]!;
    Object.defineProperty(fn, name, {
      get: () => makeStyle({ opens: [...opens, String(open)], closes: [...closes, String(close)] }),
      enumerable: true,
      configurable: true,
    });
  }

  fn.rgb = (r: number, g: number, b: number) =>
    makeStyle({ opens: [...opens, `38;2;${r};${g};${b}`], closes: [...closes, "39"] });

  fn.hex = (hex: string) => {
    const { r, g, b } = parseHex(hex);
    return makeStyle({ opens: [...opens, `38;2;${r};${g};${b}`], closes: [...closes, "39"] });
  };

  return fn;
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  let h = hex.replace(/^#/, "");
  if (h.length === 3) h = h[0]! + h[0] + h[1]! + h[1] + h[2]! + h[2];
  if (h.length !== 6) throw new Error(`Invalid hex color: ${hex}`);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) throw new Error(`Invalid hex color: ${hex}`);
  return { r, g, b };
}

/**
 * A chainable ANSI style builder.
 *
 * Access a color or modifier as a property to queue it, then call the result
 * with a string to produce the styled output.
 *
 * @example
 * ```ts
 * style.red("error")                       // "\x1b[31merror\x1b[39m"
 * style.bold.red("critical")               // "\x1b[1m\x1b[31mcritical\x1b[39m\x1b[22m"
 * style.bgBlue.white("info")               // blue background, white text
 * style.rgb(255, 128, 0)("custom")         // 24-bit true color
 * style.hex("#ff8800")("custom")           // hex-based true color
 * ```
 */
export const style = makeStyle();

// ── stripAnsi ────────────────────────────────────────────────────────────────

// eslint-disable-next-line no-control-regex
const STRIP_ANSI_RE = /\u001b\[[\d;]*[A-Za-z]/g;

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
export const stripAnsi = (str: string): string => str.replace(STRIP_ANSI_RE, "");

/**
 * Returns the visible (non-ANSI) character width of a string.
 */
export const visibleWidth = (str: string): number => stripAnsi(str).length;

// ── supportsColor ────────────────────────────────────────────────────────────

/**
 * Detects whether the current terminal supports ANSI colors.
 *
 * Respects the standard environment variables:
 * - `NO_COLOR` — disables color if set to any value
 * - `FORCE_COLOR` — enables color if set to any value
 * - Falls back to TTY detection
 *
 * @returns `true` if color output is supported.
 *
 * @example
 * ```ts
 * if (supportsColor()) {
 *   console.log(style.green("✓ done"));
 * }
 * ```
 */
export function supportsColor(): boolean {
  if (typeof process === "undefined" || !process.stdout) return false;
  if (process.env.NO_COLOR !== undefined) return false;
  if (process.env.FORCE_COLOR !== undefined) return true;
  if (process.env.CI !== undefined) return true;
  return process.stdout.isTTY === true;
}
