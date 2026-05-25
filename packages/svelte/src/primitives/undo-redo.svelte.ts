/**
 * Undo/redo state backed by Svelte 5 `$state`.
 *
 * Maintains a history stack. `push(value)` adds a snapshot, `undo()` and
 * `redo()` navigate the stack. Old states beyond `maxSize` are discarded.
 *
 * @typeParam T - The type of the tracked value.
 * @param initial - The initial value.
 * @param maxSize - Maximum history size (defaults to `50`).
 * @returns `{ value, canUndo, canRedo, push, undo, redo }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createUndoRedo } from "@anyhow/svelte";
 *
 *   const history = createUndoRedo("Hello", 100);
 * </script>
 *
 * <input bind:value={history.value} />
 * <button onclick={() => history.push(history.value)} disabled={!history.canUndo}>
 *   Undo
 * </button>
 * ```
 */
export function createUndoRedo<T>(initial: T, maxSize = 50) {
  let history = $state<T[]>([initial]);
  let index = $state(0);

  function push(value: T) {
    // Deep-clone objects to prevent mutations from affecting history entries
    const snapshot =
      typeof value === "object" && value !== null ? (structuredClone(value) as T) : value;
    const trimmed = history.slice(0, index + 1);
    trimmed.push(snapshot);
    if (trimmed.length > maxSize) {
      trimmed.shift();
    }
    history = trimmed;
    index = trimmed.length - 1;
  }

  function undo() {
    if (index > 0) index -= 1;
  }

  function redo() {
    if (index < history.length - 1) index += 1;
  }

  return {
    /** The current value. */
    get value(): T {
      return history[index]!;
    },

    /** Whether there is a previous state to undo to. */
    get canUndo(): boolean {
      return index > 0;
    },

    /** Whether there is a future state to redo to. */
    get canRedo(): boolean {
      return index < history.length - 1;
    },

    /**
     * Records a new value. Any redo history beyond the current point is
     * discarded.
     */
    push,

    /** Moves back one step in history. */
    undo,

    /** Moves forward one step in history. */
    redo,
  };
}
