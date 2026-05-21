import { err } from "../result/result.js";
import type { Result } from "../result/result.js";

function notAvailable<T>(): Promise<Result<T>> {
  return Promise.resolve(err(new Error("File system not available in browser")) as Result<T>);
}

export const readText = (_path: string) => notAvailable<string>();
export const readJson = <T = unknown>(_path: string) => notAvailable<T>();
export const writeText = (_path: string, _content: string) => notAvailable<void>();
export const writeJson = (_path: string, _data: unknown, _space?: string | number) =>
  notAvailable<void>();
export const ensureDir = (_path: string) => notAvailable<void>();
export const remove = (_path: string) => notAvailable<void>();
export const tmpDir = (_prefix?: string) => notAvailable<string>();
export const glob = (_pattern: string) => notAvailable<string[]>();

export async function exists(_path: string): Promise<boolean> {
  return false;
}

export async function* walk(_dir: string): AsyncIterableIterator<{ path: string; isDir: boolean }> {
  // empty generator
}

export type WalkEntry = { path: string; isDir: boolean };
