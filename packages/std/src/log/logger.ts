import { LogLevel, levelLabel } from "./levels.js";

// ── Types ──

/**
 * A structured log event produced by the {@link Logger}.
 *
 * @property level - The severity level.
 * @property scope - Dot-separated logger scope (e.g. `"my-app:auth"`).
 * @property message - The log message string.
 * @property timestamp - When the event was created.
 * @property context - A map of additional key-value data attached to the event.
 */
export interface LogEntry {
  level: LogLevel;
  scope: string;
  message: string;
  timestamp: Date;
  context: Record<string, unknown>;
}

/**
 * Transforms a {@link LogEntry} into a string for output.
 *
 * Implementations should be **pure** — they receive a log entry and return a
 * formatted string without side effects.
 */
export interface Formatter {
  format(entry: LogEntry): string;
}

/**
 * Receives formatted log output.
 *
 * A sink writes a formatted string (and the original {@link LogEntry}) to a
 * destination such as `console`, a file, or a remote service.
 */
export interface Sink {
  write(formatted: string, entry: LogEntry): void;
}

// ── Defaults ──

const defaultFormatter: Formatter = {
  format(entry: LogEntry): string {
    const ts = entry.timestamp.toISOString();
    const lvl = levelLabel(entry.level).toUpperCase();
    const scope = `[${entry.scope}]`;
    const ctx = Object.keys(entry.context).length > 0 ? " " + JSON.stringify(entry.context) : "";
    return `${ts} ${lvl.padEnd(5)} ${scope} ${entry.message}${ctx}`;
  },
};

const defaultSink: Sink = {
  write(formatted: string, entry: LogEntry): void {
    const fn =
      entry.level >= LogLevel.Error
        ? console.error
        : entry.level >= LogLevel.Warn
          ? console.warn
          : entry.level >= LogLevel.Info
            ? console.log
            : console.debug;
    fn(formatted);
  },
};

// ── Options ──

/**
 * Options for constructing a {@link Logger}.
 */
export interface LoggerOpts {
  /** Minimum level to output.  Defaults to {@link LogLevel.Info}. */
  level?: LogLevel;
  /** Formatter for log entries.  Defaults to a plain-text formatter. */
  formatter?: Formatter;
  /** Initial sinks.  Defaults to a single `console` sink. */
  sinks?: Sink[];
}

// ── Logger ──

/**
 * A structured, leveled logger with pluggable formatters and sinks.
 *
 * Create a root logger for your application and use {@link Logger.child} to
 * create scoped loggers with inherited context:
 *
 * ```ts
 * const log = new Logger("app", { level: LogLevel.Debug });
 * const db = log.child("db", { pool: "main" });
 * db.info("connected");  // scope: "app:db", context: { pool: "main" }
 * ```
 */
export class Logger {
  readonly scope: string;
  #level: LogLevel;
  #formatter: Formatter;
  #sinks: Sink[];
  #context: Record<string, unknown>;

  constructor(scope: string, opts: LoggerOpts = {}) {
    this.scope = scope;
    this.#level = opts.level ?? LogLevel.Info;
    this.#formatter = opts.formatter ?? defaultFormatter;
    this.#sinks = [...(opts.sinks ?? [defaultSink])];
    this.#context = {};
  }

  // ── Configuration ──

  /**
   * Sets the minimum log level.  Messages below this level are suppressed.
   *
   * @param level - The new minimum level.
   * @returns `this` for chaining.
   */
  setLevel(level: LogLevel): this {
    this.#level = level;
    return this;
  }

  /**
   * Sets the formatter used to convert log entries into strings.
   *
   * @param formatter - The formatter to use.
   * @returns `this` for chaining.
   */
  setFormatter(formatter: Formatter): this {
    this.#formatter = formatter;
    return this;
  }

  /**
   * Adds a sink.  The logger will write formatted output to every registered sink.
   *
   * @param sink - The sink to add.
   * @returns `this` for chaining.
   */
  addSink(sink: Sink): this {
    this.#sinks.push(sink);
    return this;
  }

  // ── Child loggers ──

  /**
   * Creates a child logger with an extended scope and inherited context.
   *
   * The child's scope is `"parentScope:childScope"` and its context is merged
   * with the parent's (child keys override parent keys on collision).
   *
   * @param subScope - The sub-scope to append.
   * @param context - Additional context merged into the parent's.
   * @returns A new {@link Logger} instance sharing the parent's level, formatter, and sinks.
   *
   * @example
   * ```ts
   * const log = new Logger("api");
   * const auth = log.child("auth", { tenant: "acme" });
   * auth.info("login", { userId: "u1" });
   * // scope: "api:auth", context: { tenant: "acme", userId: "u1" }
   * ```
   */
  child(subScope: string, context: Record<string, unknown> = {}): Logger {
    const child = new Logger(`${this.scope}:${subScope}`, {
      level: this.#level,
      formatter: this.#formatter,
      sinks: [...this.#sinks],
    });
    child.#context = { ...this.#context, ...context };
    return child;
  }

  // ── Logging ──

  /**
   * Logs a message at {@link LogLevel.Debug}.
   *
   * @param message - The log message.
   * @param context - Optional structured data attached to the log entry.
   *
   * @example
   * ```ts
   * log.debug("cache hit", { key: "user:42", ttl: 58 });
   * ```
   */
  debug(message: string, context: Record<string, unknown> = {}): void {
    this.#log(LogLevel.Debug, message, context);
  }

  /**
   * Logs a message at {@link LogLevel.Info}.
   *
   * @param message - The log message.
   * @param context - Optional structured data attached to the log entry.
   *
   * @example
   * ```ts
   * log.info("server started", { port: 3000 });
   * ```
   */
  info(message: string, context: Record<string, unknown> = {}): void {
    this.#log(LogLevel.Info, message, context);
  }

  /**
   * Logs a message at {@link LogLevel.Warn}.
   *
   * @param message - The log message.
   * @param context - Optional structured data attached to the log entry.
   *
   * @example
   * ```ts
   * log.warn("rate limit approaching", { current: 95, limit: 100 });
   * ```
   */
  warn(message: string, context: Record<string, unknown> = {}): void {
    this.#log(LogLevel.Warn, message, context);
  }

  /**
   * Logs a message at {@link LogLevel.Error}.
   *
   * If `errorOrContext` is an `Error`, its `name`, `message`, and `stack` are
   * automatically captured into the log context.  Otherwise it is treated as a
   * normal context record.
   *
   * @param message - The log message.
   * @param errorOrContext - An `Error` instance, or a context record.
   *
   * @example
   * ```ts
   * log.error("db connection lost", new Error("ECONNREFUSED"));
   * log.error("validation failed", { field: "email", reason: "invalid" });
   * ```
   */
  error(message: string, errorOrContext?: Error | Record<string, unknown>): void {
    const ctx =
      errorOrContext instanceof Error ? errorToContext(errorOrContext) : (errorOrContext ?? {});
    this.#log(LogLevel.Error, message, ctx);
  }

  // ── Internals ──

  #log(level: LogLevel, message: string, context: Record<string, unknown>): void {
    if (level < this.#level) return;

    const entry: LogEntry = {
      level,
      scope: this.scope,
      message,
      timestamp: new Date(),
      context: { ...this.#context, ...context },
    };

    const formatted = this.#formatter.format(entry);
    for (const sink of this.#sinks) {
      sink.write(formatted, entry);
    }
  }
}

// ── Helpers ──

function errorToContext(err: Error): Record<string, unknown> {
  return {
    error: {
      name: err.name,
      message: err.message,
      ...(err.stack ? { stack: err.stack } : {}),
    },
  };
}
