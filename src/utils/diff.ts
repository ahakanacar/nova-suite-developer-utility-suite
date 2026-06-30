export interface DiffChange {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

/**
 * Computes a line-by-line diff between two strings using a dynamic programming LCS algorithm.
 * Optimized for standard document sizes.
 */
export function computeLineDiff(oldText: string, newText: string): DiffChange[] {
  const oldLines = oldText.split(/\r?\n/);
  const newLines = newText.split(/\r?\n/);

  const n = oldLines.length;
  const m = newLines.length;

  // Initialize DP table for LCS
  const dp: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result: DiffChange[] = [];
  let i = n;
  let j = m;

  // Backtrack to find edits
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({
        type: 'unchanged',
        value: oldLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({
        type: 'added',
        value: newLines[j - 1],
        newLineNumber: j
      });
      j--;
    } else {
      result.unshift({
        type: 'removed',
        value: oldLines[i - 1],
        oldLineNumber: i
      });
      i--;
    }
  }

  return result;
}

export interface WordDiffToken {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
}

/**
 * Computes word-level diffs between two strings (usually single lines)
 * using token/word level LCS dynamic programming.
 */
export function computeWordDiff(oldLine: string, newLine: string): WordDiffToken[] {
  // Regex splits by whitespace, Unicode letters/digits, or other single punctuation symbols.
  // Using \p{L} with 'u' flag correctly handles Turkish and all other non-ASCII character sets.
  const tokenRegex = /(\s+|[\p{L}0-9]+|[^\p{L}0-9\s])/gu;
  const oldTokens = oldLine.match(tokenRegex) || [];
  const newTokens = newLine.match(tokenRegex) || [];

  const n = oldTokens.length;
  const m = newTokens.length;

  const dp: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(m + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (oldTokens[i - 1] === newTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result: WordDiffToken[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
      result.unshift({
        type: 'unchanged',
        value: oldTokens[i - 1]
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({
        type: 'added',
        value: newTokens[j - 1]
      });
      j--;
    } else {
      result.unshift({
        type: 'removed',
        value: oldTokens[i - 1]
      });
      i--;
    }
  }

  return result;
}

