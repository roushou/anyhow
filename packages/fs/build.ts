import { rm, rename } from "node:fs/promises";

const modules = ["index"];

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
  const entry = `./src/${mod}.ts`;
  const outdir = `./dist`;

  // Build ESM (outputs .js)
  await Bun.build({
    entrypoints: [entry],
    outdir,
    format: "esm",
  });

  // Build CJS to a tmp dir, then rename .js → .cjs
  const tmpdir = `./dist/.tmp`;
  await Bun.build({
    entrypoints: [entry],
    outdir: tmpdir,
    format: "cjs",
  });
  await rename(`${tmpdir}/index.js`, `${outdir}/index.cjs`);
  await rm(tmpdir, { recursive: true, force: true });
}
