/**
 * The result of a successful {@link fuzzyMatch} call.
 *
 * @property score - A value between `0` and `1`.  Higher means a better match.
 * @property matched - The matched substrings concatenated (characters are in
 *   target order, but not necessarily contiguous in the target).
 */
export interface FuzzyMatchResult {
  score: number;
  matched: string;
}

// ── Scoring constants ──

const FIRST_CHAR_BONUS = 0.5;
const CONTIGUOUS_BONUS = 0.3;
const SEPARATOR_BONUS = 0.2;
const CASE_MATCH_BONUS = 0.1;

function isSeparator(ch: string): boolean {
  return ch === "_" || ch === "-" || ch === "." || ch === "/" || ch === "\\" || ch === " ";
}

/**
 * Scores how well `pattern` matches `target` using character-sequential
 * fuzzy matching (similar to fzf / Sublime Text).
 *
 * Each character in `pattern` must appear in `target` in order, but they
 * may be separated by gaps.  Contiguous runs and characters that follow
 * separators (`_`, `-`, `.`, `/`, ` `, `\\`) receive bonus points.
 *
 * Returns `null` when the pattern cannot be matched at all.
 *
 * @param pattern - The search pattern (typically typed by the user).
 * @param target - The string being searched.
 * @returns A {@link FuzzyMatchResult} or `null`.
 *
 * @example
 * ```ts
 * fuzzyMatch("any", "anyhow");  // { score: ~0.85, matched: "any" }
 * fuzzyMatch("ah", "anyhow");   // { score: ~0.55, matched: "ah" }
 * fuzzyMatch("zzz", "anyhow");  // null
 * ```
 */
export function fuzzyMatch(pattern: string, target: string): FuzzyMatchResult | null {
  if (pattern.length === 0) return { score: 1, matched: "" };
  if (target.length === 0) return null;

  const pLower = pattern.toLowerCase();
  const tLower = target.toLowerCase();

  let pi = 0;
  let score = 0;
  let prevMatchIdx = -1;
  let matched = "";

  for (let ti = 0; ti < target.length && pi < pattern.length; ti++) {
    if (tLower[ti] !== pLower[pi]) continue;

    const ch = target[ti]!;
    matched += ch;

    // Base score for matching this character
    let charScore = 1;

    // Bonus for contiguous matches
    if (prevMatchIdx !== -1 && ti === prevMatchIdx + 1) {
      charScore += CONTIGUOUS_BONUS;
    }

    // Bonus for matching after a separator
    if (ti > 0 && isSeparator(target[ti - 1]!)) {
      charScore += SEPARATOR_BONUS;
    }

    // Bonus for first character match
    if (pi === 0 && ti === 0) {
      charScore += FIRST_CHAR_BONUS;
    }

    // Bonus for exact case match
    if (ch === pattern[pi]) {
      charScore += CASE_MATCH_BONUS;
    }

    score += charScore;
    prevMatchIdx = ti;
    pi++;
  }

  // Didn't match all pattern characters
  if (pi < pattern.length) return null;

  // Normalize: maximum possible score if every character matched consecutively
  // at ideal positions
  const maxScore = pattern.length * (1 + CONTIGUOUS_BONUS) + FIRST_CHAR_BONUS;
  const normalized = Math.min(score / maxScore, 1);

  return { score: Math.round(normalized * 100) / 100, matched };
}

/**
 * A single item in the result array of {@link fuzzyFilter}.
 *
 * @typeParam T - The type of the original item.
 */
export interface FuzzyFilterResult<T> {
  /** The original item. */
  item: T;
  /** The fuzzy match score (0–1). */
  score: number;
  /** The match details from {@link fuzzyMatch}. */
  matches: FuzzyMatchResult;
}

/**
 * Filters and ranks an array of strings against a fuzzy pattern.
 *
 * Only items where every character of `pattern` can be matched in order are
 * included.  Results are sorted by score descending (best match first).
 *
 * @typeParam T - The item type (must extend `string`).
 * @param pattern - The search pattern.
 * @param items - The list of strings to search.
 * @returns An array of {@link FuzzyFilterResult}, sorted by score descending.
 *
 * @example
 * ```ts
 * const files = ["src/result/result.ts", "src/result/static.ts", "src/async/retry.ts"];
 * fuzzyFilter("res", files);
 * // => [
 * //   { item: "src/result/result.ts", score: 0.63, ... },
 * //   { item: "src/result/static.ts", score: 0.42, ... },
 * // ]
 * ```
 */
export function fuzzyFilter<T extends string>(pattern: string, items: T[]): FuzzyFilterResult<T>[] {
  if (pattern.length === 0) {
    return items.map((item) => ({
      item,
      score: 1,
      matches: { score: 1, matched: "" },
    }));
  }

  const results: FuzzyFilterResult<T>[] = [];

  for (const item of items) {
    const match = fuzzyMatch(pattern, item);
    if (match) {
      results.push({ item, score: match.score, matches: match });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}
