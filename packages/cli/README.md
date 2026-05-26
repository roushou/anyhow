# @anyhow/cli

Declarative CLI framework — define commands as plain objects with full type inference. Built on `@anyhow/std/result` for zero-throw error handling.

```bash
bun add @anyhow/cli
```

```ts
import { defineCommand, defineCli } from "@anyhow/cli";

const deploy = defineCommand({
  name: "deploy",
  description: "Deploy to target environment",
  arguments: { env: { type: "string", required: true, description: "Target environment" } },
  options: { force: { type: "boolean", short: "f", description: "Skip confirmation" } },
  async action({ args, options }) {
    // args.env is string, options.force is boolean — fully typed
    console.log(`Deploying to ${args.env}`);
  },
});

const cli = defineCli({
  name: "mycli",
  description: "A sample CLI built with @anyhow/cli",
  commands: [deploy],
});

await cli.run(process.argv.slice(2));
```

See the [main README](https://github.com/roushou/anyhow#cli) for full documentation.
