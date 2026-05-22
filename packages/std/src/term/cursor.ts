/**
 * Clears the terminal screen and moves the cursor to the top-left.
 *
 * @example
 * ```ts
 * process.stdout.write(clearScreen());
 * ```
 */
export const clearScreen = (): string => "\x1b[2J\x1b[H";

/**
 * Clears the current line from the cursor position to the end,
 * and moves the cursor to the start of the line.
 *
 * @example
 * ```ts
 * process.stdout.write(clearLine());
 * ```
 */
export const clearLine = (): string => "\x1b[2K\r";

/**
 * Moves the cursor to the given column and row (0-based).
 *
 * @param col - 0-based column index.
 * @param row - 0-based row index.
 * @returns The ANSI escape sequence.
 *
 * @example
 * ```ts
 * process.stdout.write(cursorTo(0, 0)); // top-left
 * ```
 */
export const cursorTo = (col: number, row: number): string => `\x1b[${row + 1};${col + 1}H`;

/**
 * Moves the cursor up by `n` lines.
 *
 * @param n - Number of lines to move up (default 1).
 */
export const cursorUp = (n = 1): string => `\x1b[${n}A`;

/**
 * Moves the cursor down by `n` lines.
 *
 * @param n - Number of lines to move down (default 1).
 */
export const cursorDown = (n = 1): string => `\x1b[${n}B`;

/**
 * Moves the cursor right by `n` columns.
 *
 * @param n - Number of columns to move right (default 1).
 */
export const cursorRight = (n = 1): string => `\x1b[${n}C`;

/**
 * Moves the cursor left by `n` columns.
 *
 * @param n - Number of columns to move left (default 1).
 */
export const cursorLeft = (n = 1): string => `\x1b[${n}D`;

/**
 * Hides the cursor.
 */
export const cursorHide = (): string => "\x1b[?25l";

/**
 * Shows the cursor.
 */
export const cursorShow = (): string => "\x1b[?25h";

/**
 * Saves the current cursor position.
 */
export const cursorSave = (): string => "\x1b[s";

/**
 * Restores a previously saved cursor position.
 */
export const cursorRestore = (): string => "\x1b[u";
