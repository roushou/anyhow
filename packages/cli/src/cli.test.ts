import { describe, it, expect } from "bun:test";
import { defineCommand, defineCli, parseCommand } from "./index.js";

// ── defineCommand ──

describe("defineCommand", () => {
  it("creates a command with arguments only", () => {
    const cmd = defineCommand({
      name: "build",
      description: "Build the project",
      arguments: { src: { type: "string", required: true } },
      action: () => {},
    });
    expect(cmd.name).toBe("build");
    expect(cmd.description).toBe("Build the project");
    expect(cmd.arguments).toEqual({ src: { type: "string", required: true } });
    expect(cmd.options).toEqual({});
  });

  it("creates a command with options only", () => {
    const cmd = defineCommand({
      name: "lint",
      description: "Lint the project",
      options: { fix: { type: "boolean", short: "f" } },
      action: () => {},
    });
    expect(cmd.name).toBe("lint");
    expect(cmd.arguments).toEqual({});
    expect(cmd.options).toEqual({ fix: { type: "boolean", short: "f" } });
  });

  it("creates a command with both arguments and options", () => {
    const cmd = defineCommand({
      name: "deploy",
      description: "Deploy",
      arguments: { env: { type: "string", required: true } },
      options: {
        force: { type: "boolean", short: "f" },
        target: { type: "string", short: "t", default: "production" },
      },
      action: () => {},
    });
    expect(cmd.name).toBe("deploy");
    expect(Object.keys(cmd.arguments)).toEqual(["env"]);
    expect(Object.keys(cmd.options)).toEqual(["force", "target"]);
  });
});

// ── parseCommand ──

describe("parseCommand", () => {
  it("parses required positional args", () => {
    const cmd = defineCommand({
      name: "greet",
      description: "Greet",
      arguments: { name: { type: "string", required: true } },
      action: () => {},
    });
    const result = parseCommand(cmd, ["world"]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.args).toEqual({ name: "world" });
    }
  });

  it("returns Err when required arg is missing", () => {
    const cmd = defineCommand({
      name: "greet",
      description: "Greet",
      arguments: { name: { type: "string", required: true } },
      action: () => {},
    });
    const result = parseCommand(cmd, []);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("Missing required argument: name");
    }
  });

  it("yields undefined for optional args when missing", () => {
    const cmd = defineCommand({
      name: "echo",
      description: "Echo",
      arguments: { message: { type: "string" }, times: { type: "number" } },
      action: () => {},
    });
    const result = parseCommand(cmd, []);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.args.message).toBeUndefined();
      expect(result.value.args.times).toBeUndefined();
    }
  });

  it("applies arg defaults when not provided", () => {
    const cmd = defineCommand({
      name: "echo",
      description: "Echo",
      arguments: { message: { type: "string", default: "hi" } },
      action: () => {},
    });
    const result = parseCommand(cmd, []);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.args.message).toBe("hi");
    }
  });

  it("parses boolean options with --flag", () => {
    const cmd = defineCommand({
      name: "run",
      description: "Run",
      options: { verbose: { type: "boolean" } },
      action: () => {},
    });
    const result = parseCommand(cmd, ["--verbose"]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.options.verbose).toBe(true);
    }
  });

  it("boolean option absent yields default (false)", () => {
    const cmd = defineCommand({
      name: "run",
      description: "Run",
      options: { verbose: { type: "boolean", default: false } },
      action: () => {},
    });
    const result = parseCommand(cmd, []);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.options.verbose).toBe(false);
    }
  });

  it("parses short flags (-f)", () => {
    const cmd = defineCommand({
      name: "deploy",
      description: "Deploy",
      options: { force: { type: "boolean", short: "f" } },
      action: () => {},
    });
    const result = parseCommand(cmd, ["-f"]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.options.force).toBe(true);
    }
  });

  it("parses string options with --opt value", () => {
    const cmd = defineCommand({
      name: "build",
      description: "Build",
      options: { target: { type: "string", default: "production" } },
      action: () => {},
    });
    const result = parseCommand(cmd, ["--target", "staging"]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.options.target).toBe("staging");
    }
  });

  it("parses number options with --opt value", () => {
    const cmd = defineCommand({
      name: "process",
      description: "Process",
      options: { count: { type: "number", default: 1 } },
      action: () => {},
    });
    const result = parseCommand(cmd, ["--count", "5"]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.options.count).toBe(5);
    }
  });

  it("applies option defaults when flag is absent", () => {
    const cmd = defineCommand({
      name: "build",
      description: "Build",
      options: {
        target: { type: "string", default: "production" },
        force: { type: "boolean", default: false },
      },
      action: () => {},
    });
    const result = parseCommand(cmd, []);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.options.target).toBe("production");
      expect(result.value.options.force).toBe(false);
    }
  });

  it("reports unknown options", () => {
    const cmd = defineCommand({
      name: "run",
      description: "Run",
      options: {},
      action: () => {},
    });
    const result = parseCommand(cmd, ["--unknown"]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("Unknown option: --unknown");
    }
  });

  it("recognizes -- as end-of-options marker", () => {
    const cmd = defineCommand({
      name: "echo",
      description: "Echo",
      arguments: { text: { type: "string", required: true } },
      action: () => {},
    });
    const result = parseCommand(cmd, ["--", "--help"]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.args.text).toBe("--help");
    }
  });

  it("handles multiple args and options together", () => {
    const cmd = defineCommand({
      name: "copy",
      description: "Copy",
      arguments: {
        src: { type: "string", required: true },
        dest: { type: "string", required: true },
      },
      options: { force: { type: "boolean", short: "f" }, mode: { type: "string", default: "644" } },
      action: () => {},
    });
    const result = parseCommand(cmd, ["a.txt", "b.txt", "--force", "--mode", "755"]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.args.src).toBe("a.txt");
      expect(result.value.args.dest).toBe("b.txt");
      expect(result.value.options.force).toBe(true);
      expect(result.value.options.mode).toBe("755");
    }
  });
});

// ── defineCli ──

describe("defineCli", () => {
  it("parse returns the correct command name", () => {
    const cli = defineCli({
      name: "cli",
      commands: [
        defineCommand({ name: "status", description: "Status", options: {}, action: () => {} }),
      ],
    });
    const result = cli.parse(["status"]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.command).toBe("status");
    }
  });

  it("parse returns parsed args and options", () => {
    const cli = defineCli({
      name: "cli",
      commands: [
        defineCommand({
          name: "greet",
          description: "Greet",
          arguments: { name: { type: "string", required: true } },
          options: { loud: { type: "boolean" } },
          action: () => {},
        }),
      ],
    });
    const result = cli.parse(["greet", "Alice", "--loud"]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.command).toBe("greet");
      expect(result.value.args.name).toBe("Alice");
      expect(result.value.options.loud).toBe(true);
    }
  });

  it("parse returns Err for unknown command", () => {
    const cli = defineCli({
      name: "cli",
      commands: [
        defineCommand({ name: "status", description: "Status", options: {}, action: () => {} }),
      ],
    });
    const result = cli.parse(["unknown"]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("Unknown command");
    }
  });

  it("parse returns Err when no command is given", () => {
    const cli = defineCli({
      name: "cli",
      commands: [],
    });
    const result = cli.parse([]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("Usage");
    }
  });

  it("run executes the matching command action", async () => {
    let called = false;
    const cli = defineCli({
      name: "cli",
      commands: [
        defineCommand({
          name: "test",
          description: "Test",
          options: {},
          action: () => {
            called = true;
          },
        }),
      ],
    });
    const result = await cli.run(["test"]);
    expect(result.ok).toBe(true);
    expect(called).toBe(true);
  });

  it("run passes parsed args and options to action", async () => {
    let received: any = null;
    const cli = defineCli({
      name: "cli",
      commands: [
        defineCommand({
          name: "greet",
          description: "Greet",
          arguments: { name: { type: "string", required: true } },
          options: { loud: { type: "boolean" } },
          action: (ctx) => {
            received = ctx;
          },
        }),
      ],
    });
    const result = await cli.run(["greet", "Alice", "--loud"]);
    expect(result.ok).toBe(true);
    expect(received).toEqual({ args: { name: "Alice" }, options: { loud: true } });
  });

  it("run returns Err for unknown command", async () => {
    const cli = defineCli({
      name: "cli",
      commands: [
        defineCommand({ name: "status", description: "Status", options: {}, action: () => {} }),
      ],
    });
    const result = await cli.run(["unknown"]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toContain("Unknown command");
    }
  });

  it("run returns Err when action throws", async () => {
    const cli = defineCli({
      name: "cli",
      commands: [
        defineCommand({
          name: "fail",
          description: "Fail",
          options: {},
          action: () => {
            throw new Error("boom");
          },
        }),
      ],
    });
    const result = await cli.run(["fail"]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("boom");
    }
  });
});

// ── output ──

describe("output", () => {
  it("table formats aligned columns", async () => {
    const { table } = await import("./output.js");
    const result = table([
      ["Name", "Age"],
      ["Alice", "30"],
      ["Bob", "25"],
    ]);
    expect(result).toBe("Name   Age\nAlice  30 \nBob    25 ");
  });

  it("indent prepends spaces to lines", async () => {
    const { indent } = await import("./output.js");
    const result = indent("hello\nworld", 2);
    expect(result).toBe("  hello\n  world");
  });

  it("box wraps text", async () => {
    const { box } = await import("./output.js");
    const result = box("hello");
    expect(result).toBe("┌───────┐\n│ hello │\n└───────┘");
  });

  it("bold wraps in ANSI codes", async () => {
    const { bold } = await import("./output.js");
    expect(bold("x")).toBe("\x1b[1mx\x1b[22m");
  });

  it("stripAnsi removes escape sequences", async () => {
    const { stripAnsi } = await import("./output.js");
    expect(stripAnsi("\x1b[31merror\x1b[39m")).toBe("error");
  });

  it("hr produces a horizontal rule of terminal width", async () => {
    const { hr } = await import("./output.js");
    const result = hr();
    const width = process.stdout.columns || 80;
    expect(result.length).toBe(width);
    expect(result).toMatch(/^─+$/);
  });
});
