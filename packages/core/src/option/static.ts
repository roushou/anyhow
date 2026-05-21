import { some, none, type Option } from "./option.js";
import { ok, err, type Result } from "../result/result.js";

/** Static combinators. Re-exported as `Option` from the barrel. */
export const OptionStatic = {
  some,
  none,

  /** Converts a nullable value to an Option. */
  fromNullable<T>(value: T | null | undefined): Option<T> {
    return value != null ? some(value) : none();
  },

  /** Converts an Option to a Result, using the provided error if None. */
  okOr<T, E>(opt: Option<T>, error: E): Result<T, E> {
    return opt.isSome() ? ok(opt.value) : err(error);
  },

  /** Converts an Option to a Result, calling fn for the error if None. */
  okOrElse<T, E>(opt: Option<T>, fn: () => E): Result<T, E> {
    return opt.isSome() ? ok(opt.value) : err(fn());
  },

  /** Transposes an Option<Result<T, E>> into a Result<Option<T>, E>. */
  transpose<T, E>(opt: Option<Result<T, E>>): Result<Option<T>, E> {
    if (opt.isNone()) return ok(none() as Option<T>);
    const inner = opt.value;
    if (inner.ok) return ok(some(inner.value));
    return err(inner.error);
  },
};
