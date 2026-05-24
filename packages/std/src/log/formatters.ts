import type { Formatter, LogEntry } from "./logger.js";
import { levelLabel } from "./levels.js";
import { LogLevel } from "./levels.js";

/**
 * Options for {@link prettyFormatter}.
 */
export interface PrettyFormatterOpts {
  /** Whether to include ANSI color codes.  Defaults to `false`. */
  colors?: boolean;
  /** Include a full ISO timestamp.  Defaults to `true`. */
  timestamp?: boolean;
}

// ANSI codes (only used when `colors: true`)
const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const COLOR: Record<number, string> = {
  [LogLevel.Debug]: "\x1b[36m", // cyan
  [LogLevel.Info]: "\x1b[32m", // green
  [LogLevel.Warn]: "\x1b[33m", // yellow
  [LogLevel.Error]: "\x1b[31m", // red
};

/**
 * Creates a human-readable, colour-aware formatter.
 *
 * @param opts - Formatting options.
 * @param opts.colors - Enable ANSI colour output.  Defaults to `false`.
 * @param opts.timestamp - Include a timestamp.  Defaults to `true`.
 * @returns A {@link Formatter}.
 *
 * @example
 * ```ts
 * const fmt = prettyFormatter({ colors: true });
 * const log = new Logger("app", { formatter: fmt });
 * ```
 */
export function prettyFormatter(opts: PrettyFormatterOpts = {}): Formatter {
  const { colors = false, timestamp = true } = opts;

  return {
    format(entry: LogEntry): string {
      const lvl = levelLabel(entry.level).toUpperCase();
      const parts: string[] = [];

      if (timestamp) {
        const ts = entry.timestamp.toISOString();
        parts.push(colors ? `${DIM}${ts}${RESET}` : ts);
      }

      const label = colors ? `${COLOR[entry.level] ?? ""}${lvl.padEnd(5)}${RESET}` : lvl.padEnd(5);
      parts.push(label);

      parts.push(`[${entry.scope}]`);

      parts.push(entry.message);

      const keys = Object.keys(entry.context);
      if (keys.length > 0) {
        parts.push(
          colors ? `${DIM}${formatContext(entry.context)}${RESET}` : formatContext(entry.context),
        );
      }

      return parts.join(" ");
    },
  };
}

/**
 * Creates a single-line JSON formatter suitable for production log ingestion.
 *
 * @returns A {@link Formatter} that outputs one JSON object per line.
 *
 * @example
 * ```ts
 * const fmt = jsonFormatter();
 * const log = new Logger("api", { formatter: fmt });
 * ```
 */
export function jsonFormatter(): Formatter {
  return {
    format(entry: LogEntry): string {
      return JSON.stringify({
        level: levelLabel(entry.level),
        scope: entry.scope,
        msg: entry.message,
        ts: entry.timestamp.toISOString(),
        ...entry.context,
      });
    },
  };
}

// ── Helpers ──

function formatContext(ctx: Record<string, unknown>): string {
  const pairs = Object.entries(ctx)
    .map(([k, v]) => `${k}=${formatValue(v)}`)
    .join(" ");
  return pairs;
}

function formatValue(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  return JSON.stringify(v);
}
