/**
 * Svelte action that copies text to the clipboard on click.
 *
 * Reads text from a target element's `textContent` or from a static
 * `text` value, writes it to the clipboard, and sets `copied` to `true`
 * for `resetMs` milliseconds (for UI feedback like a checkmark icon).
 *
 * Distinct from the `createCopyToClipboard` primitive, which is
 * programmatic (you call `copy("text")`). This is the declarative,
 * element-bound version.
 *
 * @param node - The DOM node to bind the click handler to.
 * @param opts.target - A function returning the element to copy text from.
 * @param opts.text - Static text to copy (used if `target` is not provided).
 * @param opts.onCopy - Called after a successful copy.
 * @param opts.onError - Called when the clipboard write fails.
 * @param opts.resetMs - How long `copied` stays `true` (default: `2000`).
 * @returns An action object with a `destroy` method for cleanup.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createCopy } from "@anyhow/svelte/actions";
 *
 *   const copy = createCopy({
 *     target: () => document.getElementById("code"),
 *     onCopy: () => showToast("Copied!"),
 *   });
 * </script>
 *
 * <pre id="code">npm install @anyhow/svelte</pre>
 * <button use:copy.action>
 *   {copy.copied ? "✓ Copied!" : "Copy"}
 * </button>
 * ```
 */
import { listen } from "../listen.js";

export function createCopy(opts?: {
  target?: () => HTMLElement | null;
  text?: string;
  onCopy?: (text: string) => void;
  onError?: (error: Error) => void;
  resetMs?: number;
}): {
  readonly copied: boolean;
  action: (node: HTMLElement) => { destroy(): void };
} {
  let copied = $state(false);
  const resetMs = opts?.resetMs ?? 2000;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function action(node: HTMLElement) {
    async function onClick() {
      let text = "";

      if (opts?.target) {
        const el = opts.target();
        if (el) text = el.textContent ?? "";
      }

      if (!text && opts?.text) {
        text = opts.text;
      }

      // Fallback: copy the node's own textContent
      if (!text) {
        text = node.textContent ?? "";
      }

      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        copied = true;
        clearTimeout(timer);
        timer = setTimeout(() => {
          copied = false;
        }, resetMs);
        opts?.onCopy?.(text);
      } catch (err) {
        opts?.onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    }

    return listen(node, "click", onClick);
  }

  return {
    get copied() {
      return copied;
    },
    action,
  };
}
