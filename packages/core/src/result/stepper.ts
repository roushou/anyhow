import { ok, err, type Result } from "./result.js";

/**
 * The current state of a {@link Stepper} flow.
 *
 * @typeParam TStep - The step identifier type.
 * @typeParam TData - The data carried through the flow.
 */
export interface StepState<TStep extends string, TData> {
  step: TStep;
  data: TData;
  history: Array<{ step: TStep; data: TData }>;
}

/**
 * A typed state machine for multi-step flows (wizards, checkouts, onboarding).
 *
 * Define steps with `.step()`, declare allowed transitions with `.after()`,
 * then advance through the flow with `.advance()` or `.run()`.
 *
 * @typeParam TStep - The step identifier type (string union).
 * @typeParam TData - The data carried through the flow.
 * @typeParam E - The error type.
 *
 * @example
 * ```ts
 * const checkout = new Stepper<"cart" | "ship" | "pay", CartData, string>()
 *   .step("cart", data => data.items.length > 0 ? ok(data) : err("empty"))
 *   .step("ship", data => data.address ? ok(data) : err("no address"))
 *   .after("cart", ["ship"])
 *   .after("ship", ["pay", "cart"]);
 *
 * const state = checkout.run("cart", { items: ["book"] }, ["ship", "pay"]);
 * ```
 */
export class Stepper<TStep extends string, TData, E = Error> {
  private steps = new Map<TStep, (data: TData) => Result<TData, E>>();
  private transitions = new Map<TStep, TStep[]>();

  /**
   * Define a step — a function that validates or transforms the data.
   *
   * @param name - The step identifier.
   * @param fn - The step function. Return `Ok(data)` to proceed or `Err` to stop.
   */
  step(name: TStep, fn: (data: TData) => Result<TData, E>): this {
    this.steps.set(name, fn);
    return this;
  }

  /**
   * Declare which steps can follow a given step.
   *
   * @param from - The source step.
   * @param to - Allowed destination steps.
   */
  after(from: TStep, to: TStep[]): this {
    this.transitions.set(from, to);
    return this;
  }

  /**
   * Advance from the current state to the given step.
   *
   * @param current - The current step state.
   * @param next - The step to advance to.
   * @returns `Ok(newState)` on success, `Err` if the step fails.
   */
  advance(current: StepState<TStep, TData>, next: TStep): Result<StepState<TStep, TData>, E> {
    const fn = this.steps.get(next);
    if (!fn) return err(new Error(`Unknown step: ${next}`) as any);

    return fn(current.data).map((newData) => ({
      step: next,
      data: newData,
      history: [...current.history, { step: current.step, data: current.data }],
    }));
  }

  /**
   * Run a sequence of steps from a starting point.
   *
   * @param start - The starting step.
   * @param initialData - The initial data.
   * @param sequence - Ordered list of steps to execute.
   * @returns `Ok(finalState)` or the first `Err`.
   */
  run(start: TStep, initialData: TData, sequence: TStep[]): Result<StepState<TStep, TData>, E> {
    let state: StepState<TStep, TData> = {
      step: start,
      data: initialData,
      history: [],
    };

    for (const next of sequence) {
      const result = this.advance(state, next);
      if (!result.ok) return result;
      state = result.value;
    }

    return ok(state);
  }

  /**
   * Get the allowed next steps from a given step.
   *
   * @param from - The step to query.
   * @returns Array of allowed next steps, or empty if none defined.
   */
  nextSteps(from: TStep): TStep[] {
    return this.transitions.get(from) ?? [];
  }
}
