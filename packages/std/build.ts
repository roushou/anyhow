import { rm, rename } from "node:fs/promises";

const modules = [
  "result",
  "fmt",
  "guard",
  "async",
  "iter",
  "math",
  "cache",
  "string",
  "random",
  "option",
  "data",
  "collections",
  "fs",
  "env",
  "schema",
];

// Clean dist first
await rm("./dist", { recursive: true, force: true });

// Generate .d.ts declarations via tsc
const decl = Bun.spawnSync(["bun", "run", "tsc", "-p", "tsconfig.build.json"], {
  stdio: ["inherit", "inherit", "inherit"],
});
if (decl.exitCode !== 0) {
  console.error("Declaration generation failed");
  process.exit(decl.exitCode);
}

for (const mod of modules) {
  const entry = `./src/${mod}/index.ts`;
  const outdir = `./dist/${mod}`;

  // Build ESM (outputs .js)
  await Bun.build({
    entrypoints: [entry],
    outdir,
    format: "esm",
  });

  // Build CJS to a tmp dir, then rename .js → .cjs
  const tmpdir = `./dist/.tmp-${mod}`;
  await Bun.build({
    entrypoints: [entry],
    outdir: tmpdir,
    format: "cjs",
  });
  await rename(`${tmpdir}/index.js`, `${outdir}/index.cjs`);
  await rm(tmpdir, { recursive: true, force: true });
}

// Build browser stubs for modules that have a browser.ts entrypoint
// Check if browser.ts exists in each module's source directory
import { existsSync } from "node:fs";
for (const mod of modules) {
  const browserEntry = `./src/${mod}/browser.ts`;
  if (existsSync(browserEntry)) {
    await Bun.build({
      entrypoints: [browserEntry],
      outdir: `./dist/${mod}`,
      format: "esm",
    });
  }
}
