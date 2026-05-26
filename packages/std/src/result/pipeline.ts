import { ok, type Result } from "./result.js";

/**
 * A stage in a {@link Pipeline} — a function that transforms an input
 * into a {@link Result}.
 *
 * @typeParam TIn - Input type.
 * @typeParam TOut - Output type.
 * @typeParam E - Error type.
 */
export type Stage<TIn, TOut, E> = (input: TIn) => Result<TOut, E>;

/**
 * A typed, observable pipeline of stages.
 *
 * Build with {@link pipeline}(), add stages with `.pipe()`, run with `.run()`.
 *
 * Unlike raw `.andThen()` chains, a Pipeline is:
 * - **Reusable** — run multiple inputs through the same stages
 * - **Observable** — tap between stages with `runWithTaps()`
 * - **Recoverable** — attach error handlers per stage
 * - **Introspectable** — call `.describe()` to list stage names
 *
 * @typeParam TIn - The input type.
 * @typeParam TOut - The output type after all stages.
 * @typeParam E - The error type.
 *
 * @example
 * ```ts
 * const pipe = pipeline<RawOrder>()
 *   .pipe("parse", parseOrder)
 *   .pipe("validate", validateOrder);
 *
 * const result = pipe.run(rawOrder);
 * ```
 */
export class Pipeline<TIn, TOut, E = Error> {
  private stages: Array<{
    name: string;
    run: (input: any) => Result<any, any>;
    onError?: (error: any, input: any) => Result<any, any>;
  }> = [];

  constructor(
    stages: Array<{
      name: string;
      run: (input: any) => Result<any, any>;
      onError?: (error: any, input: any) => Result<any, any>;
    }> = [],
  ) {
    this.stages = stages;
  }

  /**
   * Add a stage. The pipeline type becomes `Pipeline<TIn, U, E>`.
   *
   * @typeParam U - The output type of the new stage.
   * @param name - A human-readable name for observability.
   * @param stage - The stage function.
   * @returns A new `Pipeline` with the stage appended.
   *
   * @example
   * ```ts
   * const pipe = pipeline<RawOrder>()
   *   .pipe("parse", parseOrder)
   *   .pipe("validate", validateOrder);
   * ```
   */
  pipe<U>(name: string, stage: Stage<TOut, U, E>): Pipeline<TIn, U, E> {
    return new Pipeline([...this.stages, { name, run: stage }]);
  }

  /**
   * Add a stage with an error recovery handler.
   *
   * If the stage fails, `onError` can inspect the error and the input that
   * caused it, and return a recovery value — keeping the pipeline alive.
   *
   * @typeParam U - The output type of the new stage.
   * @param name - A human-readable name for observability.
   * @param stage - The stage function.
   * @param onError - Recovery handler `(error, input) => Result<U, E>`.
   * @returns A new `Pipeline` with the stage and recovery handler appended.
   *
   * @example
   * ```ts
   * const pipe = pipeline<RawOrder>()
   *   .pipeWithRecovery(
   *     "parse",
   *     parseOrder,
   *     (err, input) => ok({ fallback: true }),
   *   );
   * ```
   */
  pipeWithRecovery<U>(
    name: string,
    stage: Stage<TOut, U, E>,
    onError: (error: E, input: TOut) => Result<U, E>,
  ): Pipeline<TIn, U, E> {
    return new Pipeline([...this.stages, { name, run: stage, onError }]);
  }

  /**
   * Run the pipeline on an input.
   *
   * Stages execute in order. The first error short-circuits unless the
   * stage has a recovery handler.
   *
   * @typeParam TIn - (Inherited) The input type.
   * @param input - The initial value.
   * @returns The final `Result`.
   *
   * @example
   * ```ts
   * const result = pipeline<RawOrder>()
   *   .pipe("parse", parseOrder)
   *   .run(rawOrder);
   * ```
   */
  run(input: TIn): Result<TOut, E> {
    let result: Result<any, E> = ok(input);

    for (const stage of this.stages) {
      if (!result.ok) return result;

      const inner = stage.run(result.value);
      if (inner.ok) {
        result = inner;
      } else if (stage.onError) {
        result = stage.onError(inner.error, result.value);
      } else {
        return inner;
      }
    }

    return result as Result<TOut, E>;
  }

  /**
   * Run the pipeline with callbacks between each stage (observability).
   *
   * @typeParam TIn - (Inherited) The input type.
   * @param input - The initial value.
   * @param onStageStart - Called with the stage name and input before each stage.
   * @param onStageEnd - Called with the stage name and result after each stage.
   * @returns The final `Result`.
   *
   * @example
   * ```ts
   * const result = pipe.runWithTaps(
   *   rawOrder,
   *   (name, input) => console.log(`Starting ${name}`),
   *   (name, output) => console.log(`Finished ${name}`),
   * );
   * ```
   */
  runWithTaps(
    input: TIn,
    onStageStart: (name: string, input: unknown) => void,
    onStageEnd: (name: string, output: Result<unknown, E>) => void,
  ): Result<TOut, E> {
    let result: Result<any, E> = ok(input);

    for (const stage of this.stages) {
      if (!result.ok) return result;
      onStageStart(stage.name, result.value);

      const inner = stage.run(result.value);
      onStageEnd(stage.name, inner);

      if (inner.ok) {
        result = inner;
      } else if (stage.onError) {
        result = stage.onError(inner.error, result.value);
      } else {
        return inner;
      }
    }

    return result as Result<TOut, E>;
  }

  /**
   * Compose two pipelines end-to-end.
   *
   * @typeParam U - The output type of the other pipeline.
   * @param other - A pipeline that takes this pipeline's output type.
   * @returns A new `Pipeline` combining the stages of both.
   *
   * @example
   * ```ts
   * const parse = pipeline<RawOrder>()
   *   .pipe("parse", parseOrder);
   * const validate = pipeline<Order>()
   *   .pipe("validate", validateOrder);
   * const combined = parse.chain(validate);
   * ```
   */
  chain<U>(other: Pipeline<TOut, U, E>): Pipeline<TIn, U, E> {
    return new Pipeline([...this.stages, ...other.stages]);
  }

  /**
   * List stage names for debugging / introspection.
   *
   * @returns The names of all stages in order.
   *
   * @example
   * ```ts
   * const pipe = pipeline<RawOrder>()
   *   .pipe("parse", parseOrder)
   *   .pipe("validate", validateOrder);
   * pipe.describe(); // ["parse", "validate"]
   * ```
   */
  describe(): string[] {
    return this.stages.map((s) => s.name);
  }
}

/**
 * Start building a {@link Pipeline}.
 *
 * @typeParam TIn - The input type.
 *
 * @example
 * ```ts
 * const pipe = pipeline<RawOrder>()
 *   .pipe("parse", parseOrder)
 *   .pipe("validate", validateOrder)
 *   .pipe("save", saveOrder);
 * ```
 */
export const pipeline = <TIn, E = never>(): Pipeline<TIn, TIn, E> => new Pipeline();
