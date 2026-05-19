import { ok, err } from "./constructors.js";
import type { Result } from "./types.js";

export function map<T, U, E>(r: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (r.ok) return ok(fn(r.value));
  return r;
}

export function mapErr<T, E, F>(r: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (!r.ok) return err(fn(r.error));
  return r;
}

export function andThen<T, U, E>(r: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
  if (r.ok) return fn(r.value);
  return r;
}

export function unwrap<T, E>(r: Result<T, E>): T {
  if (r.ok) return r.value;
  throw r.error;
}

export function unwrapOr<T, E>(r: Result<T, E>, fallback: T): T {
  if (r.ok) return r.value;
  return fallback;
}

export function match<T, U, E>(r: Result<T, E>, onOk: (value: T) => U, onErr: (error: E) => U): U {
  if (r.ok) return onOk(r.value);
  return onErr(r.error);
}
