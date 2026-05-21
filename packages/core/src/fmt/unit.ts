// ── filesize ──

interface FilesizeOpts {
  binary?: boolean;
  decimals?: number;
}

const DECIMAL = ["B", "KB", "MB", "GB", "TB", "PB", "EB"] as const;
const BINARY = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"] as const;

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
  maxParts?: number;
}

const BREAKPOINTS: { unit: string; ms: number }[] = [
  { unit: "d", ms: 86_400_000 },
  { unit: "h", ms: 3_600_000 },
  { unit: "m", ms: 60_000 },
  { unit: "s", ms: 1_000 },
  { unit: "ms", ms: 1 },
];

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

// ── ordinal ──

/** Formats a number as an ordinal (1st, 2nd, 3rd, 4th, …). */
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

/** Formats a number in compact notation (1.2K, 3.4M, …). */
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
