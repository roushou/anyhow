// ── filesize ──

interface FilesizeOpts {
  /** Use base-2 units (KiB, MiB, …) instead of base-10 (KB, MB, …). */
  binary?: boolean;
  /** Number of decimal places.  Defaults to `1`. */
  decimals?: number;
}

const DECIMAL = ["B", "KB", "MB", "GB", "TB", "PB", "EB"] as const;
const BINARY = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"] as const;

/**
 * Format a byte count as a human-readable string.
 *
 * @param bytes - The number of bytes.
 * @param opts.binary - Use base-2 units (KiB, MiB) instead of base-10 (KB, MB).
 * @param opts.decimals - Number of decimal places (default: `1`).
 * @returns A human-readable filesize string.
 *
 * @example
 * ```ts
 * filesize(1_500_000);                 // "1.5 MB"
 * filesize(1_500_000, { binary: true }); // "1.4 MiB"
 * ```
 */
export function filesize(bytes: number, opts?: FilesizeOpts): string {
  const { binary = false, decimals = 1 } = opts ?? {};
  const units = binary ? BINARY : DECIMAL;
  const base = binary ? 1024 : 1000;
  if (bytes < 0) bytes = -bytes;
  if (bytes === 0) return "0 B";
  let i = 0;
  let v = bytes;
  while (v >= base && i < units.length - 1) {
    v /= base;
    i++;
  }
  const rounded = parseFloat(v.toFixed(decimals));
  return `${rounded} ${units[i]}`;
}

// ── duration ──

interface DurationOpts {
  /** Maximum number of unit parts to show.  Defaults to `Infinity`. */
  maxParts?: number;
}

const BREAKPOINTS: { unit: string; ms: number }[] = [
  { unit: "d", ms: 86_400_000 },
  { unit: "h", ms: 3_600_000 },
  { unit: "m", ms: 60_000 },
  { unit: "s", ms: 1_000 },
  { unit: "ms", ms: 1 },
];

/**
 * Format a millisecond duration as a human-readable string.
 *
 * @param ms - The duration in milliseconds.
 * @param opts.maxParts - Maximum number of unit parts to show (default: `Infinity`).
 * @returns A human-readable duration string.
 *
 * @example
 * ```ts
 * duration(3_661_000);              // "1h 1m 1s"
 * duration(3_661_000, { maxParts: 2 }); // "1h 1m"
 * ```
 */
export function duration(ms: number, opts?: DurationOpts): string {
  const { maxParts = Infinity } = opts ?? {};
  if (ms < 0) ms = -ms;
  if (ms === 0) return "0ms";
  const parts: string[] = [];
  let remaining = ms;
  for (const { unit, ms: bp } of BREAKPOINTS) {
    if (parts.length >= maxParts) break;
    if (remaining >= bp || (unit === "ms" && parts.length === 0)) {
      const count = unit === "ms" ? Math.round(remaining) : Math.floor(remaining / bp);
      if (count > 0 || (unit === "ms" && parts.length === 0)) {
        parts.push(`${count}${unit}`);
        remaining -= count * bp;
      }
    }
  }
  return parts.join(" ");
}

// ── durationMs ──

/**
 * Format a millisecond duration as a compact string with no spaces ("1h2m3s").
 * Zero-value units are omitted unless the duration is `0`.
 *
 * @param ms - The duration in milliseconds.
 * @returns A compact duration string.
 *
 * @example
 * ```ts
 * durationMs(3_661_000); // "1h1m1s"
 * durationMs(500);      // "500ms"
 * ```
 */
export function durationMs(ms: number): string {
  if (ms < 0) ms = -ms;
  if (ms === 0) return "0ms";
  const parts: string[] = [];
  let remaining = ms;
  for (const { unit, ms: bp } of BREAKPOINTS) {
    if (remaining >= bp || (unit === "ms" && parts.length === 0)) {
      const count = unit === "ms" ? Math.round(remaining) : Math.floor(remaining / bp);
      if (count > 0) {
        parts.push(`${count}${unit}`);
        remaining -= count * bp;
      }
    }
  }
  return parts.join("");
}

// ── percentage ──

/**
 * Formats a ratio as a percentage string (e.g. `0.42` → `"42%"`).
 *
 * @param value - The ratio (e.g. `0.42` for 42%).
 * @param decimals - Number of decimal places (default: `0`).
 * @returns A percentage string.
 *
 * @example
 * ```ts
 * percentage(0.42);     // "42%"
 * percentage(0.123, 1); // "12.3%"
 * ```
 */
export function percentage(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// ── ordinal ──

/**
 * Formats a number as an ordinal (1st, 2nd, 3rd, 4th, …).
 *
 * @param n - The number to format.
 * @returns The ordinal string.
 *
 * @example
 * ```ts
 * ordinal(1);  // "1st"
 * ordinal(2);  // "2nd"
 * ordinal(21); // "21st"
 * ```
 */
export function ordinal(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

// ── compact ──

const COMPACT_SUFFIXES = ["", "K", "M", "B", "T"];

/**
 * Formats a number in compact notation (1.2K, 3.4M, …).
 *
 * @param n - The number to format.
 * @returns The compact string.
 *
 * @example
 * ```ts
 * compact(1_234);     // "1.2K"
 * compact(1_234_567); // "1.2M"
 * ```
 */
export function compact(n: number): string {
  if (n === 0) return "0";
  const sign = n < 0 ? "-" : "";
  let v = Math.abs(n);
  let i = 0;
  while (v >= 1000 && i < COMPACT_SUFFIXES.length - 1) {
    v /= 1000;
    i++;
  }
  const rounded = Math.round(v * 10) / 10;
  return `${sign}${rounded}${COMPACT_SUFFIXES[i]}`;
}

// ── durationHuman ──

const HUMAN_UNITS: { unit: string; ms: number }[] = [
  { unit: "day", ms: 86_400_000 },
  { unit: "hour", ms: 3_600_000 },
  { unit: "minute", ms: 60_000 },
  { unit: "second", ms: 1_000 },
];

/**
 * Formats a millisecond duration as a long-form human-readable string
 * ("1 hour, 2 minutes, 30 seconds"). Zero-value units are omitted.
 *
 * @param ms - The duration in milliseconds.
 * @returns A long-form duration string, or `"0 seconds"` for zero.
 *
 * @example
 * ```ts
 * durationHuman(3_661_000); // "1 hour, 1 minute, 1 second"
 * durationHuman(500);       // "500 milliseconds"
 * durationHuman(0);         // "0 seconds"
 * ```
 */
export function durationHuman(ms: number): string {
  if (ms < 0) ms = -ms;
  if (ms === 0) return "0 seconds";
  if (ms < 1000) return `${ms} millisecond${ms === 1 ? "" : "s"}`;

  const parts: string[] = [];
  let remaining = ms;

  for (const { unit, ms: bp } of HUMAN_UNITS) {
    if (remaining >= bp) {
      const count = Math.floor(remaining / bp);
      parts.push(`${count} ${unit}${count === 1 ? "" : "s"}`);
      remaining -= count * bp;
    }
  }

  return parts.join(", ");
}
