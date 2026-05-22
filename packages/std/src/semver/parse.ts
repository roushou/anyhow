// ── SemVer regex ─────────────────────────────────────────────────────────────

const SEMVER_RE =
  /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

/**
 * A parsed SemVer version.
 */
export interface SemVer {
  major: number;
  minor: number;
  patch: number;
  /** Dot-separated prerelease identifiers (e.g. `["alpha", "1"]`), or empty. */
  prerelease: string[];
  /** Dot-separated build metadata identifiers (e.g. `["20200101"]`), or empty. */
  build: string[];
}

/**
 * Parses a SemVer string. Returns `null` on invalid input.
 *
 * @param version - The version string (optional `v` prefix is accepted).
 * @returns A {@link SemVer} object, or `null` if the string is not a valid semver.
 *
 * @example
 * ```ts
 * parse("1.2.3");                    // { major: 1, minor: 2, patch: 3, prerelease: [], build: [] }
 * parse("v2.0.0-alpha.1+build.123"); // { major: 2, ..., prerelease: ["alpha", "1"], build: ["build", "123"] }
 * parse("not-a-version");            // null
 * ```
 */
export function parse(version: string): SemVer | null {
  const m = version.trim().match(SEMVER_RE);
  if (!m) return null;
  return {
    major: Number(m[1]!),
    minor: Number(m[2]!),
    patch: Number(m[3]!),
    prerelease: m[4] ? m[4].split(".") : [],
    build: m[5] ? m[5].split(".") : [],
  };
}

/**
 * Returns `true` if `version` is a valid SemVer string.
 *
 * @param version - The version string to validate.
 * @returns `true` if valid.
 *
 * @example
 * ```ts
 * valid("1.2.3");       // true
 * valid("v1.0.0-beta"); // true
 * valid("abc");         // false
 * ```
 */
export function valid(version: string): boolean {
  return SEMVER_RE.test(version.trim());
}

/**
 * Attempts to coerce a loose version string into a valid semver.
 * Strips leading `v`, preserves the first three numeric segments.
 * Returns `null` if coercion fails.
 *
 * @param input - A loose version string.
 * @returns A canonical semver string, or `null`.
 *
 * @example
 * ```ts
 * coerce("v1.2.3");     // "1.2.3"
 * coerce("1.2");        // "1.2.0"
 * coerce("=1.2.3");     // "1.2.3"
 * coerce("garbage");    // null
 * ```
 */
export function coerce(input: string): string | null {
  const cleaned = input.trim().replace(/^[=v]/, "");
  const match = cleaned.match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!match) return null;
  return `${match[1]}.${match[2] ?? "0"}.${match[3] ?? "0"}`;
}
