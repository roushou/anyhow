import { cursorHide, cursorShow } from "./cursor.js";
import { clearLine } from "./cursor.js";

/**
 * Built-in spinner frame sets.
 */
export const SPINNER_FRAMES = {
  dots: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  line: ["|", "/", "-", "\\"],
  arc: ["◜", "◠", "◝", "◞", "◡", "◟"],
  bounce: ["⠁", "⠂", "⠄", "⠂"],
  arrow: ["←", "↖", "↑", "↗", "→", "↘", "↓", "↙"],
} as const;

/**
 * Options for {@link Spinner}.
 */
export interface SpinnerOpts {
  /** Text displayed next to the spinner. */
  text?: string;
  /** Animation frames. Defaults to {@link SPINNER_FRAMES.dots}. */
  frames?: readonly string[];
  /** Milliseconds between frame changes. Default 80. */
  interval?: number;
  /** Output stream. Defaults to `process.stderr`. */
  stream?: NodeJS.WriteStream;
}

/**
 * A terminal spinner for indicating progress during async operations.
 *
 * @example
 * ```ts
 * const spinner = new Spinner("Loading...");
 * spinner.start();
 * await doWork();
 * spinner.stop("Done!");
 * ```
 *
 * @example
 * ```ts
 * const spinner = new Spinner({ text: "Fetching...", frames: SPINNER_FRAMES.arc });
 * const result = await spinner.run(() => fetchData());
 * ```
 */
export class Spinner {
  #text: string;
  #frames: readonly string[];
  #interval: number;
  #stream: NodeJS.WriteStream;
  #timer: ReturnType<typeof setInterval> | null = null;
  #frameIndex = 0;
  #active = false;

  constructor(opts?: string | SpinnerOpts) {
    const o = typeof opts === "string" ? { text: opts } : (opts ?? {});
    this.#text = o.text ?? "";
    this.#frames = o.frames ?? SPINNER_FRAMES.dots;
    this.#interval = o.interval ?? 80;
    this.#stream = o.stream ?? (process.stderr as NodeJS.WriteStream);
  }

  /**
   * Starts the spinner animation.
   */
  start(): void {
    if (this.#active) return;
    this.#active = true;
    this.#frameIndex = 0;
    this.#stream.write(cursorHide());
    this.#render();
    this.#timer = setInterval(() => this.#render(), this.#interval);
    // Prevent the timer from keeping the process alive
    if (this.#timer && typeof this.#timer === "object" && "unref" in this.#timer) {
      this.#timer.unref();
    }
  }

  /**
   * Stops the spinner and optionally writes a final message.
   *
   * @param finalText - Text to display in place of the spinner. If omitted,
   *   clears the spinner line.
   */
  stop(finalText?: string): void {
    if (!this.#active) return;
    this.#active = false;
    if (this.#timer) {
      clearInterval(this.#timer);
      this.#timer = null;
    }
    this.#stream.write(clearLine());
    if (finalText !== undefined) {
      this.#stream.write(`${finalText}\n`);
    }
    this.#stream.write(cursorShow());
  }

  /**
   * Updates the spinner text while running.
   *
   * @param text - The new message to display.
   */
  update(text: string): void {
    this.#text = text;
    if (this.#active) this.#render();
  }

  /**
   * Runs an async function with the spinner active.
   * The spinner is stopped automatically when the function resolves or throws.
   *
   * @typeParam T - The return type of `fn`.
   * @param fn - The async function to run.
   * @returns The result of `fn`.
   *
   * @example
   * ```ts
   * const result = await spinner.run(() => fetchData());
   * ```
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    this.start();
    try {
      return await fn();
    } finally {
      this.stop();
    }
  }

  /**
   * Renders the current frame to the stream.
   */
  #render(): void {
    const frame = this.#frames[this.#frameIndex % this.#frames.length]!;
    this.#frameIndex++;
    const line = this.#text ? `${frame} ${this.#text}` : frame;
    this.#stream.write(`${clearLine()}${line}`);
  }
}
