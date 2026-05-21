import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { env, EnvVar } from "./env.js";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const testDir = join(import.meta.dirname, "..", "..", ".test-env");

// ── Helpers ──

function setEnv(key: string, value: string) {
  process.env[key] = value;
}

function delEnv(key: string) {
  delete process.env[key];
}

beforeEach(() => {
  setEnv("TEST_KEY", "test_value");
  setEnv("TEST_NUM", "42");
  setEnv("TEST_NUM_NEG", "-10");
  setEnv("TEST_NUM_FLOAT", "3.14");
  setEnv("TEST_BOOL_TRUE", "true");
  setEnv("TEST_BOOL_FALSE", "false");
  setEnv("TEST_BOOL_1", "1");
  setEnv("TEST_BOOL_0", "0");
  setEnv("TEST_ENUM", "production");
  setEnv("TEST_URL", "https://example.com/path?q=1");
  setEnv("TEST_JSON", '{"name":"Alice","age":30}');
  setEnv("DB_HOST", "localhost");
  setEnv("DB_PORT", "5432");
  setEnv("DB_USER", "admin");
  setEnv("DB_PASS", "secret123");
  setEnv("API_KEY", "sk-abc123");
});

afterEach(() => {
  delEnv("TEST_KEY");
  delEnv("TEST_NUM");
  delEnv("TEST_NUM_NEG");
  delEnv("TEST_NUM_FLOAT");
  delEnv("TEST_BOOL_TRUE");
  delEnv("TEST_BOOL_FALSE");
  delEnv("TEST_BOOL_1");
  delEnv("TEST_BOOL_0");
  delEnv("TEST_ENUM");
  delEnv("TEST_URL");
  delEnv("TEST_JSON");
  delEnv("DB_HOST");
  delEnv("DB_PORT");
  delEnv("DB_USER");
  delEnv("DB_PASS");
  delEnv("API_KEY");
  // Clean up .env test files
  try {
    rmSync(testDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
});

// ── env.string ──

describe("env.string", () => {
  it("returns Ok with the value when the key is set", () => {
    const r = env.string("TEST_KEY");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("test_value");
  });

  it("returns Err when the key is missing", () => {
    const r = env.string("NONEXISTENT_KEY_XYZ");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.message).toContain("NONEXISTENT_KEY_XYZ");
  });

  it("returns empty string when key is set to empty string", () => {
    setEnv("TEST_EMPTY", "");
    const r = env.string("TEST_EMPTY");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("");
    delEnv("TEST_EMPTY");
  });
});

// ── env.number ──

describe("env.number", () => {
  it("parses a positive integer", () => {
    const r = env.number("TEST_NUM");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("parses a negative integer", () => {
    const r = env.number("TEST_NUM_NEG");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(-10);
  });

  it("parses a float", () => {
    const r = env.number("TEST_NUM_FLOAT");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(3.14);
  });

  it("returns Err for a non-numeric string", () => {
    setEnv("TEST_BAD_NUM", "abc");
    const r = env.number("TEST_BAD_NUM");
    expect(r.ok).toBe(false);
    delEnv("TEST_BAD_NUM");
  });

  it("returns Err when the key is missing", () => {
    const r = env.number("NONEXISTENT_NUM");
    expect(r.ok).toBe(false);
  });
});

// ── env.bool ──

describe("env.bool", () => {
  it("parses 'true' as true", () => {
    const r = env.bool("TEST_BOOL_TRUE");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(true);
  });

  it("parses 'false' as false", () => {
    const r = env.bool("TEST_BOOL_FALSE");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(false);
  });

  it("parses '1' as true", () => {
    const r = env.bool("TEST_BOOL_1");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(true);
  });

  it("parses '0' as false", () => {
    const r = env.bool("TEST_BOOL_0");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(false);
  });

  it("is case-insensitive", () => {
    setEnv("TEST_BOOL_UPPER", "TRUE");
    const r = env.bool("TEST_BOOL_UPPER");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(true);
    delEnv("TEST_BOOL_UPPER");
  });

  it("returns Err for invalid boolean string", () => {
    setEnv("TEST_BOOL_BAD", "yes");
    const r = env.bool("TEST_BOOL_BAD");
    expect(r.ok).toBe(false);
    delEnv("TEST_BOOL_BAD");
  });

  it("returns Err when the key is missing", () => {
    const r = env.bool("NONEXISTENT_BOOL");
    expect(r.ok).toBe(false);
  });
});

// ── env.enum ──

describe("env.enum", () => {
  const modes = ["development", "production", "test"] as const;

  it("returns Ok for a valid value", () => {
    const r = env.enum("TEST_ENUM", modes);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toBe("production");
      // Type narrowing: r.value should be one of the modes
    }
  });

  it("returns Err for an invalid value", () => {
    setEnv("TEST_ENUM_BAD", "staging");
    const r = env.enum("TEST_ENUM_BAD", modes);
    expect(r.ok).toBe(false);
    delEnv("TEST_ENUM_BAD");
  });

  it("returns Err when the key is missing", () => {
    const r = env.enum("NONEXISTENT_ENUM", modes);
    expect(r.ok).toBe(false);
  });
});

// ── env.url ──

describe("env.url", () => {
  it("parses a valid URL", () => {
    const r = env.url("TEST_URL");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toBeInstanceOf(URL);
      expect(r.value.hostname).toBe("example.com");
      expect(r.value.pathname).toBe("/path");
    }
  });

  it("returns Err for an invalid URL", () => {
    setEnv("TEST_URL_BAD", "not a url");
    const r = env.url("TEST_URL_BAD");
    expect(r.ok).toBe(false);
    delEnv("TEST_URL_BAD");
  });

  it("returns Err when the key is missing", () => {
    const r = env.url("NONEXISTENT_URL");
    expect(r.ok).toBe(false);
  });
});

// ── env.json ──

describe("env.json", () => {
  it("parses valid JSON", () => {
    const r = env.json<{ name: string; age: number }>("TEST_JSON");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.name).toBe("Alice");
      expect(r.value.age).toBe(30);
    }
  });

  it("parses JSON arrays", () => {
    setEnv("TEST_JSON_ARR", "[1, 2, 3]");
    const r = env.json<number[]>("TEST_JSON_ARR");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toEqual([1, 2, 3]);
    delEnv("TEST_JSON_ARR");
  });

  it("returns Err for invalid JSON", () => {
    setEnv("TEST_JSON_BAD", "{bad json");
    const r = env.json("TEST_JSON_BAD");
    expect(r.ok).toBe(false);
    delEnv("TEST_JSON_BAD");
  });

  it("returns Err when the key is missing", () => {
    const r = env.json("NONEXISTENT_JSON");
    expect(r.ok).toBe(false);
  });
});

// ── env.prefix ──

describe("env.prefix", () => {
  it("scopes reads with a prefix", () => {
    const db = env.prefix("DB_");
    const host = db.string("HOST");
    expect(host.ok).toBe(true);
    if (host.ok) expect(host.value).toBe("localhost");
  });

  it("reads numbers with a prefix", () => {
    const db = env.prefix("DB_");
    const port = db.number("PORT");
    expect(port.ok).toBe(true);
    if (port.ok) expect(port.value).toBe(5432);
  });

  it("reads booleans with a prefix", () => {
    setEnv("DB_DEBUG", "true");
    const db = env.prefix("DB_");
    const debug = db.bool("DEBUG");
    expect(debug.ok).toBe(true);
    if (debug.ok) expect(debug.value).toBe(true);
    delEnv("DB_DEBUG");
  });

  it("reads enums with a prefix", () => {
    setEnv("DB_MODE", "read");
    const db = env.prefix("DB_");
    const mode = db.enum("MODE", ["read", "write"] as const);
    expect(mode.ok).toBe(true);
    if (mode.ok) expect(mode.value).toBe("read");
    delEnv("DB_MODE");
  });

  it("reads URLs with a prefix", () => {
    setEnv("DB_URL", "https://db.example.com");
    const db = env.prefix("DB_");
    const url = db.url("URL");
    expect(url.ok).toBe(true);
    if (url.ok) expect(url.value.hostname).toBe("db.example.com");
    delEnv("DB_URL");
  });

  it("reads JSON with a prefix", () => {
    setEnv("DB_CONFIG", '{"pool":5}');
    const db = env.prefix("DB_");
    const config = db.json<{ pool: number }>("CONFIG");
    expect(config.ok).toBe(true);
    if (config.ok) expect(config.value.pool).toBe(5);
    delEnv("DB_CONFIG");
  });

  it("returns Err for missing key with prefix", () => {
    const db = env.prefix("DB_");
    const r = db.string("NONEXISTENT");
    expect(r.ok).toBe(false);
  });
});

// ── env.check ──

describe("env.check", () => {
  it("returns Ok with all values when all are present", () => {
    const config = env.check({
      key: env.string("TEST_KEY"),
      num: env.number("TEST_NUM"),
    });
    expect(config.ok).toBe(true);
    if (config.ok) {
      expect(config.value.key).toBe("test_value");
      expect(config.value.num).toBe(42);
    }
  });

  it("returns Ok with defaults applied", () => {
    const config = env.check({
      key: env.string("TEST_KEY"),
      missing: env.string("MISSING_KEY").default("fallback"),
    });
    expect(config.ok).toBe(true);
    if (config.ok) {
      expect(config.value.key).toBe("test_value");
      expect(config.value.missing).toBe("fallback");
    }
  });

  it("returns Ok with optional variables", () => {
    const config = env.check({
      key: env.string("TEST_KEY"),
      optional: env.string("MISSING_OPT").optional(),
    });
    expect(config.ok).toBe(true);
    if (config.ok) {
      expect(config.value.key).toBe("test_value");
      expect(config.value.optional).toBeUndefined();
    }
  });

  it("returns Err with all error messages when some fail", () => {
    const config = env.check({
      key: env.string("TEST_KEY"),
      bad: env.number("MISSING_NUM"),
      alsoBad: env.bool("MISSING_BOOL"),
    });
    expect(config.ok).toBe(false);
    if (!config.ok) {
      expect(config.error.message).toContain("MISSING_NUM");
      expect(config.error.message).toContain("MISSING_BOOL");
    }
  });

  it("returns Err when all fail", () => {
    const config = env.check({
      a: env.string("MISSING_A"),
      b: env.string("MISSING_B"),
    });
    expect(config.ok).toBe(false);
  });
});

// ── EnvVar class ──

describe("EnvVar", () => {
  it("can be created directly and read", () => {
    const v = new EnvVar("TEST_KEY", () => {
      const raw = process.env["TEST_KEY"];
      if (raw === undefined) return err(new Error("missing"));
      return ok(raw);
    });
    const r = v.read();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("test_value");
  });

  it("exposes ok and value as getters", () => {
    const v = env.string("TEST_KEY");
    expect(v.ok).toBe(true);
    expect(v.value).toBe("test_value");
  });

  it("optional() returns Ok(undefined) for missing key", () => {
    const v = new EnvVar("MISSING_KEY", () => {
      const raw = process.env["MISSING_KEY"];
      if (raw === undefined) return err(new Error("missing"));
      return ok(raw);
    }).optional();
    const r = v.read();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeUndefined();
  });

  it("default() returns fallback for missing key", () => {
    const v = new EnvVar("MISSING_KEY", () => {
      const raw = process.env["MISSING_KEY"];
      if (raw === undefined) return err(new Error("missing"));
      return ok(raw);
    }).default("my-default");
    const r = v.read();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("my-default");
  });

  it("default() still parses when key is present", () => {
    const v = new EnvVar("TEST_NUM", () => {
      const raw = process.env["TEST_NUM"];
      if (raw === undefined) return err(new Error("missing"));
      return parseNum(raw);
    }).default(999);
    const r = v.read();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it("unwrapOr returns value on success", () => {
    const v = env.string("TEST_KEY");
    expect(v.unwrapOr("fallback")).toBe("test_value");
  });

  it("unwrapOr returns fallback on error", () => {
    const v = env.string("MISSING_KEY");
    expect(v.unwrapOr("fallback")).toBe("fallback");
  });

  it("match calls onOk on success", () => {
    const v = env.string("TEST_KEY");
    const result = v.match(
      (v) => `got: ${v}`,
      (e) => e.message,
    );
    expect(result).toBe("got: test_value");
  });

  it("match calls onErr on failure", () => {
    const v = env.string("MISSING_KEY");
    const result = v.match(
      (v) => `got: ${v}`,
      (e) => e.message,
    );
    expect(result).toContain("MISSING_KEY");
  });

  it("toJSON returns serializable representation", () => {
    const v = env.string("TEST_KEY");
    const json = v.toJSON();
    expect(json.ok).toBe(true);
    if (json.ok) expect(json.value).toBe("test_value");
  });

  it("is lazy — does not read until accessed", () => {
    // If we create an EnvVar for a key that doesn't exist but never access it,
    // it should not throw or record anything.
    const v = env.string("NEVER_ACCESSED_KEY");
    // Accessing `.ok` triggers the read
    expect(v.ok).toBe(false);
  });
});

// ── env.loadFile ──

describe("env.loadFile", () => {
  function writeTestEnv(name: string, content: string): string {
    mkdirSync(testDir, { recursive: true });
    const file = join(testDir, name);
    writeFileSync(file, content);
    return file;
  }

  it("parses a valid .env file", () => {
    const file = writeTestEnv(".env.valid", "KEY1=value1\nKEY2=value2\n# comment\nKEY3=value3\n");
    const r = env.loadFile(file);
    expect(r.ok).toBe(true);
    // Values should now be set on process.env
    expect(process.env["KEY1"]).toBe("value1");
    expect(process.env["KEY2"]).toBe("value2");
    expect(process.env["KEY3"]).toBe("value3");
    // Comment lines ignored
    delEnv("KEY1");
    delEnv("KEY2");
    delEnv("KEY3");
  });

  it("skips blank lines", () => {
    const file = writeTestEnv(".env.blank", "\n\nKEY1=value1\n\nKEY2=value2\n\n");
    const r = env.loadFile(file);
    expect(r.ok).toBe(true);
    expect(process.env["KEY1"]).toBe("value1");
    expect(process.env["KEY2"]).toBe("value2");
    delEnv("KEY1");
    delEnv("KEY2");
  });

  it("does not override existing env vars", () => {
    setEnv("EXISTING", "already-set");
    const file = writeTestEnv(".env.nooverride", "EXISTING=from-file\n");
    const r = env.loadFile(file);
    expect(r.ok).toBe(true);
    expect(process.env["EXISTING"]).toBe("already-set");
    delEnv("EXISTING");
  });

  it("strips surrounding quotes from values", () => {
    const file = writeTestEnv(".env.quotes", "DOUBLE=\"hello world\"\nSINGLE='hello world'\n");
    const r = env.loadFile(file);
    expect(r.ok).toBe(true);
    expect(process.env["DOUBLE"]).toBe("hello world");
    expect(process.env["SINGLE"]).toBe("hello world");
    delEnv("DOUBLE");
    delEnv("SINGLE");
  });

  it("returns Err for missing file", () => {
    const r = env.loadFile(join(testDir, "nonexistent.env"));
    expect(r.ok).toBe(false);
  });

  it("returns Err for line with missing =", () => {
    const file = writeTestEnv(".env.bad", "INVALID_LINE\n");
    const r = env.loadFile(file);
    expect(r.ok).toBe(false);
  });
});

// ── env.mask + env.dump ──

describe("env.mask + env.dump", () => {
  it("dump returns all read values", () => {
    // Trigger lazy reads via .ok to populate readValues
    expect(env.string("TEST_KEY").ok).toBe(true);
    expect(env.number("TEST_NUM").ok).toBe(true);
    const d = env.dump();
    expect(d["TEST_KEY"]).toBe("test_value");
    expect(d["TEST_NUM"]).toBe("42");
  });

  it("mask hides sensitive values", () => {
    env.string("API_KEY").unwrap(); // trigger read
    env.mask("API_KEY");
    const d = env.dump();
    expect(d["API_KEY"]).toBe("***");
  });

  it("mask only hides specified keys", () => {
    env.string("DB_HOST").unwrap();
    env.string("DB_PASS").unwrap();
    env.mask("DB_PASS");
    const d = env.dump();
    expect(d["DB_HOST"]).toBe("localhost");
    expect(d["DB_PASS"]).toBe("***");
  });

  it("mask before read still hides value", () => {
    env.mask("DB_USER");
    env.string("DB_USER").unwrap();
    const d = env.dump();
    expect(d["DB_USER"]).toBe("***");
  });
});

// ── Helper for EnvVar tests ──

import { ok, err } from "../result/result.js";

function parseNum(raw: string) {
  const n = Number(raw);
  if (Number.isNaN(n)) return err(new Error("not a number"));
  return ok(n);
}
