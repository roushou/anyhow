/**
 * Svelte action that watches DOM mutations on an element.
 *
 * Uses `MutationObserver` to track attribute changes, child list
 * modifications, and character data changes.
 *
 * @param opts - `MutationObserverInit` options (e.g. `{ attributes: true, childList: true }`).
 * @returns An object with `records` ($state) and `action` to bind.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createMutationObserver } from "@anyhow/svelte/actions";
 *   const mut = createMutationObserver({ childList: true, attributes: true });
 *
 *   $effect(() => {
 *     if (mut.records.length > 0) console.log("DOM changed");
 *   });
 * </script>
 *
 * <div use:mut.action contenteditable>Watch me</div>
 * ```
 */
export function createMutationObserver(opts?: MutationObserverInit) {
  let records = $state<MutationRecord[]>([]);

  function action(node: HTMLElement) {
    const observer = new MutationObserver((muts) => {
      records = [...muts];
    });
    observer.observe(node, opts);

    return {
      destroy() {
        observer.disconnect();
      },
    };
  }

  return {
    get records() {
      return records;
    },
    action,
  };
}
