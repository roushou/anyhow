import type { Result } from "./types.js";

export const ok = <T, E = never>(value: T): Result<T, E> => ({ ok: true, value });
export const err = <T = never, E = unknown>(error: E): Result<T, E> => ({ ok: false, error });
