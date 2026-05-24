/**
 * Log severity level.  Messages below the configured level are suppressed.
 *
 * Levels are ordered numerically so you can compare with `<` / `>`:
 * `LogLevel.Debug < LogLevel.Info < LogLevel.Warn < LogLevel.Error < LogLevel.Silent`
 */
export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  Silent = 4,
}

/**
 * Human-readable label for a {@link LogLevel}.
 *
 * @param level - The log level.
 * @returns A lowercase label: `"debug"`, `"info"`, `"warn"`, or `"error"`.
 *
 * @example
 * ```ts
 * levelLabel(LogLevel.Warn); // "warn"
 * ```
 */
export function levelLabel(level: LogLevel): string {
  switch (level) {
    case LogLevel.Debug:
      return "debug";
    case LogLevel.Info:
      return "info";
    case LogLevel.Warn:
      return "warn";
    case LogLevel.Error:
      return "error";
    default:
      return "unknown";
  }
}

/**
 * Reads a log level from an environment variable, falling back to a default.
 *
 * Accepts both numeric values and case-insensitive names:
 * `"0"`, `"debug"`, `"1"`, `"info"`, `"2"`, `"warn"`, `"3"`, `"error"`.
 *
 * @param envVar - The environment variable name (e.g. `"LOG_LEVEL"`).
 * @param fallback - The default level if the env var is unset or invalid.
 * @returns A {@link LogLevel}.
 *
 * @example
 * ```ts
 * const level = envLevel("LOG_LEVEL", LogLevel.Info);
 * ```
 */
export function envLevel(envVar: string, fallback: LogLevel): LogLevel {
  if (typeof process === "undefined") return fallback;
  const raw = process.env[envVar];
  if (raw === undefined || raw === "") return fallback;

  const nameMap: Record<string, LogLevel> = {
    "0": LogLevel.Debug,
    debug: LogLevel.Debug,
    "1": LogLevel.Info,
    info: LogLevel.Info,
    "2": LogLevel.Warn,
    warn: LogLevel.Warn,
    "3": LogLevel.Error,
    error: LogLevel.Error,
  };

  const normalized = raw.trim().toLowerCase();
  return nameMap[normalized] ?? fallback;
}
