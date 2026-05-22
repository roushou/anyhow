import { valid } from "./parse.js";

type Release = "major" | "minor" | "patch";

/**
 * Bumps a semver string by the given release type.
 *
 * @param version - A valid semver string.
 * @param release - The release type to bump: `"major"`, `"minor"`, or `"patch"`.
 * @returns The bumped semver string, or `null` if the input is invalid.
 *
 * @example
 * ```ts
 * bump("1.2.3", "patch"); // "1.2.4"
 * bump("1.2.3", "minor"); // "1.3.0"
 * bump("1.2.3", "major"); // "2.0.0"
 * ```
 */
export function bump(version: string, release: Release): string | null {
  if (!valid(version)) return null;
  const parts = version.replace(/^v/, "").split("-")[0]!.split(".").map(Number);
  const [major, minor, patch] = parts as [number, number, number];
  switch (release) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
  }
}
