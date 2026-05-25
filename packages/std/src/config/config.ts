import { ok, err, type Result } from "../result/result.js";
import type { Schema, ValidationError } from "../schema/types.js";

// ── Source descriptors ──

/**
 * A configuration source — a file, environment variables, or CLI arguments.
 *
 * Returned by {@link Config.file}, {@link Config.env}, and {@link Config.args}.
 */
export type ConfigSource = FileSource | EnvSource | ArgsSource;

/** Loads a JSON file. */
export interface FileSource {
  type: "file";
  path: string;
  optional: boolean;
}

/** Reads environment variables with a given prefix. */
export interface EnvSource {
  type: "env";
  prefix: string;
}

/** Parses `process.argv`. */
export interface ArgsSource {
  type: "args";
}

// ── Config namespace ──

/**
 * Configuration loader with multi-source merging and schema validation.
 *
 * @example
 * ```ts
 * import { Config } from "@anyhow/std/config";
 * import { s } from "@anyhow/std/schema";
 *
 * const AppConfig = s.object({
 *   port: s.number.default(3000),
 *   database: s.object({ url: s.string }),
 * });
 *
 * const result = await Config.load(AppConfig, {
 *   sources: [
 *     Config.file("defaults.json"),
 *     Config.file("config.local.json", { optional: true }),
 *     Config.env("APP_"),
 *     Config.args(),
 *   ],
 * });
 *
 * if (!result.ok) {
 *   console.error("Invalid config:", result.error.message);
 *   process.exit(1);
 * }
 * const { port, database } = result.value;
 * ```
 */
export const Config = {
  /**
   * Returns a file source descriptor.
   *
   * Files are read as JSON.  When `optional` is `true`, missing files are
   * silently skipped instead of causing an error.
   *
   * @param path - Path to a JSON file.
   * @param opts.optional - If `true`, skip the file when it does not exist.
   *
   * @example
   * ```ts
   * Config.file("config.json");
   * Config.file("config.local.json", { optional: true });
   * ```
   */
  file(path: string, opts: { optional?: boolean } = {}): FileSource {
    return { type: "file", path, optional: opts.optional ?? false };
  },

  /**
   * Returns an environment-variable source descriptor.
   *
   * Keys are matched by `prefix`, stripped of the prefix, and nested using
   * `__` (double-underscore) as the separator:
   *
   * - `APP_PORT=8080` → `{ port: 8080 }`
   * - `APP_DATABASE__URL=pg://...` → `{ database: { url: "pg://..." } }`
   *
   * Values are auto-coerced: `"true"` / `"false"` → boolean, integers and
   * floats → number.  Everything else stays as a string.
   *
   * @param prefix - The env-var prefix (e.g. `"APP_"`).
   *
   * @example
   * ```ts
   * Config.env("APP_");
   * ```
   */
  env(prefix: string): EnvSource {
    return { type: "env", prefix };
  },

  /**
   * Returns a CLI-arguments source descriptor.
   *
   * Parses `process.argv`, skipping the first two entries (node + script).
   * Supports:
   *
   * - `--key=value` / `--key value` → `{ key: value }`
   * - `--flag` → `{ flag: true }`
   * - `--no-flag` → `{ flag: false }`
   * - `--nested.key=value` → `{ nested: { key: value } }`
   *
   * Values are auto-coerced the same way as {@link Config.env}.
   *
   * @example
   * ```ts
   * Config.args();
   * ```
   */
  args(): ArgsSource {
    return { type: "args" };
  },

  /**
   * Loads configuration from an ordered list of sources, deep-merging them
   * (later sources override earlier ones) and validating the result against
   * the schema.
   *
   * @typeParam T - The config type inferred from the schema.
   * @param schema - A {@link Schema} that defines and validates the config shape.
   * @param opts.sources - An ordered array of {@link ConfigSource} descriptors.
   * @returns `Ok(T)` on success, `Err(ValidationError)` on failure.
   *
   * @example
   * ```ts
   * const config = await Config.load(AppConfig, {
   *   sources: [
   *     Config.file("defaults.json"),
   *     Config.env("APP_"),
   *   ],
   * });
   * ```
   */
  async load<T>(
    schema: Schema<T>,
    opts: { sources: ConfigSource[] },
  ): Promise<Result<T, ValidationError>> {
    let merged: Record<string, unknown> = {};

    for (const source of opts.sources) {
      const result = await loadSource(source);
      if (!result.ok) return result as Result<never, ValidationError>;
      merged = deepMerge(merged, result.value);
    }

    return schema.parse(merged);
  },

  /**
   * Generates a `.env.example` file from a schema by walking its shape
   * and printing every leaf key with an empty value.
   *
   * @param schema - An object schema (typically from `s.object(...)`).
   * @param opts.prefix - An optional prefix for every key (e.g. `"APP_"`).
   * @returns A string suitable for writing to `.env.example`.
   *
   * @example
   * ```ts
   * console.log(Config.generateDotEnv(AppConfig, { prefix: "APP_" }));
   * // APP_PORT=
   * // APP_DATABASE__URL=
   * ```
   */
  generateDotEnv(schema: Schema<any>, opts: { prefix?: string } = {}): string {
    const prefix = opts.prefix ?? "";
    // Parse an empty object to get the default values, then walk them
    const result = schema.parse({});
    if (!result.ok) return "";

    const lines: string[] = [];
    walkConfig(result.value, [], (path) => {
      lines.push(`${prefix}${path.map((k) => k.toUpperCase()).join("__")}=`);
    });
    return lines.join("\n") + "\n";
  },
};

// ── Source loading ──

async function loadSource(
  source: ConfigSource,
): Promise<Result<Record<string, unknown>, ValidationError>> {
  switch (source.type) {
    case "file":
      return loadFileSource(source);
    case "env":
      return ok(loadEnvSource(source));
    case "args":
      return ok(loadArgsSource());
  }
}

async function loadFileSource(
  source: FileSource,
): Promise<Result<Record<string, unknown>, ValidationError>> {
  // Use a dynamic approach that works with Bun, Node, and Deno
  let raw: string;
  try {
    // Try Bun first, fall back to Node
    if (typeof Bun !== "undefined") {
      const f = Bun.file(source.path);
      if (!(await f.exists())) {
        if (source.optional) return ok({});
        return err({
          path: source.path,
          message: `Config file not found: ${source.path}`,
          expected: "file",
          received: "missing",
        });
      }
      raw = await f.text();
    } else if (typeof process !== "undefined") {
      const fs = await import("node:fs/promises");
      try {
        raw = await fs.readFile(source.path, "utf-8");
      } catch (e: any) {
        if (e.code === "ENOENT") {
          if (source.optional) return ok({});
          return err({
            path: source.path,
            message: `Config file not found: ${source.path}`,
            expected: "file",
            received: "missing",
          });
        }
        throw e;
      }
    } else {
      return err({
        path: source.path,
        message: "No filesystem API available",
        expected: "file",
        received: "unsupported",
      });
    }
  } catch (e) {
    return err({
      path: source.path,
      message: e instanceof Error ? e.message : `Failed to read ${source.path}`,
      expected: "readable file",
      received: String(e),
    });
  }

  try {
    return ok(JSON.parse(raw));
  } catch (e) {
    return err({
      path: source.path,
      message: `Invalid JSON in ${source.path}: ${e instanceof Error ? e.message : String(e)}`,
      expected: "valid JSON",
      received: "invalid",
    });
  }
}

function loadEnvSource(source: EnvSource): Record<string, unknown> {
  if (typeof process === "undefined") return {};

  const result: Record<string, unknown> = {};
  const prefix = source.prefix;

  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith(prefix) || value === undefined) continue;

    const stripped = key.slice(prefix.length).toLowerCase();
    if (stripped.length === 0) continue;

    const parsed = parseEnvValue(value);
    setNested(result, stripped.split("__"), parsed);
  }

  return result;
}

function loadArgsSource(): Record<string, unknown> {
  if (typeof process === "undefined") return {};
  const result: Record<string, unknown> = {};
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;

    // --key=value
    const eqIdx = arg.indexOf("=");
    if (arg.startsWith("--") && eqIdx !== -1) {
      const key = arg.slice(2, eqIdx);
      const value = arg.slice(eqIdx + 1);
      setNested(result, key.split("."), parseEnvValue(value));
      continue;
    }

    // --flag or --no-flag or --key value
    if (arg.startsWith("--")) {
      if (arg.startsWith("--no-")) {
        setNested(result, arg.slice(5).split("."), false);
        continue;
      }

      const name = arg.slice(2);
      // Look ahead: --key value (if next arg exists and doesn't start with -)
      if (i + 1 < args.length && !args[i + 1]!.startsWith("-")) {
        setNested(result, name.split("."), parseEnvValue(args[i + 1]!));
        i++; // consume value
      } else {
        setNested(result, name.split("."), true);
      }
    }
  }

  return result;
}

// ── Value coercion ──

function parseEnvValue(raw: string): unknown {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw === "null" || raw === "undefined") return undefined;
  // Integer
  if (/^-?\d+$/.test(raw)) return Number(raw);
  // Float
  if (/^-?\d+\.\d+$/.test(raw)) return Number(raw);
  return raw;
}

// ── Deep merge ──

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key] as Record<string, unknown>, value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ── Nested object helpers ──

function setNested(obj: Record<string, unknown>, path: string[], value: unknown): void {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]!;
    if (!isPlainObject(current[key])) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  const lastKey = path[path.length - 1]!;
  current[lastKey] = value;
}

// ── Config value walking (for generateDotEnv) ──

function walkConfig(value: unknown, path: string[], onLeaf: (path: string[]) => void): void {
  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    for (const key of keys) {
      walkConfig((value as Record<string, unknown>)[key], [...path, key], onLeaf);
    }
    if (keys.length === 0) {
      onLeaf(path);
    }
  } else {
    onLeaf(path);
  }
}
