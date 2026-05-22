# @anyhow/cli

Declarative CLI framework — define commands as plain objects with full type inference.

```bash
bun add @anyhow/cli
```

```ts
import { defineCommand, defineCli } from "@anyhow/cli";

const hello = defineCommand({
  name: "hello",
  description: "Say hello",
  arguments: { name: { type: "string", required: true, description: "Who to greet" } },
  options: { loud: { type: "boolean", short: "l", description: "Shout it" } },
  async action({ args, options }) {
    const msg = `Hello, ${args.name}!`;
    console.log(options.loud ? msg.toUpperCase() : msg);
  },
});

const cli = defineCli({
  name: "mycli",
  description: "A sample CLI built with @anyhow/cli",
  commands: [hello],
});

await cli.run(process.argv.slice(2));
```

See [anyhow](https://github.com/roushou/anyhow) for full documentation.
