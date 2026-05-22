import { describe, expect, it } from "bun:test";
import { Spinner, SPINNER_FRAMES } from "./spinner.js";
import { sleep } from "../async/timing.js";

/** A writable stream that captures everything written to it. */
class CaptureStream {
  data = "";
  isTTY = true;
  write(chunk: string) {
    this.data += chunk;
    return true;
  }
}

function capture(): CaptureStream {
  return new CaptureStream();
}

describe("Spinner", () => {
  it("constructs with a string", () => {
    const s = new Spinner("Loading...");
    expect(s).toBeDefined();
  });

  it("constructs with options", () => {
    const s = new Spinner({ text: "Wait", frames: SPINNER_FRAMES.line, interval: 100 });
    expect(s).toBeDefined();
  });

  it("start writes to stream", async () => {
    const stream = capture();
    const s = new Spinner({ text: "Working", stream: stream as any, interval: 10 });
    s.start();
    await sleep(50);
    s.stop();
    // Should have written cursor hide + at least one frame
    expect(stream.data).toContain("\x1b[?25l");
    expect(stream.data).toContain("Working");
  });

  it("stop clears spinner and writes final text", async () => {
    const stream = capture();
    const s = new Spinner({ text: "Working", stream: stream as any, interval: 10 });
    s.start();
    await sleep(50);
    s.stop("Done!");
    expect(stream.data).toContain("\x1b[2K\r"); // clearLine
    expect(stream.data).toContain("Done!");
    expect(stream.data).toContain("\x1b[?25h"); // cursorShow
  });

  it("stop without final text clears the line", async () => {
    const stream = capture();
    const s = new Spinner({ text: "Working", stream: stream as any, interval: 10 });
    s.start();
    await sleep(50);
    s.stop();
    expect(stream.data).toContain("\x1b[2K\r"); // clearLine
  });

  it("update changes the text while spinning", async () => {
    const stream = capture();
    const s = new Spinner({ text: "Starting", stream: stream as any, interval: 10 });
    s.start();
    await sleep(30);
    s.update("Processing");
    await sleep(30);
    s.stop();
    expect(stream.data).toContain("Processing");
  });

  it("run wraps an async function", async () => {
    const stream = capture();
    const s = new Spinner({ text: "Running", stream: stream as any, interval: 10 });
    const result = await s.run(async () => {
      await sleep(30);
      return 42;
    });
    expect(result).toBe(42);
    expect(stream.data).toContain("\x1b[?25h"); // cursor shown after
  });

  it("run stops spinner even if fn throws", async () => {
    const stream = capture();
    const s = new Spinner({ text: "Will fail", stream: stream as any, interval: 10 });
    await expect(s.run(() => Promise.reject(new Error("boom")))).rejects.toThrow("boom");
    // Cursor should be shown again
    expect(stream.data).toContain("\x1b[?25h");
  });

  it("start is idempotent", async () => {
    const stream = capture();
    const s = new Spinner({ text: "Working", stream: stream as any, interval: 10 });
    s.start();
    s.start(); // second start should no-op
    await sleep(30);
    s.stop();
    // Should not have duplicate cursor hides
    const hides = stream.data.split("\x1b[?25l").length - 1;
    expect(hides).toBe(1);
  });

  it("stop is idempotent", async () => {
    const stream = capture();
    const s = new Spinner({ text: "Working", stream: stream as any, interval: 10 });
    s.start();
    await sleep(30);
    s.stop();
    s.stop(); // second stop should no-op
    const shows = stream.data.split("\x1b[?25h").length - 1;
    expect(shows).toBe(1);
  });

  it("uses custom frames", async () => {
    const stream = capture();
    const s = new Spinner({ frames: ["X", "Y"], stream: stream as any, interval: 10 });
    s.start();
    await sleep(50);
    s.stop();
    expect(stream.data).toContain("X");
    expect(stream.data).toContain("Y");
  });

  it("renders spinner without text", async () => {
    const stream = capture();
    const s = new Spinner({ stream: stream as any, interval: 10 });
    s.start();
    await sleep(30);
    s.stop();
    // Should have frames but no text
    expect(stream.data).toContain("⠋");
  });

  it("defaults to dots frames", async () => {
    const stream = capture();
    const s = new Spinner({ stream: stream as any, interval: 10 });
    s.start();
    await sleep(30);
    s.stop();
    expect(SPINNER_FRAMES.dots.some((f) => stream.data.includes(f))).toBe(true);
  });
});
