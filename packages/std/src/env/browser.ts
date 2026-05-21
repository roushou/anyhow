import { err } from "../result/result.js";
import type { Result } from "../result/result.js";

/**
 * Environment variable access is not available in the browser.
 * All functions return `Err` with a descriptive message.
 */

function notAvailable<T = never>(): Result<T> {
  return err(new Error("Environment variables not available in browser")) as Result<T>;
}

const notAvailablePrefixed = {
  string: () => notAvailable<string>(),
  number: () => notAvailable<number>(),
  bool: () => notAvailable<boolean>(),
  enum: <T extends string>(_key: string, _values: readonly T[]) => notAvailable<T>(),
  url: () => notAvailable<URL>(),
  json: <T = unknown>() => notAvailable<T>(),
};

export const env = {
  string: (_key: string) => notAvailable<string>(),
  number: (_key: string) => notAvailable<number>(),
  bool: (_key: string) => notAvailable<boolean>(),
  enum: <T extends string>(_key: string, _values: readonly T[]) => notAvailable<T>(),
  url: (_key: string) => notAvailable<URL>(),
  json: <T = unknown>(_key: string) => notAvailable<T>(),
  prefix: (_prefix: string) => notAvailablePrefixed,
  check: <T extends Record<string, any>>(_vars: T) => notAvailable<any>(),
  loadFile: (_path: string) => notAvailable<void>(),
  mask: (..._keys: string[]) => {},
  dump: () => ({}) as Record<string, string>,
};
