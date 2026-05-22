import type { Command } from "./command.js";
import type { OptConfig } from "./types.js";
import { ok, err, Result } from "@anyhow/std/result";

/**
 * Parses `argv` against a {@link Command} definition.
 *
 * Positional arguments are matched in order against `command.arguments`.
 * Options are matched by long name (`--name`) or short flag (`-n`).
 * Required fields are validated and defaults are clilied.
 *
 * @param command - The command to parse against.
 * @param argv - The raw argument array (e.g. `process.argv.slice(2)`).
 * @returns A {@link Result} with the parsed `args` and `options`, or an error.
 *
 * @example
 * ```ts
 * const cmd = defineCommand({ name: "build", arguments: { src: { type: "string", required: true } }, action: () => {} });
 * parseCommand(cmd, ["main.ts"]);
 * // Ok({ args: { src: "main.ts" }, options: {} })
 * ```
 */
export function parseCommand(
  command: Command,
  argv: string[],
): Result<{ args: Record<string, unknown>; options: Record<string, unknown> }> {
  const errors: string[] = [];
  const args: Record<string, unknown> = {};
  const options: Record<string, unknown> = {};

  const argDefs = Object.entries(command.arguments);
  const optDefs = Object.entries(command.options);

  // Build option lookup maps
  const optByName: Record<string, OptConfig> = {};
  const optByShort: Record<string, { name: string; def: OptConfig }> = {};
  for (const [name, def] of optDefs) {
    optByName[name] = def;
    if (def.short) {
      if (optByShort[def.short]) {
        errors.push(`Duplicate short flag: -${def.short}`);
      }
      optByShort[def.short] = { name, def };
    }
  }

  // Initialize option defaults
  for (const [name, def] of optDefs) {
    if ("default" in def && def.default !== undefined) {
      (options as Record<string, unknown>)[name] = def.default;
    } else if (def.type === "boolean") {
      (options as Record<string, unknown>)[name] = false;
    }
  }

  // Parse tokens
  const positional: string[] = [];
  let i = 0;
  while (i < argv.length) {
    const tok = argv[i]!;
    if (tok === "--") {
      // Everything after -- is positional
      positional.push(...argv.slice(i + 1));
      break;
    }
    if (tok.startsWith("--")) {
      const name = tok.slice(2);
      const def = optByName[name];
      if (!def) {
        errors.push(`Unknown option: --${name}`);
        i++;
        continue;
      }
      if (def.type === "boolean") {
        (options as Record<string, unknown>)[name] = true;
        i++;
      } else {
        i++;
        if (i >= argv.length) {
          errors.push(`Option --${name} requires a value`);
          continue;
        }
        const val = argv[i]!;
        if (def.type === "number") {
          const parsed = Result.parseFloat(val);
          if (!parsed.ok) errors.push(`Option --${name}: ${parsed.error.message}`);
          else (options as Record<string, unknown>)[name] = parsed.value;
        } else {
          (options as Record<string, unknown>)[name] = val;
        }
        i++;
      }
    } else if (tok.startsWith("-") && tok.length === 2) {
      const short = tok[1]!;
      const entry = optByShort[short];
      if (!entry) {
        errors.push(`Unknown option: -${short}`);
        i++;
        continue;
      }
      const def = entry.def;
      const name = entry.name;
      if (def.type === "boolean") {
        (options as Record<string, unknown>)[name] = true;
        i++;
      } else {
        i++;
        if (i >= argv.length) {
          errors.push(`Option -${short} requires a value`);
          continue;
        }
        const val = argv[i]!;
        if (def.type === "number") {
          const parsed = Result.parseFloat(val);
          if (!parsed.ok) errors.push(`Option -${short}: ${parsed.error.message}`);
          else (options as Record<string, unknown>)[name] = parsed.value;
        } else {
          (options as Record<string, unknown>)[name] = val;
        }
        i++;
      }
    } else {
      positional.push(tok);
      i++;
    }
  }

  // Match positionals to arg defs
  for (let j = 0; j < argDefs.length; j++) {
    const [name, def] = argDefs[j]!;
    const val = positional[j];
    if (val === undefined) {
      if (def.required) {
        errors.push(`Missing required argument: ${name}`);
      } else if ("default" in def && def.default !== undefined) {
        (args as Record<string, unknown>)[name] = def.default;
      }
    } else {
      if (def.type === "number") {
        const parsed = Result.parseFloat(val);
        if (!parsed.ok) errors.push(`Argument ${name}: ${parsed.error.message}`);
        else (args as Record<string, unknown>)[name] = parsed.value;
      } else {
        (args as Record<string, unknown>)[name] = val;
      }
    }
  }

  if (errors.length > 0) {
    return err(new Error(errors.join("\n")));
  }

  return ok({ args, options });
}
