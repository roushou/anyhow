/**
 * Build script for @anyhow/svelte.
 *
 * Strategy:
 * 1. Strip TypeScript types from each `.svelte.ts` file using Bun's transpiler.
 * 2. Compile the resulting JS with Svelte's `compileModule` to transform
 *    runes ($state etc.) into Svelte runtime calls.
 * 3. Write compiled `.svelte.js` files alongside source so `bun build` can
 *    resolve imports.
 * 4. Bundle each subpath entry (root, primitives, composables, actions)
 *    separately for tree-shakeable imports.
 * 5. Remove temporary `.svelte.js` artifacts from src/.
 * 6. Copy hand-crafted `.d.ts` files for each subpath to dist/.
 */
import { rm, readFile, writeFile, readdir, copyFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";

const SRC = "./src";
const DIST = "./dist";

// Clean dist
await rm(DIST, { recursive: true, force: true });

// ── Step 1: Collect all .svelte.ts files (recursive) ──

async function collectSvelteFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectSvelteFiles(full)));
    } else if (entry.isFile() && entry.name.endsWith(".svelte.ts")) {
      results.push(full);
    }
  }
  return results;
}

const svelteFiles = await collectSvelteFiles(SRC);

// ── Step 2: Compile .svelte.ts → .svelte.js in-place ──

const tempFiles: string[] = [];

if (svelteFiles.length > 0) {
  let compileModule:
    | ((source: string, opts: any) => { js: { code: string }; warnings: any[] })
    | null = null;

  try {
    const svelteCompiler = await import("svelte/compiler");
    compileModule = svelteCompiler.compileModule;
    console.log(`Compiling ${svelteFiles.length} .svelte.ts file(s)...`);
  } catch {
    console.warn("svelte/compiler not found — runes won't be transformed.");
  }

  const transpiler = new Bun.Transpiler({ loader: "ts" });

  for (const srcPath of svelteFiles) {
    const tsSource = await readFile(srcPath, "utf-8");
    const jsSource = transpiler.transformSync(tsSource);

    if (compileModule) {
      const result = compileModule(jsSource, {
        filename: srcPath,
        generate: "client",
        dev: false,
      });

      if (result.warnings.length > 0) {
        for (const w of result.warnings) {
          console.warn(`  ⚠ ${srcPath}: ${w.message ?? w}`);
        }
      }

      const outPath = srcPath.replace(/\.svelte\.ts$/, ".svelte.js");
      await writeFile(outPath, result.js.code);
      tempFiles.push(outPath);
    } else {
      const outPath = srcPath.replace(/\.svelte\.ts$/, ".svelte.js");
      await writeFile(outPath, jsSource);
      tempFiles.push(outPath);
    }
  }
}

// ── Step 3: Bundle each subpath entry ──

const entries = [
  { name: ".", path: join(SRC, "index.ts") },
  { name: "primitives", path: join(SRC, "primitives", "index.ts") },
  { name: "composables", path: join(SRC, "composables", "index.ts") },
  { name: "actions", path: join(SRC, "actions", "index.ts") },
];

console.log("Building ESM bundles...");

for (const entry of entries) {
  const outdir = entry.name === "." ? DIST : join(DIST, entry.name);
  await mkdir(outdir, { recursive: true });

  const result = await Bun.build({
    entrypoints: [entry.path],
    outdir,
    format: "esm",
    target: "browser",
    external: ["svelte", "svelte/*"],
  });

  if (!result.success) {
    console.error(`Build failed for ${entry.name}:`);
    for (const log of result.logs) console.error(log);
    await cleanup();
    process.exit(1);
  }
}

// ── Step 4: Copy declarations ──

console.log("Copying type declarations...");

const declFiles = [
  { src: join(SRC, "index.d.ts"), dest: join(DIST, "index.d.ts") },
  { src: join(SRC, "primitives", "index.d.ts"), dest: join(DIST, "primitives", "index.d.ts") },
  { src: join(SRC, "composables", "index.d.ts"), dest: join(DIST, "composables", "index.d.ts") },
  { src: join(SRC, "actions", "index.d.ts"), dest: join(DIST, "actions", "index.d.ts") },
];

for (const { src, dest } of declFiles) {
  try {
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(src, dest);
  } catch {
    console.warn(`  ⚠ Could not copy ${src}`);
  }
}

// ── Cleanup ──

async function cleanup() {
  for (const f of tempFiles) {
    await rm(f, { force: true });
  }
}

await cleanup();

console.log("Build complete.");
