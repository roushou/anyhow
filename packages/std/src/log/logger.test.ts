import { describe, it, expect } from "bun:test";
import { Logger } from "./logger.js";
import { LogLevel, levelLabel, envLevel } from "./levels.js";
import { prettyFormatter, jsonFormatter } from "./formatters.js";
import { memorySink } from "./sinks.js";
import type { LogEntry } from "./logger.js";

// ── LogLevel ───────────────────────────────────────────────────────────────

describe("LogLevel", () => {
  it("orders numerically", () => {
    expect(LogLevel.Debug).toBe(0);
    expect(LogLevel.Info).toBe(1);
    expect(LogLevel.Warn).toBe(2);
    expect(LogLevel.Error).toBe(3);
    expect(LogLevel.Silent).toBe(4);
  });
});

describe("levelLabel", () => {
  it("returns lowercase labels", () => {
    expect(levelLabel(LogLevel.Debug)).toBe("debug");
    expect(levelLabel(LogLevel.Info)).toBe("info");
    expect(levelLabel(LogLevel.Warn)).toBe("warn");
    expect(levelLabel(LogLevel.Error)).toBe("error");
  });

  it('returns "unknown" for out-of-range levels', () => {
    expect(levelLabel(99 as LogLevel)).toBe("unknown");
  });
});

describe("envLevel", () => {
  it("returns fallback when env var is unset", () => {
    delete process.env.TEST_LOG_LEVEL;
    expect(envLevel("TEST_LOG_LEVEL", LogLevel.Info)).toBe(LogLevel.Info);
  });

  it("parses numeric string values", () => {
    process.env.TEST_LOG_LEVEL = "0";
    expect(envLevel("TEST_LOG_LEVEL", LogLevel.Info)).toBe(LogLevel.Debug);
    process.env.TEST_LOG_LEVEL = "3";
    expect(envLevel("TEST_LOG_LEVEL", LogLevel.Info)).toBe(LogLevel.Error);
  });

  it("parses named values case-insensitively", () => {
    process.env.TEST_LOG_LEVEL = "DEBUG";
    expect(envLevel("TEST_LOG_LEVEL", LogLevel.Info)).toBe(LogLevel.Debug);

    process.env.TEST_LOG_LEVEL = "warn";
    expect(envLevel("TEST_LOG_LEVEL", LogLevel.Info)).toBe(LogLevel.Warn);
  });

  it("falls back on invalid values", () => {
    process.env.TEST_LOG_LEVEL = "verbose";
    expect(envLevel("TEST_LOG_LEVEL", LogLevel.Error)).toBe(LogLevel.Error);
  });

  it("falls back on empty string", () => {
    process.env.TEST_LOG_LEVEL = "";
    expect(envLevel("TEST_LOG_LEVEL", LogLevel.Debug)).toBe(LogLevel.Debug);
  });
});

// ── Logger ──────────────────────────────────────────────────────────────────

describe("Logger", () => {
  it("creates a logger with a scope", () => {
    const log = new Logger("test");
    expect(log.scope).toBe("test");
  });

  it("defaults to LogLevel.Info", () => {
    const { sink, logs } = memorySink();
    const log = new Logger("test", { sinks: [sink] });

    log.debug("hidden");
    log.info("visible");

    expect(logs.length).toBe(1);
    expect(logs[0]).toContain("visible");
  });

  it("respects custom level", () => {
    const { sink, logs } = memorySink();
    const log = new Logger("test", { level: LogLevel.Debug, sinks: [sink] });

    log.debug("shown");
    expect(logs.length).toBe(1);
    expect(logs[0]).toContain("shown");
  });

  it("suppresses all messages at Silent level", () => {
    const { sink, logs } = memorySink();
    const log = new Logger("test", { level: LogLevel.Silent, sinks: [sink] });

    log.error("should not appear");
    expect(logs.length).toBe(0);
  });

  it("setLevel chains and changes level", () => {
    const { sink, logs } = memorySink();
    const log = new Logger("test", { level: LogLevel.Warn, sinks: [sink] });

    log.info("hidden");
    log.setLevel(LogLevel.Debug).info("shown");

    expect(logs.length).toBe(1);
    expect(logs[0]).toContain("shown");
  });

  it("uses setFormatter", () => {
    const { sink, logs } = memorySink();
    const log = new Logger("test", { formatter: jsonFormatter(), sinks: [sink] });

    log.info("hello");
    const parsed = JSON.parse(logs[0]!);
    expect(parsed.level).toBe("info");
    expect(parsed.msg).toBe("hello");
    expect(parsed.scope).toBe("test");
    expect(parsed.ts).toBeDefined();
  });
});

// ── Context ─────────────────────────────────────────────────────────────────

describe("log context", () => {
  it("attaches structured context", () => {
    const { sink, logs } = memorySink();
    const log = new Logger("test", { formatter: jsonFormatter(), sinks: [sink] });

    log.info("user action", { userId: 42, action: "login" });

    const parsed = JSON.parse(logs[0]!);
    expect(parsed.userId).toBe(42);
    expect(parsed.action).toBe("login");
  });

  it("captures Error details automatically", () => {
    const { sink, logs } = memorySink();
    const log = new Logger("test", { formatter: jsonFormatter(), sinks: [sink] });

    const err = new TypeError("bad type");
    log.error("oh no", err);

    const parsed = JSON.parse(logs[0]!);
    expect(parsed.error.name).toBe("TypeError");
    expect(parsed.error.message).toBe("bad type");
  });

  it("handles error() with plain context", () => {
    const { sink, logs } = memorySink();
    const log = new Logger("test", { formatter: jsonFormatter(), sinks: [sink] });

    log.error("validation failed", { field: "email" });

    const parsed = JSON.parse(logs[0]!);
    expect(parsed.field).toBe("email");
  });

  it("handles error() with no second argument", () => {
    const { sink, logs } = memorySink();
    const log = new Logger("test", { formatter: jsonFormatter(), sinks: [sink] });

    log.error("something broke");

    const parsed = JSON.parse(logs[0]!);
    expect(parsed.msg).toBe("something broke");
  });
});

// ── Child loggers ───────────────────────────────────────────────────────────

describe("child loggers", () => {
  it("extends scope with colon separator", () => {
    const { sink, logs } = memorySink();
    const log = new Logger("app", { sinks: [sink] });
    const child = log.child("db");

    child.info("connected");
    expect(logs[0]).toContain("[app:db]");
  });

  it("merges context from parent and child", () => {
    const { sink, logs } = memorySink();
    const log = new Logger("app", { formatter: jsonFormatter(), sinks: [sink] });
    const child = log.child("auth", { tenant: "acme" });

    child.info("login", { userId: "u1" });

    const parsed = JSON.parse(logs[0]!);
    expect(parsed.tenant).toBe("acme");
    expect(parsed.userId).toBe("u1");
  });

  it("child context overrides parent on collision", () => {
    const { sink, logs } = memorySink();
    const log = new Logger("app", { formatter: jsonFormatter(), sinks: [sink] });
    const parentCtx = log.child("outer", { key: "old" });
    const child = parentCtx.child("inner", { key: "new" });

    child.info("test");

    const parsed = JSON.parse(logs[0]!);
    expect(parsed.key).toBe("new");
  });

  it("child respects parent level", () => {
    const { sink, logs } = memorySink();
    const log = new Logger("app", { level: LogLevel.Warn, sinks: [sink] });
    const child = log.child("db");

    child.info("hidden");
    child.warn("visible");

    expect(logs.length).toBe(1);
    expect(logs[0]).toContain("visible");
  });

  it("child shares formatter and sinks", () => {
    const { sink, logs } = memorySink();
    const log = new Logger("app", { formatter: jsonFormatter(), sinks: [sink] });
    const child = log.child("db");

    child.info("connected");
    // Should be valid JSON (not plain text)
    const parsed = JSON.parse(logs[0]!);
    expect(parsed.msg).toBe("connected");
  });
});

// ── Multiple sinks ──────────────────────────────────────────────────────────

describe("multiple sinks", () => {
  it("writes to all registered sinks", () => {
    const a = memorySink();
    const b = memorySink();
    const log = new Logger("test", { sinks: [a.sink, b.sink] });

    log.info("broadcast");

    expect(a.logs.length).toBe(1);
    expect(b.logs.length).toBe(1);
    expect(a.logs[0]).toContain("broadcast");
    expect(b.logs[0]).toContain("broadcast");
  });

  it("addSink adds after construction", () => {
    const a = memorySink();
    const b = memorySink();
    const log = new Logger("test", { sinks: [a.sink] });

    log.info("first");
    log.addSink(b.sink);
    log.info("second");

    expect(a.logs.length).toBe(2);
    expect(b.logs.length).toBe(1);
  });
});

// ── Formatters ──────────────────────────────────────────────────────────────

describe("prettyFormatter", () => {
  it("includes timestamp and level by default", () => {
    const fmt = prettyFormatter();
    const entry = makeEntry(LogLevel.Info, "hello");
    const line = fmt.format(entry);
    expect(line).toContain("INFO");
    expect(line).toContain("hello");
    expect(line).toContain("T"); // ISO timestamp contains T
  });

  it("omits timestamp when disabled", () => {
    const fmt = prettyFormatter({ timestamp: false });
    const entry = makeEntry(LogLevel.Info, "hello");
    const line = fmt.format(entry);
    expect(line).not.toContain("T");
    expect(line).toContain("INFO");
  });

  it("includes context keys in formatted output", () => {
    const fmt = prettyFormatter();
    const entry = { ...makeEntry(LogLevel.Info, "hello"), context: { userId: 42 } };
    const line = fmt.format(entry);
    expect(line).toContain("userId=42");
  });
});

describe("jsonFormatter", () => {
  it("produces valid JSON", () => {
    const fmt = jsonFormatter();
    const entry = makeEntry(LogLevel.Warn, "alert");
    const line = fmt.format(entry);
    const parsed = JSON.parse(line);
    expect(parsed.level).toBe("warn");
    expect(parsed.msg).toBe("alert");
    expect(parsed.ts).toBeDefined();
  });

  it("spreads context into top-level keys", () => {
    const fmt = jsonFormatter();
    const entry = { ...makeEntry(LogLevel.Info, "ok"), context: { count: 3, active: true } };
    const line = fmt.format(entry);
    const parsed = JSON.parse(line);
    expect(parsed.count).toBe(3);
    expect(parsed.active).toBe(true);
  });
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeEntry(level: LogLevel, message: string): LogEntry {
  return {
    level,
    scope: "test",
    message,
    timestamp: new Date("2026-01-01T00:00:00.000Z"),
    context: {},
  };
}
