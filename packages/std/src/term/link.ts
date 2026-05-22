/**
 * Creates an OSC 8 hyperlink escape sequence.
 * In terminals that support it, renders `text` as a clickable link
 * with `url` as the target.
 *
 * @param text - The visible link text.
 * @param url - The hyperlink target URL.
 * @returns The ANSI escape-wrapped hyperlink string.
 *
 * @example
 * ```ts
 * console.log(link("View docs", "https://example.com"));
 * ```
 */
export const link = (text: string, url: string): string => `\x1b]8;;${url}\x07${text}\x1b]8;;\x07`;
