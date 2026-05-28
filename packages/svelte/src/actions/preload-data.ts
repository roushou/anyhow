/**
 * Svelte action that preloads page data on hover or viewport entry.
 *
 * Binds to an `<a>` element and fetches the `href` target when the user
 * hovers over it (after a configurable `delay`) or when it enters the
 * viewport. The browser caches the response, so when the user clicks,
 * navigation feels instant.
 *
 * @param node - The `<a>` element.
 * @param opts.on - When to preload: `"hover"` (default), `"viewport"`,
 *   or `"both"`.
 * @param opts.delay - Milliseconds before preloading on hover (default: `200`).
 * @returns An action object with a `destroy` method for cleanup.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createPreloadData } from "@anyhow/svelte/actions";
 * </script>
 *
 * <a href="/dashboard" use:createPreloadData={{ on: "hover" }}>
 *   Dashboard
 * </a>
 * ```
 */
import { listen } from "../listen.js";

export function createPreloadData(
  node: HTMLAnchorElement,
  opts?: {
    on?: "hover" | "viewport" | "both";
    delay?: number;
  },
): { destroy(): void } {
  const mode = opts?.on ?? "hover";
  const delay = opts?.delay ?? 200;
  let preloaded = false;

  const listeners: { destroy(): void }[] = [];

  function preload() {
    if (preloaded || !node.href) return;
    preloaded = true;

    // Fire a fetch so the browser caches the response; SvelteKit's
    // client-side router will use the cached data on navigation.
    fetch(node.href, { priority: "low" }).catch(() => {
      // Silently ignore — preloading is best-effort
    });
  }

  if (mode === "hover" || mode === "both") {
    let timer: ReturnType<typeof setTimeout> | undefined;

    listeners.push(
      listen(node, "mouseenter", () => {
        timer = setTimeout(preload, delay);
      }),
    );

    listeners.push(
      listen(node, "mouseleave", () => {
        clearTimeout(timer);
      }),
    );

    // Also preload on focus (keyboard navigation)
    listeners.push(
      listen(node, "focus", () => {
        preload();
      }),
    );
  }

  if (mode === "viewport" || mode === "both") {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        preload();
        observer.disconnect();
      }
    });

    observer.observe(node);

    listeners.push({
      destroy() {
        observer.disconnect();
      },
    });
  }

  return {
    destroy() {
      for (const l of listeners) l.destroy();
    },
  };
}
