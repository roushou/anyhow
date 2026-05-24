/**
 * Computes the Levenshtein (edit) distance between two strings — the minimum
 * number of single-character edits (insertions, deletions, or substitutions)
 * required to change `a` into `b`.
 *
 * Uses the Wagner-Fischer algorithm with O(n) memory.
 *
 * @param a - The source string.
 * @param b - The target string.
 * @returns The edit distance.
 *
 * @example
 * ```ts
 * levenshtein("kitten", "sitting"); // 3
 * levenshtein("book", "back");      // 2
 * levenshtein("", "hello");         // 5
 * levenshtein("abc", "abc");        // 0
 * ```
 */
export function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Ensure `a` is the shorter string for the row optimization
  if (a.length > b.length) {
    [a, b] = [b, a];
  }

  const m = a.length;
  const n = b.length;

  // Single-row DP
  let prev = new Uint16Array(m + 1);
  for (let i = 0; i <= m; i++) prev[i] = i;

  for (let j = 1; j <= n; j++) {
    const curr = new Uint16Array(m + 1);
    curr[0] = j;
    for (let i = 1; i <= m; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[i] = Math.min(
        curr[i - 1]! + 1, // insertion
        prev[i]! + 1, // deletion
        prev[i - 1]! + cost, // substitution
      );
    }
    prev = curr;
  }

  return prev[m]!;
}

/**
 * Returns a normalized similarity score between `0` and `1` derived from the
 * {@link levenshtein} distance.  `1` means the strings are identical; `0`
 * means they share no characters.
 *
 * @param a - The source string.
 * @param b - The target string.
 * @returns A similarity score between 0 and 1.
 *
 * @example
 * ```ts
 * levenshteinRatio("kitten", "sitting"); // ≈ 0.57
 * levenshteinRatio("abc", "abc");        // 1
 * levenshteinRatio("abc", "xyz");        // 0
 * ```
 */
export function levenshteinRatio(a: string, b: string): number {
  if (a.length === 0 && b.length === 0) return 1;
  const maxLen = Math.max(a.length, b.length);
  return 1 - levenshtein(a, b) / maxLen;
}
