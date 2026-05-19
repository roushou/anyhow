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
 * ```ts
 * filesize(1_500_000);                 // "1.5 MB"
 * filesize(1_500_000, { binary: true }); // "1.4 MiB"
 * filesize(42);                         // "42 B"
 * filesize(0);                          // "0 B"
 * ```
 */
export function filesize(bytes: number, opts?: FilesizeOpts): string {
  const { binary = false, decimals = 1 } = opts ?? {};
  const units = binary ? BINARY : DECIMAL;
  const base = binary ? 1024 : 1000;

  if (bytes < 0) bytes = -bytes;
  if (bytes === 0) return `0 B`;

  let i = 0;
  let v = bytes;
  while (v >= base && i < units.length - 1) {
    v /= base;
    i++;
  }

  // Round to the requested number of decimals, trimming trailing zeros
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
 * ```ts
 * duration(3_661_000);              // "1h 1m 1s"
 * duration(3_661_000, { maxParts: 2 }); // "1h 1m"
 * duration(500);                    // "500ms"
 * duration(0);                      // "0ms"
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
