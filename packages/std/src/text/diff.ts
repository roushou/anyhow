/**
 * A single operation in a diff.
 *
 * - `"equal"`  — the value is present in both inputs.
 * - `"insert"` — the value only appears in the new (second) input.
 * - `"delete"` — the value only appears in the old (first) input.
 */
export type DiffOp = {
  type: "equal" | "insert" | "delete";
  value: string;
};

/**
 * Computes a line-level diff between two strings using longest-common-subsequence.
 *
 * The result is an array of {@link DiffOp} entries that, when their values are
 * concatenated (ignoring deletes), will reconstruct each input.
 *
 * @param a - The old text.
 * @param b - The new text.
 * @returns An array of diff operations.
 *
 * @example
 * ```ts
 * diffLines("hello\\nworld", "hello\\nWORLD\\nfoo");
 * // => [
 * //   { type: "equal",  value: "hello" },
 * //   { type: "delete", value: "world" },
 * //   { type: "insert", value: "WORLD" },
 * //   { type: "insert", value: "foo" },
 * // ]
 * ```
 */
export function diffLines(a: string, b: string): DiffOp[] {
  // split("\n") on empty string produces [""], not [] — handle explicitly
  const aLines = a === "" ? [] : a.split("\n");
  const bLines = b === "" ? [] : b.split("\n");
  return diffArray(aLines, bLines);
}

/**
 * Computes a word-level diff between two strings.
 *
 * Words are split on whitespace boundaries.  The diff preserves the whitespace
 * exactly as it appears in the input.
 *
 * @param a - The old text.
 * @param b - The new text.
 * @returns An array of diff operations.
 *
 * @example
 * ```ts
 * diffWords("the quick brown fox", "the slow brown dog");
 * // => [
 * //   { type: "equal",  value: "the " },
 * //   { type: "delete", value: "quick" },
 * //   { type: "insert", value: "slow" },
 * //   { type: "equal",  value: " brown " },
 * //   { type: "delete", value: "fox" },
 * //   { type: "insert", value: "dog" },
 * // ]
 * ```
 */
export function diffWords(a: string, b: string): DiffOp[] {
  const aWords = splitWords(a);
  const bWords = splitWords(b);
  return diffArray(aWords, bWords);
}

// ── Internals ──

/** Splits a string into tokens, separating words from whitespace. */
function splitWords(str: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < str.length) {
    if (str[i] === " " || str[i] === "\t" || str[i] === "\n") {
      // Collect contiguous whitespace as one token
      let ws = "";
      while (i < str.length && (str[i] === " " || str[i] === "\t" || str[i] === "\n")) {
        ws += str[i]!;
        i++;
      }
      tokens.push(ws);
    } else {
      // Collect contiguous non-whitespace as one token
      let word = "";
      while (i < str.length && str[i] !== " " && str[i] !== "\t" && str[i] !== "\n") {
        word += str[i]!;
        i++;
      }
      tokens.push(word);
    }
  }
  return tokens;
}

/** Generic array diff using LCS. */
function diffArray<T>(a: T[], b: T[]): DiffOp[] {
  const lcs = computeLCS(a, b);
  const ops: DiffOp[] = [];

  let ai = 0;
  let bi = 0;
  let li = 0;

  while (ai < a.length || bi < b.length) {
    const lcsItem = lcs[li];

    if (
      li < lcs.length &&
      ai < a.length &&
      eq(a[ai]!, lcsItem) &&
      bi < b.length &&
      eq(b[bi]!, lcsItem)
    ) {
      ops.push({ type: "equal", value: String(lcsItem) });
      ai++;
      bi++;
      li++;
    } else if (ai < a.length && (li >= lcs.length || !eq(a[ai]!, lcsItem))) {
      ops.push({ type: "delete", value: String(a[ai]!) });
      ai++;
    } else if (bi < b.length && (li >= lcs.length || !eq(b[bi]!, lcsItem))) {
      ops.push({ type: "insert", value: String(b[bi]!) });
      bi++;
    } else {
      // Safety: should not reach here, but advance to avoid infinite loop
      ai++;
      bi++;
    }
  }

  return ops;
}

function eq<T>(a: T, b: T): boolean {
  return a === b || String(a) === String(b);
}

/** Computes the longest common subsequence of two arrays using DP. */
function computeLCS<T>(a: T[], b: T[]): T[] {
  const m = a.length;
  const n = b.length;

  // Build DP table
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from<number>({ length: n + 1 }).fill(0),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (eq(a[i - 1]!, b[j - 1]!)) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }

  // Backtrack to reconstruct LCS
  const result: T[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (eq(a[i - 1]!, b[j - 1]!)) {
      result.unshift(a[i - 1]!);
      i--;
      j--;
    } else if (dp[i - 1]![j]! > dp[i]![j - 1]!) {
      i--;
    } else {
      j--;
    }
  }

  return result;
}
