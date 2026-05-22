import type { SemVer } from "./parse.js";
import { parse, valid, coerce } from "./parse.js";
import { compare } from "./compare.js";
import { satisfies } from "./range.js";
import { bump as bumpStr } from "./bump.js";

// ── SemVerObj ────────────────────────────────────────────────────────────────

/**
 * A rich SemVer object with methods for comparison, range matching, and bumping.
 * Created via {@link semver}.
 */
export interface SemVerObj {
  /** The major version number. */
  readonly major: number;
  /** The minor version number. */
  readonly minor: number;
  /** The patch version number. */
  readonly patch: number;
  /** Prerelease identifiers (e.g. `["alpha", "1"]`), or empty. */
  readonly prerelease: readonly string[];
  /** Build metadata identifiers (e.g. `["build", "123"]`), or empty. */
  readonly build: readonly string[];

  /**
   * Compares this version to `other`, returning `-1`, `0`, or `1`.
   * `other` can be a string, a {@link SemVer}, or another {@link SemVerObj}.
   */
  compare(other: string | SemVer | SemVerObj): -1 | 0 | 1;
  /** Returns `true` if this version equals `other`. */
  eq(other: string | SemVer | SemVerObj): boolean;
  /** Returns `true` if this version is less than `other`. */
  lt(other: string | SemVer | SemVerObj): boolean;
  /** Returns `true` if this version is greater than `other`. */
  gt(other: string | SemVer | SemVerObj): boolean;
  /** Returns `true` if this version is less than or equal to `other`. */
  lte(other: string | SemVer | SemVerObj): boolean;
  /** Returns `true` if this version is greater than or equal to `other`. */
  gte(other: string | SemVer | SemVerObj): boolean;

  /** Returns `true` if this version satisfies the given range expression. */
  satisfies(range: string): boolean;

  /** Returns a new {@link SemVerObj} bumped by the given release type. */
  bump(release: "major" | "minor" | "patch"): SemVerObj;

  /** Returns the canonical semver string (e.g. `"1.2.3"`). */
  toString(): string;
  /** Returns the canonical semver string (for `JSON.stringify`). */
  toJSON(): string;
}

// ── SemVerFn (static methods on semver()) ────────────────────────────────────

/**
 * The `semver()` function with static helper methods.
 */
export interface SemVerFn {
  /**
   * Parses a string into a {@link SemVerObj}. Returns `null` on invalid input.
   *
   * @example
   * ```ts
   * const v = semver("1.2.3");
   * v.major; // 1
   * v.lt("2.0.0"); // true
   * v.satisfies("^1.0.0"); // true
   * ```
   */
  (version: string): SemVerObj | null;

  /** Returns `true` if `version` is a valid semver string. */
  valid(version: string): boolean;

  /** Coerces a loose version string into a canonical semver. Returns `null` on failure. */
  coerce(input: string): SemVerObj | null;

  /** Sorts an array of semver strings in ascending order. */
  sort(versions: string[]): string[];

  /** Returns the highest semver string from an array. */
  max(versions: string[]): string | null;

  /** Returns the lowest semver string from an array. */
  min(versions: string[]): string | null;

  /**
   * Returns the release type of the difference between `a` and `b`.
   * Returns `"major"`, `"minor"`, `"patch"`, `"prerelease"`, or `null` if equal.
   */
  diff(a: string, b: string): "major" | "minor" | "patch" | "prerelease" | null;
}

// ── Implementation ───────────────────────────────────────────────────────────

function resolve(other: string | SemVer | SemVerObj): SemVer | null {
  if (typeof other === "string") return parse(other);
  return other as SemVer;
}

function make(inner: SemVer): SemVerObj {
  const self: SemVerObj = {
    major: inner.major,
    minor: inner.minor,
    patch: inner.patch,
    prerelease: inner.prerelease,
    build: inner.build,

    compare(other) {
      const b = resolve(other);
      if (!b) throw new Error(`Invalid semver: ${other}`);
      return compare(inner, b);
    },
    eq(other) {
      const b = resolve(other);
      return b ? compare(inner, b) === 0 : false;
    },
    lt(other) {
      const b = resolve(other);
      return b ? compare(inner, b) === -1 : false;
    },
    gt(other) {
      const b = resolve(other);
      return b ? compare(inner, b) === 1 : false;
    },
    lte(other) {
      const b = resolve(other);
      return b ? compare(inner, b) !== 1 : false;
    },
    gte(other) {
      const b = resolve(other);
      return b ? compare(inner, b) !== -1 : false;
    },

    satisfies(range) {
      return satisfies(self.toString(), range);
    },

    bump(release) {
      const next = bumpStr(self.toString(), release);
      if (!next) throw new Error(`Invalid bump: ${release} on ${self.toString()}`);
      return make(parse(next)!);
    },

    toString() {
      let s = `${inner.major}.${inner.minor}.${inner.patch}`;
      if (inner.prerelease.length > 0) s += `-${inner.prerelease.join(".")}`;
      if (inner.build.length > 0) s += `+${inner.build.join(".")}`;
      return s;
    },
    toJSON() {
      return self.toString();
    },
  };

  return self;
}

/**
 * Parses a semver string into a rich {@link SemVerObj} with comparison,
 * range matching, and bumping methods. Returns `null` on invalid input.
 *
 * Also serves as a namespace for static helpers: {@link SemVerFn.sort},
 * {@link SemVerFn.max}, {@link SemVerFn.min}, {@link SemVerFn.diff},
 * {@link SemVerFn.valid}, and {@link SemVerFn.coerce}.
 *
 * @example
 * ```ts
 * const v = semver("1.2.3");
 * v.major;                  // 1
 * v.lt("2.0.0");            // true
 * v.satisfies("^1.0.0");    // true
 * const next = v.bump("minor"); // SemVerObj("1.3.0")
 * next.toString();           // "1.3.0"
 *
 * semver.sort(["2.0.0", "1.0.0"]); // ["1.0.0", "2.0.0"]
 * semver.diff("1.0.0", "2.0.0");   // "major"
 * ```
 */
export const semver: SemVerFn = Object.assign(
  (version: string): SemVerObj | null => {
    const parsed = parse(version);
    return parsed ? make(parsed) : null;
  },
  {
    valid,
    coerce(input: string): SemVerObj | null {
      const c = coerce(input);
      if (!c) return null;
      return make(parse(c)!);
    },
    sort(versions: string[]): string[] {
      return [...versions].sort((a, b) => {
        const pa = parse(a);
        const pb = parse(b);
        if (!pa || !pb) return 0;
        return compare(pa, pb);
      });
    },
    max(versions: string[]): string | null {
      if (versions.length === 0) return null;
      return versions.reduce((best, cur) => {
        const pc = parse(cur);
        const pb = parse(best);
        if (!pc || !pb) return best;
        return compare(pc, pb) === 1 ? cur : best;
      }, versions[0]!);
    },
    min(versions: string[]): string | null {
      if (versions.length === 0) return null;
      return versions.reduce((best, cur) => {
        const pc = parse(cur);
        const pb = parse(best);
        if (!pc || !pb) return best;
        return compare(pc, pb) === -1 ? cur : best;
      }, versions[0]!);
    },
    diff(a: string, b: string): "major" | "minor" | "patch" | "prerelease" | null {
      const pa = parse(a);
      const pb = parse(b);
      if (!pa || !pb) return null;
      if (pa.major !== pb.major) return "major";
      if (pa.minor !== pb.minor) return "minor";
      if (pa.patch !== pb.patch) return "patch";
      if (pa.prerelease.length > 0 || pb.prerelease.length > 0) return "prerelease";
      return null;
    },
  } satisfies Omit<SemVerFn, "">,
);
