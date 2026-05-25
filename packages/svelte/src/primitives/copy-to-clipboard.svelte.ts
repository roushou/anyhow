/**
 * Clipboard access with reactive `$state` feedback.
 *
 * `copy(text)` writes to the clipboard and sets `copied` to `true`. On
 * failure, `error` is populated. Call `reset()` to clear state.
 *
 * @returns `{ copied, error, copy, reset }`.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createCopyToClipboard } from "@anyhow/svelte";
 *   const clipboard = createCopyToClipboard();
 * </script>
 *
 * <button onclick={() => clipboard.copy("Hello world")}>
 *   {clipboard.copied ? "Copied!" : "Copy"}
 * </button>
 * {#if clipboard.error}
 *   <p>Failed: {clipboard.error.message}</p>
 * {/if}
 * ```
 */
export function createCopyToClipboard() {
  let copied = $state(false);
  let error = $state<Error | undefined>(undefined);

  async function copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      error = undefined;
      return true;
    } catch (e) {
      copied = false;
      error = e instanceof Error ? e : new Error(String(e));
      return false;
    }
  }

  function reset() {
    copied = false;
    error = undefined;
  }

  return {
    /** `true` after a successful `copy()`. */
    get copied() {
      return copied;
    },
    /** The last error, or `undefined`. */
    get error() {
      return error;
    },
    /** Copies `text` to the clipboard. Returns `true` on success. */
    copy,
    /** Resets `copied` and `error` to initial state. */
    reset,
  };
}
