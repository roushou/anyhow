import { some, none, type Option } from "./option.js";
import { ok, err, type Result } from "../result/result.js";

/** Static combinators. Re-exported as `Option` from the barrel. */
export const OptionStatic = {
  some,
  none,

  /**
   * Converts a nullable value to an {@link Option}.
   *
   * Returns `Some(value)` for non-null-ish values and `None` otherwise.
   *
   * @typeParam T - The non-nullable value type.
   * @param value - The value to test (may be `null` or `undefined`).
   * @returns `Some(value)` if `value != null`, otherwise `None`.
   *
   * @example
   * ```ts
   * Option.fromNullable("hello"); // Some("hello")
   * Option.fromNullable(null);     // None
   * ```
   */
  fromNullable<T>(value: T | null | undefined): Option<T> {
    return value != null ? some(value) : none();
  },

  /**
   * Converts an {@link Option} to a {@link Result}, using the provided error
   * when the option is `None`.
   *
   * @typeParam T - The value type.
   * @typeParam E - The error type.
   * @param opt - The option to convert.
   * @param error - The error to use if `opt` is `None`.
   * @returns `Ok(value)` if `opt` is `Some`, otherwise `Err(error)`.
   *
   * @example
   * ```ts
   * Option.okOr(some("hello"), "missing");  // { ok: true, value: "hello" }
   * Option.okOr(none(), "missing");          // { ok: false, error: "missing" }
   * ```
   */
  okOr<T, E>(opt: Option<T>, error: E): Result<T, E> {
    return opt.isSome() ? ok(opt.value) : err(error);
  },

  /**
   * Converts an {@link Option} to a {@link Result}, lazily calling `fn` to
   * produce the error only when the option is `None`.
   *
   * Prefer this over {@link Option.okOr} when computing the error is expensive.
   *
   * @typeParam T - The value type.
   * @typeParam E - The error type.
   * @param opt - The option to convert.
   * @param fn - A function that produces the error (only called if `opt` is `None`).
   * @returns `Ok(value)` if `opt` is `Some`, otherwise `Err(fn())`.
   *
   * @example
   * ```ts
   * Option.okOrElse(some("hello"), () => "missing");
   * // { ok: true, value: "hello" }
   *
   * Option.okOrElse(none(), () => `not found at ${Date.now()}`);
   * // { ok: false, error: "not found at 1711372800000" }
   * ```
   */
  okOrElse<T, E>(opt: Option<T>, fn: () => E): Result<T, E> {
    return opt.isSome() ? ok(opt.value) : err(fn());
  },

  /**
   * Transposes an `Option<`{@link Result}`<T, E>>` into a `Result<Option<T>, E>`.
   *
   * - `Some(Ok(v))` becomes `Ok(Some(v))`.
   * - `Some(Err(e))` becomes `Err(e)`.
   * - `None` becomes `Ok(None)`.
   *
   * @typeParam T - The ok value type.
   * @typeParam E - The error type.
   * @param opt - An `Option<Result<T, E>>` to transpose.
   * @returns `Ok(Some(v))` for `Some(Ok(v))`, `Err(e)` for `Some(Err(e))`,
   *   or `Ok(None)` for `None`.
   *
   * @example
   * ```ts
   * Option.transpose(some(ok(42)));    // { ok: true, value: Some(42) }
   * Option.transpose(some(err("x")));  // { ok: false, error: "x" }
   * Option.transpose(none());           // { ok: true, value: None }
   * ```
   */
  transpose<T, E>(opt: Option<Result<T, E>>): Result<Option<T>, E> {
    if (opt.isNone()) return ok(none() as Option<T>);
    const inner = opt.value;
    if (inner.ok) return ok(some(inner.value));
    return err(inner.error);
  },
};
