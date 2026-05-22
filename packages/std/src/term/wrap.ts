import { stripAnsi } from "./ansi.js";

/**
 * Wraps text to fit within `width` columns, preserving ANSI escape codes.
 * Breaks at word boundaries by default; use `{ hard: true }` for exact-width
 * breaks.
 *
 * @param text - The text to wrap (may contain ANSI escape codes).
 * @param width - Maximum line width in columns.
 * @param opts.indent - Spaces to prefix continuation lines (default 0).
 * @param opts.hard - When `true`, breaks at exact width regardless of words.
 * @returns The wrapped text with `\n` line separators.
 *
 * @example
 * ```ts
 * wordWrap("hello world", 6);         // "hello\nworld"
 * wordWrap("hello world", 6, { indent: 2 }); // "hello\n  world"
 * ```
 */
export function wordWrap(
  text: string,
  width: number,
  opts?: { indent?: number; hard?: boolean },
): string {
  const indent = opts?.indent ?? 0;
  const hard = opts?.hard ?? false;
  const indentStr = " ".repeat(indent);

  if (stripAnsi(text).length <= width) return text;

  // Split into tokens: each is either an ANSI escape sequence or a
  // whitespace-delimited word (without the spaces).
  const tokens = tokenize(text);

  const lines: string[] = [];
  let lineBuf = "";
  let lineVisible = 0;
  let lineCodes = ""; // active ANSI codes to re-emit on continuation lines

  for (const token of tokens) {
    if (token.isEscape) {
      lineBuf += token.text;
      lineCodes = mergeCodes(lineCodes, token.text);
      continue;
    }

    const word = token.text;
    const wordVisible = stripAnsi(word).length;

    // Single word wider than the line
    if (wordVisible > width) {
      if (lineBuf) {
        lines.push(lineBuf);
        lineBuf = "";
        lineVisible = 0;
      }
      if (hard) {
        lines.push(...hardWrapWord(word, width, indentStr, lineCodes));
      } else {
        lines.push((indentStr && lines.length > 0 ? indentStr : "") + lineCodes + word);
      }
      lineBuf = "";
      lineVisible = 0;
      continue;
    }

    // Would adding this word (plus a space) overflow?
    const need = lineVisible === 0 ? wordVisible : wordVisible + 1;
    if (lineVisible + need > width && lineVisible > 0) {
      lines.push(lineBuf + (lineCodes ? "\x1b[0m" : ""));
      lineBuf = indentStr + lineCodes + word;
      lineVisible = indent + wordVisible;
    } else {
      if (lineVisible > 0) {
        lineBuf += " ";
        lineVisible++;
      }
      lineBuf += word;
      lineVisible += wordVisible;
    }
  }

  if (lineBuf) lines.push(lineBuf);
  return lines.join("\n");
}

/**
 * Tokenizes text into ANSI escape sequences and plain-text words.
 */
function tokenize(text: string): { text: string; isEscape: boolean }[] {
  const tokens: { text: string; isEscape: boolean }[] = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] === "\x1b" && text[i + 1] === "[") {
      let seq = "\x1b[";
      i += 2;
      while (i < text.length && !/[A-Za-z]/.test(text[i]!)) seq += text[i++];
      if (i < text.length) seq += text[i++];
      tokens.push({ text: seq, isEscape: true });
    } else if (text[i] === " ") {
      i++; // skip spaces; they're implied between tokens
    } else {
      let word = "";
      while (i < text.length && text[i] !== " " && !(text[i] === "\x1b" && text[i + 1] === "[")) {
        word += text[i++];
      }
      tokens.push({ text: word, isEscape: false });
    }
  }

  return tokens;
}

/**
 * Merges an ANSI escape sequence into the active code set.
 * Reset codes (ending in 0 or empty) clear the state.
 */
function mergeCodes(current: string, seq: string): string {
  // An SGR sequence looks like \x1b[...m
  if (!seq.startsWith("\x1b[") || !seq.endsWith("m")) return current + seq;
  const inner = seq.slice(2, -1);
  const codes = inner.split(";").filter(Boolean);
  if (codes.length === 0 || codes.includes("0")) return "";
  return current + seq;
}

function hardWrapWord(word: string, width: number, indentStr: string, lineCodes: string): string[] {
  const lines: string[] = [];
  let buf = "";
  let visible = 0;
  let curCodes = "";
  let first = true;

  for (let i = 0; i < word.length; i++) {
    const ch = word[i]!;

    if (ch === "\x1b" && word[i + 1] === "[") {
      let seq = "\x1b[";
      i += 2;
      while (i < word.length && !/[A-Za-z]/.test(word[i]!)) seq += word[i++];
      if (i < word.length) seq += word[i++];
      buf += seq;
      curCodes = mergeCodes(curCodes, seq);
      continue;
    }

    buf += ch;
    visible++;

    if (visible >= width) {
      lines.push((first ? "" : indentStr + lineCodes) + buf);
      buf = indentStr + lineCodes + curCodes;
      visible = 0;
      first = false;
    }
  }

  if (buf && visible > 0) lines.push((first ? "" : indentStr + lineCodes) + buf);
  return lines.length ? lines : [word];
}
