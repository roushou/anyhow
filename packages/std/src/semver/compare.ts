import type { SemVer } from "./parse.js";

/**
 * Compares two SemVer objects.  Returns `-1`, `0`, or `1`.
 *
 * @param a - The first version.
 * @param b - The second version.
 * @returns `-1` if `a < b`, `0` if equal, `1` if `a > b`.
 */
export function compare(a: SemVer, b: SemVer): -1 | 0 | 1 {
  // Compare major.minor.patch
  for (const key of ["major", "minor", "patch"] as const) {
    if (a[key]! !== b[key]!) return a[key]! > b[key]! ? 1 : -1;
  }
  // Compare prerelease: a version with prerelease is LESS than one without
  if (a.prerelease.length === 0 && b.prerelease.length === 0) return 0;
  if (a.prerelease.length === 0) return 1;
  if (b.prerelease.length === 0) return -1;
  // Compare prerelease identifiers
  const len = Math.max(a.prerelease.length, b.prerelease.length);
  for (let i = 0; i < len; i++) {
    const ai = a.prerelease[i];
    const bi = b.prerelease[i];
    if (ai === undefined && bi === undefined) return 0;
    if (ai === undefined) return -1; // shorter is smaller
    if (bi === undefined) return 1;
    const aNum = Number(ai);
    const bNum = Number(bi);
    const aIsNum = !isNaN(aNum);
    const bIsNum = !isNaN(bNum);
    if (aIsNum && bIsNum) {
      if (aNum !== bNum) return aNum > bNum ? 1 : -1;
    } else if (aIsNum) {
      return -1; // numeric is smaller
    } else if (bIsNum) {
      return 1;
    } else {
      if (ai !== bi) return ai > bi ? 1 : -1;
    }
  }
  return 0;
}

/**
 * Returns `true` if `a` and `b` represent the same version.
 */
export function eq(a: SemVer, b: SemVer): boolean {
  return compare(a, b) === 0;
}

/**
 * Returns `true` if `a` is less than `b`.
 */
export function lt(a: SemVer, b: SemVer): boolean {
  return compare(a, b) === -1;
}

/**
 * Returns `true` if `a` is greater than `b`.
 */
export function gt(a: SemVer, b: SemVer): boolean {
  return compare(a, b) === 1;
}

/**
 * Returns `true` if `a` is less than or equal to `b`.
 */
export function lte(a: SemVer, b: SemVer): boolean {
  return compare(a, b) !== 1;
}

/**
 * Returns `true` if `a` is greater than or equal to `b`.
 */
export function gte(a: SemVer, b: SemVer): boolean {
  return compare(a, b) !== -1;
}
