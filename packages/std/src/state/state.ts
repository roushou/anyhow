/**
 * Definition of a single state's transitions and lifecycle hooks.
 *
 * @typeParam S - The state type (string union).
 * @typeParam E - The event type (string union).
 * @typeParam C - The context type (defaults to `void`).
 */
export interface StateDef<S extends string, E extends string, C = void> {
  /** Event → transition map for this state. */
  on?: Partial<Record<E, TransitionDef<S, E, C>>>;
  /** Called exactly once when entering this state. */
  entry?: (ctx: C, event: E, prev: S) => void;
  /** Called exactly once when leaving this state. */
  exit?: (ctx: C, event: E, next: S) => void;
}

/**
 * Definition of a transition from one state to another.
 *
 * @typeParam S - The state type (string union).
 * @typeParam E - The event type (string union).
 * @typeParam C - The context type (defaults to `void`).
 */
export interface TransitionDef<S extends string, E extends string, C = void> {
  /** Target state. If omitted, the state stays the same (self-transition). */
  target?: S;
  /** Called during the transition. Runs after `exit`, before `entry`. */
  action?: (ctx: C, event: E) => void;
  /** If it returns `false`, the transition is discarded. */
  guard?: (ctx: C, event: E) => boolean;
}

/**
 * Definition for a complete state machine.
 *
 * @typeParam S - The state type (string union).
 * @typeParam E - The event type (string union).
 * @typeParam C - The context type (defaults to `void`).
 */
export interface StateMachineDef<S extends string, E extends string, C = void> {
  /** The starting state. */
  initial: S;
  /** Per-state definitions. Every state must be declared. */
  states: Record<string, StateDef<S, E, C>> & { [K in S]: StateDef<S, E, C> };
}

/** A single entry in the transition history. */
export interface TransitionRecord<S extends string, E extends string> {
  /** The state before the transition. */
  from: S;
  /** The event that triggered the transition. */
  event: E;
  /** The state after the transition. */
  to: S;
}

/**
 * A finite state machine that only allows transitions explicitly
 * declared in its definition.
 *
 * @typeParam S - The state type (string union).
 * @typeParam E - The event type (string union).
 * @typeParam C - The context type (defaults to `void`).
 *
 * @example
 * ```ts
 * const toggle = stateMachine({
 *   initial: "off",
 *   states: {
 *     off: { on: { TOGGLE: { target: "on" } } },
 *     on:  { on: { TOGGLE: { target: "off" } } },
 *   },
 * });
 * toggle.send("TOGGLE"); // true
 * toggle.state(); // "on"
 * ```
 */
export class StateMachine<S extends string, E extends string, C = void> {
  #current: S;
  #def: StateMachineDef<S, E, C>;
  #ctx: C;
  #history: TransitionRecord<S, E>[] = [];

  /**
   * Creates a state machine from a definition and optional context.
   *
   * @param def - The state machine definition.
   * @param ctx - Optional shared context passed to guards, actions, entry, and exit hooks.
   */
  constructor(def: StateMachineDef<S, E, C>, ctx?: C) {
    this.#current = def.initial;
    this.#def = def;
    this.#ctx = (ctx ?? undefined) as C;
  }

  /**
   * Returns the current state.
   *
   * @returns The current state string.
   */
  state(): S {
    return this.#current;
  }

  /**
   * Sends an event. If the event triggers a valid transition from the
   * current state (and any guard passes), the state changes and hooks run.
   *
   * Transition order: guard → exit → action → entry.
   *
   * @param event - The event to send.
   * @returns `true` if a transition occurred, `false` if the event is
   *          not valid or a guard rejected it.
   *
   * @example
   * ```ts
   * machine.send("NEXT"); // true if transition happened
   * ```
   */
  send(event: E): boolean {
    const stateDef = this.#def.states[this.#current];
    const trans = stateDef.on?.[event];
    if (!trans) return false;

    // Guard check
    if (trans.guard && !trans.guard(this.#ctx, event)) return false;

    const prev = this.#current;
    const next = trans.target ?? prev;

    // Exit hook (runs before leaving the old state)
    stateDef.exit?.(this.#ctx, event, next);

    // Transition action (runs between exit and entry)
    trans.action?.(this.#ctx, event);

    // Entry hook (runs when entering the new state)
    if (next !== prev) {
      this.#def.states[next].entry?.(this.#ctx, event, prev);
    }

    // Commit the state change
    this.#current = next;
    this.#history.push({ from: prev, event, to: next });
    return true;
  }

  /**
   * Checks whether an event would trigger a valid transition from the
   * current state.  Does not check guards — only whether the event is
   * declared for the current state.
   *
   * @param event - The event to check.
   * @returns `true` if the event is valid for the current state.
   *
   * @example
   * ```ts
   * if (machine.can("SUBMIT")) {
   *   machine.send("SUBMIT");
   * }
   * ```
   */
  can(event: E): boolean {
    const stateDef = this.#def.states[this.#current];
    return event in (stateDef.on ?? {});
  }

  /**
   * Returns the transition history, oldest first.  The last entry is
   * the most recent transition.
   *
   * @returns A readonly array of transition records.
   */
  history(): readonly TransitionRecord<S, E>[] {
    return this.#history;
  }

  /**
   * Resets the machine to its initial state and clears the history.
   *
   * @example
   * ```ts
   * machine.reset();
   * machine.state(); // initial state
   * machine.history(); // []
   * ```
   */
  reset(): void {
    this.#current = this.#def.initial;
    this.#history = [];
  }
}

/**
 * Creates a {@link StateMachine} from a definition and optional context.
 *
 * @typeParam S - The state type (string union).
 * @typeParam E - The event type (string union).
 * @typeParam C - The context type (defaults to `void`).
 * @param def - The state machine definition.
 * @param ctx - Optional shared context passed to guards, actions,
 *              entry, and exit hooks.
 * @returns A new `StateMachine<S, E, C>`.
 *
 * @example
 * ```ts
 * type State = "idle" | "loading" | "done";
 * type Event = "FETCH" | "RESOLVE";
 *
 * const fetchMachine = stateMachine<State, Event>({
 *   initial: "idle",
 *   states: {
 *     idle:    { on: { FETCH:  { target: "loading" } } },
 *     loading: { on: { RESOLVE: { target: "done" } } },
 *     done:    {},
 *   },
 * });
 *
 * fetchMachine.send("FETCH");   // true, idle → loading
 * fetchMachine.send("RESOLVE"); // true, loading → done
 * ```
 */
export function stateMachine<S extends string, E extends string, C = void>(
  def: StateMachineDef<S, E, C>,
  ctx?: C,
): StateMachine<S, E, C> {
  return new StateMachine(def, ctx);
}
