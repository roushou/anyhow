import { describe, expect, it, afterAll } from "bun:test";
import { join } from "node:path";
import { mkdir, writeFile, rm } from "node:fs/promises";
import {
  readText,
  readJson,
  writeText,
  writeJson,
  ensureDir,
  remove,
  exists,
  tmpDir,
  glob,
  walk,
} from "./fs.js";

const testDir = join(import.meta.dirname, "..", ".test-tmp");

afterAll(async () => {
  await rm(testDir, { recursive: true, force: true });
});

async function setup() {
  await mkdir(testDir, { recursive: true });
}

describe("readText", () => {
  it("reads a file", async () => {
    await setup();
    const file = join(testDir, "hello.txt");
    await writeFile(file, "hello world");
    const r = await readText(file);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe("hello world");
  });

  it("returns err for missing file", async () => {
    const r = await readText(join(testDir, "nope.txt"));
    expect(r.ok).toBe(false);
  });
});

describe("readJson", () => {
  it("reads and parses JSON", async () => {
    await setup();
    const file = join(testDir, "data.json");
    await writeFile(file, '{"name":"Alice"}');
    const r = await readJson<{ name: string }>(file);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.name).toBe("Alice");
  });

  it("returns err for invalid JSON", async () => {
    await setup();
    const file = join(testDir, "bad.json");
    await writeFile(file, "{bad");
    const r = await readJson(file);
    expect(r.ok).toBe(false);
  });
});

describe("writeText", () => {
  it("writes a file and creates parent dirs", async () => {
    await setup();
    const file = join(testDir, "sub", "file.txt");
    const r = await writeText(file, "hello");
    expect(r.ok).toBe(true);
    const text = await readText(file);
    if (text.ok) expect(text.value).toBe("hello");
  });
});

describe("writeJson", () => {
  it("writes JSON to a file", async () => {
    await setup();
    const file = join(testDir, "out.json");
    const r = await writeJson(file, { a: 1 });
    expect(r.ok).toBe(true);
    const parsed = await readJson<{ a: number }>(file);
    if (parsed.ok) expect(parsed.value.a).toBe(1);
  });
});

describe("ensureDir", () => {
  it("creates directories", async () => {
    await setup();
    const dir = join(testDir, "a", "b", "c");
    const r = await ensureDir(dir);
    expect(r.ok).toBe(true);
    expect(await exists(dir)).toBe(true);
  });
});

describe("remove", () => {
  it("removes files", async () => {
    await setup();
    const file = join(testDir, "to-delete.txt");
    await writeFile(file, "bye");
    const r = await remove(file);
    expect(r.ok).toBe(true);
    expect(await exists(file)).toBe(false);
  });

  it("removes directories recursively", async () => {
    await setup();
    const dir = join(testDir, "to-delete-dir");
    await mkdir(dir);
    await writeFile(join(dir, "f.txt"), "x");
    const r = await remove(dir);
    expect(r.ok).toBe(true);
    expect(await exists(dir)).toBe(false);
  });
});

describe("exists", () => {
  it("returns true for existing files", async () => {
    await setup();
    const file = join(testDir, "exists-test.txt");
    await writeFile(file, "ok");
    expect(await exists(file)).toBe(true);
  });

  it("returns false for missing paths", async () => {
    expect(await exists(join(testDir, "nope-12345"))).toBe(false);
  });
});

describe("tmpDir", () => {
  it("creates a temp directory", async () => {
    const r = await tmpDir("anyhow-test-");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toContain("anyhow-test-");
      expect(await exists(r.value)).toBe(true);
      await rm(r.value, { recursive: true, force: true });
    }
  });
});

describe("glob", () => {
  it("matches files by extension", async () => {
    await setup();
    const dir = join(testDir, "glob-ext");
    await ensureDir(dir);
    await writeText(join(dir, "a.ts"), "");
    await writeText(join(dir, "b.ts"), "");
    await writeText(join(dir, "c.txt"), "");
    const r = await glob(join(dir, "*.ts"));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.length).toBe(2);
  });

  it("matches recursively with **", async () => {
    await setup();
    const dir = join(testDir, "glob-recursive");
    await ensureDir(join(dir, "sub"));
    await writeText(join(dir, "a.ts"), "");
    await writeText(join(dir, "sub", "b.ts"), "");
    const r = await glob(join(dir, "**", "*.ts"));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.length).toBe(2);
  });
});

describe("walk", () => {
  it("walks a directory tree", async () => {
    await setup();
    await ensureDir(join(testDir, "walk", "sub"));
    await writeFile(join(testDir, "walk", "a.ts"), "");
    await writeFile(join(testDir, "walk", "sub", "b.ts"), "");
    const entries: string[] = [];
    for await (const entry of walk(join(testDir, "walk"))) {
      entries.push(entry.path);
    }
    expect(entries).toContain("a.ts");
    expect(entries).toContain("sub");
  });

  it("returns nothing for missing dir", async () => {
    const entries: string[] = [];
    for await (const entry of walk(join(testDir, "definitely-missing"))) {
      entries.push(entry.path);
    }
    expect(entries.length).toBe(0);
  });
});
