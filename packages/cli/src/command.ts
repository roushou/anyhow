import type { ArgConfig, OptConfig, InferArgs, InferOpts } from "./types.js";
import { err, Result } from "@anyhow/std/result";
import { parseCommand } from "./parser.js";

// ── Types ──

/**
 * Configuration object for {@link defineCommand}.
 *
 * @typeParam TArgs - Record of argument definitions (e.g. `{ src: { type: "string", required: true } }`).
 * @typeParam TOpts - Record of option definitions (e.g. `{ force: { type: "boolean" } }`).
 */
export interface CommandConfig<
  TArgs extends Record<string, ArgConfig>,
  TOpts extends Record<string, OptConfig>,
> {
  name: string;
  description: string;
  arguments?: TArgs;
  options?: TOpts;
  action: (ctx: { args: InferArgs<TArgs>; options: InferOpts<TOpts> }) => void | Promise<void>;
}

/**
 * A normalized command definition produced by {@link defineCommand}.
 *
 * Unlike {@link CommandConfig}, the type parameters are erased — arguments
 * and options are stored as plain records keyed by string.
 */
export interface Command {
  name: string;
  description: string;
  arguments: Record<string, ArgConfig>;
  options: Record<string, OptConfig>;
  action: (ctx: {
    args: Record<string, unknown>;
    options: Record<string, unknown>;
  }) => void | Promise<void>;
}

/**
 * Configuration for {@link defineCli}.
 */
export interface CliConfig {
  name: string;
  description?: string;
  version?: string;
  commands: Command[];
}

/**
 * A CLI clilication produced by {@link defineCli}.
 *
 * Provides `run()` to parse and execute a command, and `parse()` to
 * inspect the parsed result without executing.
 */
export interface Cli {
  name: string;
  description: string;
  commands: Command[];
  run(argv?: string[]): Promise<Result<void>>;
  parse(
    argv?: string[],
  ): Result<{ command: string; args: Record<string, unknown>; options: Record<string, unknown> }>;
}

// ── defineCommand ──

/**
 * Declares a single CLI command with typed arguments and options.
 *
 * Returns a {@link Command} suitable for passing to {@link defineCli}.
 * TypeScript infers the `args` and `options` types inside `action` from
 * the argument/option definitions.
 *
 * @typeParam TArgs - Record of argument definitions.
 * @typeParam TOpts - Record of option definitions.
 * @param config - The command configuration.
 * @returns A normalized {@link Command} object.
 *
 * @example
 * ```ts
 * const deploy = defineCommand({
 *   name: "deploy",
 *   description: "Deploy the clilication",
 *   arguments: { env: { type: "string", required: true, description: "Target environment" } },
 *   options: { force: { type: "boolean", short: "f", description: "Skip confirmation" } },
 *   action({ args, options }) {
 *     // args.env is string, options.force is boolean
 *   },
 * });
 * ```
 */
export function defineCommand<
  TArgs extends Record<string, ArgConfig>,
  TOpts extends Record<string, OptConfig>,
>(config: CommandConfig<TArgs, TOpts>): Command {
  return {
    name: config.name,
    description: config.description,
    arguments: (config.arguments ?? {}) as Record<string, ArgConfig>,
    options: (config.options ?? {}) as Record<string, OptConfig>,
    action: config.action as (ctx: {
      args: Record<string, unknown>;
      options: Record<string, unknown>;
    }) => void | Promise<void>,
  };
}

// ── defineCli ──

/**
 * Declares a CLI clilication with one or more subcommands.
 *
 * The returned {@link Cli} has `run()` and `parse()` methods:
 *
 * - `run()` parses `process.argv`, dispatches to the matching command's
 *   `action`, and returns a {@link Result}.
 * - `parse()` returns the parsed result without executing the action.
 *
 * @param config - The clilication configuration.
 * @returns An {@link Cli} with `run` and `parse` methods.
 *
 * @example
 * ```ts
 * const cli = defineCli({
 *   name: "mycli",
 *   description: "A sample CLI",
 *   commands: [
 *     defineCommand({ name: "hello", description: "Say hello", action: () => console.log("Hi!") }),
 *   ],
 * });
 * await cli.run(process.argv.slice(2));
 * ```
 */
export function defineCli(config: CliConfig): Cli {
  const cli: Cli = {
    name: config.name,
    description: config.description ?? "",
    commands: config.commands,
    async run(argv?: string[]): Promise<Result<void>> {
      const args = argv ?? process.argv.slice(2);
      if (args.length === 0) {
        return err(new Error(`Usage: ${this.name} <command>`));
      }
      const commandName = args[0]!;
      const cmd = this.commands.find((c) => c.name === commandName);
      if (!cmd) {
        return err(new Error(`Unknown command: ${commandName}`));
      }
      const parsed = parseCommand(cmd, args.slice(1));
      if (!parsed.ok) return parsed;
      return Result.fromAsync(async () => {
        await cmd.action({ args: parsed.value.args, options: parsed.value.options });
      });
    },
    parse(argv?: string[]): Result<{
      command: string;
      args: Record<string, unknown>;
      options: Record<string, unknown>;
    }> {
      const args = argv ?? process.argv.slice(2);
      if (args.length === 0) {
        return err(new Error(`Usage: ${this.name} <command>`));
      }
      const commandName = args[0]!;
      const cmd = this.commands.find((c) => c.name === commandName);
      if (!cmd) {
        return err(new Error(`Unknown command: ${commandName}`));
      }
      return parseCommand(cmd, args.slice(1)).map((parsed) => ({
        command: commandName,
        args: parsed.args,
        options: parsed.options,
      }));
    },
  };
  return cli;
}
