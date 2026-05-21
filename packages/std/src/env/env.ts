import { ok, err } from "../result/result.js";
import type { Result } from "../result/result.js";

// ── Internal state ──

/** Set of keys that have been marked as sensitive via {@link env.mask}. */
let maskedKeys: Set<string> = new Set();

/** Registry of all keys that have been read and parsed, used by {@link env.dump}. */
let readValues: Map<string, string> = new Map();

/** Read a raw string from process.env, recording it for dump(). */
function readRaw(key: string): string | undefined {
  const value = process.env[key];
  if (value !== undefined) {
    readValues.set(key, value);
  }
  return value;
}

// ── Shared parse helpers ──

function parseNumber(raw: string): Result<number> {
  const n = Number(raw);
  if (Number.isNaN(n)) return err(new Error(`Cannot parse "${raw}" as number`));
  return ok(n);
}

function parseBool(raw: string): Result<boolean> {
  const lower = raw.toLowerCase();
  if (lower === "true" || lower === "1") return ok(true);
  if (lower === "false" || lower === "0") return ok(false);
  return err(new Error(`Cannot parse "${raw}" as boolean (use "true"/"false"/"1"/"0")`));
}

function parseEnum<T extends string>(raw: string, values: readonly T[]): Result<T> {
  if ((values as readonly string[]).includes(raw)) {
    return ok(raw as T);
  }
  return err(new Error(`"${raw}" is not one of: ${values.join(", ")}`));
}

function parseUrl(raw: string): Result<URL> {
  try {
    return ok(new URL(raw));
  } catch {
    return err(new Error(`Cannot parse "${raw}" as URL`));
  }
}

function parseJson<T = unknown>(raw: string): Result<T> {
  try {
    return ok(JSON.parse(raw) as T);
  } catch {
    return err(new Error(`Cannot parse "${raw}" as JSON`));
  }
}

// ── EnvVar ──

/**
 * A lazy {@link Result} wrapper around an environment variable.
 *
 * `EnvVar` is **both** a `Result`-like value (for direct reading) and a
 * composable accessor (for use with {@link env.check}).  Reading is lazy:
 * `process.env` is only accessed when you inspect `.ok`, `.value`, or call
 * a chain method like `.unwrapOr()`.
 *
 * Use the top-level {@link env} functions to create `EnvVar` instances.
 * Chain `.optional()` to make missing variables `Ok(undefined)` or
 * `.default(val)` to supply a fallback.
 *
 * @typeParam T - The parsed value type.
 *
 * @example
 * ```ts
 * const port = env.number("PORT").default(3000);
 * if (port.ok) console.log(port.value);
 * ```
 */
export class EnvVar<T> {
  readonly key: string;
  #read: () => Result<T>;
  #cached: Result<T> | undefined;

  constructor(key: string, read: () => Result<T>) {
    this.key = key;
    this.#read = read;
  }

  // ── Lazy evaluation ──

  /** Evaluate the env var (cached after first call). */
  read(): Result<T> {
    if (this.#cached === undefined) {
      this.#cached = this.#read();
    }
    return this.#cached;
  }

  /** `true` when the variable is set and parsed successfully. */
  get ok(): boolean {
    return this.read().ok;
  }

  /** The parsed value (only valid when `.ok` is `true`). */
  get value(): T {
    return this.read().unwrap();
  }

  /** The error (only valid when `.ok` is `false`). */
  get error(): Error {
    // ErrImpl has a public .error property; OkImpl does not.
    // We cast through unknown because the Result type only exposes
    // .unwrap() / .match() for safe access.
    return (this.read() as unknown as { error: Error }).error;
  }

  /** Unwrap the value, throwing if Err. */
  unwrap(): T {
    return this.read().unwrap();
  }

  /** Return the value or a fallback on error. */
  unwrapOr(fallback: T): T {
    return this.read().unwrapOr(fallback);
  }

  /** Unwrap the value, throwing with a custom message on error. */
  expect(msg: string): T {
    return this.read().expect(msg);
  }

  /** Pattern-match on the result. */
  match<U>(onOk: (value: T) => U, onErr: (error: Error) => U): U {
    return this.read().match(onOk, onErr);
  }

  /** JSON representation for serialization. */
  toJSON(): { ok: true; value: T } | { ok: false; error: Error } {
    return this.read().toJSON();
  }

  // ── Composable modifiers ──

  /**
   * Makes this variable optional — returns `Ok(undefined)` when missing.
   *
   * @returns A new `EnvVar<T | undefined>`.
   */
  optional(): EnvVar<T | undefined> {
    return new EnvVar<T | undefined>(this.key, () => {
      const raw = readRaw(this.key);
      if (raw === undefined) return ok(undefined);
      return this.#read();
    });
  }

  /**
   * Supplies a default value when the variable is missing.
   *
   * @param fallback - The value to use when the env var is not set.
   * @returns A new `EnvVar<T>`.
   */
  default(fallback: T): EnvVar<T> {
    return new EnvVar<T>(this.key, () => {
      const raw = readRaw(this.key);
      if (raw === undefined) return ok(fallback);
      return this.#read();
    });
  }
}

// ── PrefixedEnv ──

/**
 * Scoped environment variable reader returned by {@link env.prefix}.
 *
 * All methods prepend the configured prefix to the key before reading.
 *
 * @example
 * ```ts
 * const db = env.prefix("DB_");
 * db.string("HOST"); // reads DB_HOST
 * db.number("PORT"); // reads DB_PORT
 * ```
 */
class PrefixedEnv {
  readonly #prefix: string;

  constructor(prefix: string) {
    this.#prefix = prefix;
  }

  /** Read a required string with the configured prefix. */
  string(key: string): EnvVar<string> {
    return env.string(this.#prefix + key);
  }

  /** Read a required number with the configured prefix. */
  number(key: string): EnvVar<number> {
    return env.number(this.#prefix + key);
  }

  /** Read a required boolean with the configured prefix. */
  bool(key: string): EnvVar<boolean> {
    return env.bool(this.#prefix + key);
  }

  /** Read a required enum value with the configured prefix. */
  enum<T extends string>(key: string, values: readonly T[]): EnvVar<T> {
    return env.enum(this.#prefix + key, values);
  }

  /** Read a required URL with the configured prefix. */
  url(key: string): EnvVar<URL> {
    return env.url(this.#prefix + key);
  }

  /** Read and parse a JSON value with the configured prefix. */
  json<T = unknown>(key: string): EnvVar<T> {
    return env.json<T>(this.#prefix + key);
  }
}

// ── Top-level env namespace ──

/**
 * Type-safe environment variable access.
 *
 * Every function returns an {@link EnvVar}, which acts like a lazy
 * {@link Result}.  You can read values directly via `.ok` / `.unwrapOr()`
 * or compose them into a configuration object via {@link env.check}.
 *
 * Use {@link env.prefix} for grouped reads and {@link env.check} to
 * bulk-validate an entire configuration at once.
 *
 * @example
 * ```ts
 * import { env } from "@anyhow/std/env";
 *
 * const host = env.string("HOST").unwrapOr("localhost");
 * const port = env.number("PORT").default(3000);
 * if (port.ok) console.log(port.value);
 *
 * const db = env.prefix("DB_");
 * const dbHost = db.string("HOST");
 * ```
 */
export const env = {
  // ── Scalar readers ──

  /**
   * Read a required string from the environment.
   *
   * @param key - The environment variable name.
   * @returns An {@link EnvVar} that resolves to `Ok(value)` if set, `Err` if missing.
   *
   * @example
   * ```ts
   * env.string("DATABASE_URL");
   * ```
   */
  string(key: string): EnvVar<string> {
    return new EnvVar<string>(key, () => {
      const raw = readRaw(key);
      if (raw === undefined) return err(new Error(`${key} is not set`));
      return ok(raw);
    });
  },

  /**
   * Read a required number from the environment.
   *
   * @param key - The environment variable name.
   * @returns An {@link EnvVar} that resolves to `Ok(number)` if set and parseable, `Err` otherwise.
   *
   * @example
   * ```ts
   * env.number("PORT");
   * ```
   */
  number(key: string): EnvVar<number> {
    return new EnvVar<number>(key, () => {
      const raw = readRaw(key);
      if (raw === undefined) return err(new Error(`${key} is not set`));
      return parseNumber(raw);
    });
  },

  /**
   * Read a required boolean from the environment.
   *
   * Accepts `"true"`, `"false"`, `"1"`, or `"0"` (case-insensitive).
   *
   * @param key - The environment variable name.
   * @returns An {@link EnvVar} that resolves to `Ok(boolean)` if set and valid, `Err` otherwise.
   *
   * @example
   * ```ts
   * env.bool("DEBUG");
   * ```
   */
  bool(key: string): EnvVar<boolean> {
    return new EnvVar<boolean>(key, () => {
      const raw = readRaw(key);
      if (raw === undefined) return err(new Error(`${key} is not set`));
      return parseBool(raw);
    });
  },

  /**
   * Read a required value from an allowed set.
   *
   * @typeParam T - The string literal union of allowed values.
   * @param key - The environment variable name.
   * @param values - The allowed values.
   * @returns An {@link EnvVar} that resolves to `Ok(T)` if in the set, `Err` otherwise.
   *
   * @example
   * ```ts
   * env.enum("NODE_ENV", ["development", "production", "test"] as const);
   * ```
   */
  enum<T extends string>(key: string, values: readonly T[]): EnvVar<T> {
    return new EnvVar<T>(key, () => {
      const raw = readRaw(key);
      if (raw === undefined) return err(new Error(`${key} is not set`));
      return parseEnum(raw, values);
    });
  },

  /**
   * Read a required URL from the environment.
   *
   * @param key - The environment variable name.
   * @returns An {@link EnvVar} that resolves to `Ok(URL)` if set and valid, `Err` otherwise.
   *
   * @example
   * ```ts
   * env.url("API_ENDPOINT");
   * ```
   */
  url(key: string): EnvVar<URL> {
    return new EnvVar<URL>(key, () => {
      const raw = readRaw(key);
      if (raw === undefined) return err(new Error(`${key} is not set`));
      return parseUrl(raw);
    });
  },

  /**
   * Read and parse a JSON value from the environment.
   *
   * @typeParam T - The expected type (defaults to `unknown`).
   * @param key - The environment variable name.
   * @returns An {@link EnvVar} that resolves to `Ok(T)` if set and valid JSON, `Err` otherwise.
   *
   * @example
   * ```ts
   * env.json<{ hosts: string[] }>("CLUSTER_CONFIG");
   * ```
   */
  json<T = unknown>(key: string): EnvVar<T> {
    return new EnvVar<T>(key, () => {
      const raw = readRaw(key);
      if (raw === undefined) return err(new Error(`${key} is not set`));
      return parseJson<T>(raw);
    });
  },

  // ── Scoping ──

  /**
   * Create a scoped reader that prepends a prefix to every key.
   *
   * @param prefix - The prefix to prepend (e.g. `"DB_"`).
   * @returns A {@link PrefixedEnv} instance.
   *
   * @example
   * ```ts
   * const db = env.prefix("DB_");
   * db.string("HOST"); // reads DB_HOST
   * db.number("PORT"); // reads DB_PORT
   * ```
   */
  prefix(prefix: string): PrefixedEnv {
    return new PrefixedEnv(prefix);
  },

  // ── Bulk validation ──

  /**
   * Bulk-validate an object of {@link EnvVar} accessors.
   *
   * All variables are read and parsed.  If any fail, an `Err` is returned
   * containing all errors joined together so you can fix them at once.
   *
   * @typeParam T - An object type mapping keys to {@link EnvVar} instances.
   * @param vars - An object whose values are {@link EnvVar} accessors.
   * @returns `Ok(mapped)` where each key holds the parsed value, or `Err` with
   *   all failures.
   *
   * @example
   * ```ts
   * const config = env.check({
   *   host: env.string("HOST"),
   *   port: env.number("PORT").default(3000),
   *   debug: env.bool("DEBUG").optional(),
   * });
   * if (config.ok) console.log(config.value.host);
   * ```
   */
  check<T extends Record<string, EnvVar<any>>>(
    vars: T,
  ): Result<{ [K in keyof T]: T[K] extends EnvVar<infer U> ? U : never }> {
    const errors: string[] = [];
    const results: Record<string, unknown> = {};

    for (const key of Object.keys(vars)) {
      const result = vars[key]!.read();
      if (result.ok) {
        results[key] = result.value;
      } else {
        errors.push(result.error instanceof Error ? result.error.message : String(result.error));
      }
    }

    if (errors.length > 0) {
      return err(new Error(errors.join("; ")));
    }

    return ok(results) as Result<any>;
  },

  // ── .env file support ──

  /**
   * Parse a `.env` file and load its values into `process.env`.
   *
   * Lines are `KEY=value` format.  Comments (`#`) and blank lines are
   * skipped.  Existing `process.env` values take precedence (the file
   * never overwrites a variable that is already set).
   *
   * This function uses `node:fs` and is only available in Node.js / Bun.
   *
   * @param path - Path to the `.env` file.
   * @returns `Ok(void)` on success, `Err` on file read or parse failure.
   *
   * @example
   * ```ts
   * env.loadFile(".env");
   * ```
   */
  loadFile(path: string): Result<void> {
    try {
      // Dynamic require — node:fs is only available in Node/Bun.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { readFileSync } = require("node:fs") as typeof import("node:fs");
      const content = readFileSync(path, "utf-8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!.trim();
        // Skip comments and blank lines
        if (line === "" || line.startsWith("#")) continue;

        const eqIdx = line.indexOf("=");
        if (eqIdx === -1) {
          return err(new Error(`Invalid .env line ${i + 1}: "${line}" (missing =)`));
        }

        const key = line.slice(0, eqIdx).trim();
        if (key === "") {
          return err(new Error(`Invalid .env line ${i + 1}: "${line}" (empty key)`));
        }

        // Never override an already-set env var
        if (process.env[key] !== undefined) continue;

        let value = line.slice(eqIdx + 1).trim();

        // Strip surrounding quotes if present
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        process.env[key] = value;
      }

      return ok(undefined);
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }
  },

  // ── Security ──

  /**
   * Mark keys as sensitive so {@link env.dump} hides their values.
   *
   * @param keys - Environment variable names to mask.
   *
   * @example
   * ```ts
   * env.mask("API_KEY", "DB_PASSWORD");
   * console.log(env.dump()); // API_KEY: "***"
   * ```
   */
  mask(...keys: string[]): void {
    for (const k of keys) maskedKeys.add(k);
  },

  /**
   * Return a plain object of all environment variables that have been read.
   *
   * Keys passed to {@link env.mask} are shown as `"***"`.
   *
   * @returns A record of key-value pairs.
   *
   * @example
   * ```ts
   * env.string("HOST");
   * env.mask("SECRET");
   * env.string("SECRET");
   * env.dump(); // { HOST: "localhost", SECRET: "***" }
   * ```
   */
  dump(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, value] of readValues) {
      out[key] = maskedKeys.has(key) ? "***" : value;
    }
    return out;
  },
};
