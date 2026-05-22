import { coerce, parse } from "./parse.js";
import type { SemVer } from "./parse.js";
import { compare } from "./compare.js";

// ── Range expression parsing ─────────────────────────────────────────────────

interface Comparator {
  op: "=" | ">=" | "<=" | ">" | "<";
  version: SemVer;
}

/**
 * Returns `true` if `version` satisfies the given range expression.
 *
 * Supports:
 * - Exact: `1.2.3`
 * - Caret: `^1.2.3` (compatible changes)
 * - Tilde: `~1.2.3` (patch-level changes)
 * - Comparisons: `>=1.2.3`, `<2.0.0`, `>1.0.0`, `<=2.0.0`
 * - Ranges: `1.2.3 - 2.3.4`
 * - Wildcards: `1.2.x`, `1.x`, `*`
 * - OR union: `||`
 * - AND intersection: space-separated
 *
 * @param version - The version to check (a valid semver string).
 * @param range - A range expression.
 * @returns `true` if the version satisfies the range.
 *
 * @example
 * ```ts
 * satisfies("1.2.3", "^1.0.0");            // true
 * satisfies("2.0.0", "^1.0.0");            // false
 * satisfies("1.5.0", ">=1.2.0 <2.0.0");   // true
 * satisfies("1.2.3", "1.x || 2.x");        // true
 * ```
 */
export function satisfies(version: string, range: string): boolean {
  const v = parse(version);
  if (!v) return false;
  const groups = parseRange(range);
  if (!groups) return false;
  // OR: any group can match
  for (const group of groups) {
    if (checkGroup(v, group)) return true;
  }
  return false;
}

// ── Internals ────────────────────────────────────────────────────────────────

function parseVersion(s: string): SemVer | null {
  const coerced = coerce(s);
  if (!coerced) return null;
  return parse(coerced);
}

function parseRange(range: string): Comparator[][] | null {
  const orParts = range.split(/\|\|/);
  const groups: Comparator[][] = [];

  for (const part of orParts) {
    const comparators = parseAndClause(part.trim());
    if (comparators === null) return null;
    groups.push(comparators);
  }
  return groups;
}

function parseAndClause(expr: string): Comparator[] | null {
  // Split by whitespace for AND intersection
  const parts = expr.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;

  // First, check if this is a range expression "A - B"
  if (parts.length === 3 && parts[1] === "-") {
    const lo = parseVersion(parts[0]!);
    const hi = parseVersion(parts[2]!);
    if (!lo || !hi) return null;
    return [
      { op: ">=", version: lo },
      { op: "<=", version: hi },
    ];
  }

  // Parse each part individually
  const comparators: Comparator[] = [];
  for (const part of parts) {
    const c = parseComparator(part);
    if (!c) return null;
    comparators.push(...c);
  }
  return comparators;
}

function parseComparator(expr: string): Comparator[] | null {
  const caretMatch = expr.match(/^\^(\S+)$/);
  if (caretMatch) {
    const base = parseVersion(caretMatch[1]!);
    if (!base) return null;
    return caretRange(base);
  }

  // Handle tilde: ~X.Y.Z
  const tildeMatch = expr.match(/^~(\S+)$/);
  if (tildeMatch) {
    const base = parseVersion(tildeMatch[1]!);
    if (!base) return null;
    return tildeRange(base);
  }

  // Handle wildcards and simple versions: 1.2.x, 1.x, *, x
  const wildMatch = expr.match(/^(\d+|\*|x)(?:\.(\d+|\*|x))?(?:\.(\d+|\*|x))?$/i);
  if (wildMatch) {
    return wildcardRange(wildMatch);
  }

  // Handle operators: >=, <=, >, <, =
  const opMatch = expr.match(/^(>=|<=|>|<|=)?\s*(\S+)$/);
  if (opMatch) {
    const op = opMatch[1] || "=";
    const verStr = opMatch[2]!;
    // Check if the version part is a wildcard
    const verWild = verStr.match(/^(\d+|\*|x)(?:\.(\d+|\*|x))?(?:\.(\d+|\*|x))?$/i);
    const hasWildcard = verStr.includes("*") || verStr.toLowerCase().includes("x");
    if (verWild && hasWildcard) {
      const wild = wildcardRange(verWild);
      if (!wild) return null;
      if (op === ">=" || op === ">") return [wild[0]!];
      if (op === "<=" || op === "<") return [wild[1]!];
      return wild;
    }
    const v = parseVersion(verStr);
    if (!v) return null;
    return [{ op: op as Comparator["op"], version: v }];
  }

  return null;
}

function caretRange(base: SemVer): Comparator[] {
  const hi: SemVer = { ...base, prerelease: [], build: [] };
  if (base.major !== 0) {
    hi.major++;
    hi.minor = 0;
    hi.patch = 0;
  } else if (base.minor !== 0) {
    hi.minor++;
    hi.patch = 0;
  } else {
    hi.patch++;
  }
  return [
    { op: ">=", version: base },
    { op: "<", version: hi },
  ];
}

function tildeRange(base: SemVer): Comparator[] {
  const hi: SemVer = { ...base, prerelease: [], build: [] };
  hi.minor++;
  hi.patch = 0;
  return [
    { op: ">=", version: base },
    { op: "<", version: hi },
  ];
}

function wildcardRange(m: RegExpMatchArray): Comparator[] | null {
  const major = m[1]!;
  const minor = m[2];
  const patch = m[3];

  if (major === "*" || major.toLowerCase() === "x") {
    return [{ op: ">=", version: { major: 0, minor: 0, patch: 0, prerelease: [], build: [] } }];
  }

  if (!minor || minor === "*" || minor.toLowerCase() === "x") {
    const mj = Number(major);
    return [
      { op: ">=", version: { major: mj, minor: 0, patch: 0, prerelease: [], build: [] } },
      { op: "<", version: { major: mj + 1, minor: 0, patch: 0, prerelease: [], build: [] } },
    ];
  }

  if (!patch || patch === "*" || patch.toLowerCase() === "x") {
    const mj = Number(major);
    const mn = Number(minor);
    return [
      { op: ">=", version: { major: mj, minor: mn, patch: 0, prerelease: [], build: [] } },
      { op: "<", version: { major: mj, minor: mn + 1, patch: 0, prerelease: [], build: [] } },
    ];
  }

  const v: SemVer = {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    prerelease: [],
    build: [],
  };
  return [{ op: "=", version: v }];
}

function checkGroup(v: SemVer, comparators: Comparator[]): boolean {
  for (const c of comparators) {
    const cmp = compare(v, c.version);
    switch (c.op) {
      case "=":
        if (cmp !== 0) return false;
        break;
      case ">=":
        if (cmp === -1) return false;
        break;
      case "<=":
        if (cmp === 1) return false;
        break;
      case ">":
        if (cmp !== 1) return false;
        break;
      case "<":
        if (cmp !== -1) return false;
        break;
    }
  }
  return true;
}
