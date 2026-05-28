/**
 * Svelte action that shows a positioned tooltip on hover.
 *
 * Creates the tooltip element internally, appends it to `document.body`
 * (avoiding `overflow: hidden` clipping), and positions it relative to
 * the trigger node with collision detection. The tooltip appears after
 * a configurable `delay` and hides immediately on mouse leave.
 *
 * Sets `aria-describedby` on the trigger node for accessibility.
 *
 * @param opts.content - The tooltip text.
 * @param opts.placement - Preferred placement: `"top"` (default), `"bottom"`,
 *   `"left"`, or `"right"`.
 * @param opts.delay - Milliseconds before showing (default: `500`).
 * @param opts.arrow - Whether to render a CSS arrow (default: `false`).
 * @param opts.offset - Gap in px between trigger and tooltip (default: `8`).
 * @param opts.viewportPadding - Minimum px from viewport edge before flipping
 *   (default: `8`).
 * @returns `{ visible, action }` — bind `action` to the trigger element.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createTooltip } from "@anyhow/svelte/actions";
 *
 *   const tooltip = createTooltip({ content: "Save changes", arrow: true });
 * </script>
 *
 * <button use:tooltip.action>💾</button>
 * ```
 */
import { listen } from "../listen.js";

let tooltipIdCounter = 0;

export function createTooltip(opts: {
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  delay?: number;
  arrow?: boolean;
  offset?: number;
  viewportPadding?: number;
}): {
  readonly visible: boolean;
  action: (node: HTMLElement) => { destroy(): void };
} {
  let visible = $state(false);
  let currentX = $state(0);
  let currentY = $state(0);

  const delay = opts.delay ?? 500;
  const arrow = opts.arrow ?? false;
  const gap = opts.offset ?? 8;
  const padding = opts.viewportPadding ?? 8;
  const id = `anyhow-tooltip-${++tooltipIdCounter}`;

  function action(node: HTMLElement) {
    // ── Create tooltip element ──

    const el = document.createElement("div");
    el.id = id;
    el.role = "tooltip";
    el.textContent = opts.content;
    el.style.cssText =
      "position:fixed;z-index:9999;max-width:280px;padding:6px 10px;" +
      "background:#1a1a1a;color:#fff;border-radius:6px;font-size:13px;" +
      "line-height:1.4;pointer-events:none;opacity:0;transition:opacity 0.15s;" +
      "white-space:nowrap;";

    document.body.appendChild(el);

    node.setAttribute("aria-describedby", id);

    // ── Arrow (CSS border trick) ──

    let arrowEl: HTMLDivElement | undefined;

    if (arrow) {
      arrowEl = document.createElement("div");
      arrowEl.style.cssText =
        "position:absolute;width:0;height:0;" + "border:5px solid transparent;";
      el.appendChild(arrowEl);
    }

    // ── Positioning ──

    function position() {
      const trigger = node.getBoundingClientRect();
      const tip = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let place = opts.placement ?? "top";
      let x = 0;
      let y = 0;

      // Try preferred placement, flip if overflow
      function fits(p: string): boolean {
        switch (p) {
          case "top":
            return trigger.top - tip.height - gap >= padding;
          case "bottom":
            return trigger.bottom + tip.height + gap <= vh - padding;
          case "left":
            return trigger.left - tip.width - gap >= padding;
          case "right":
            return trigger.right + tip.width + gap <= vw - padding;
          default:
            return false;
        }
      }

      if (!fits(place)) {
        const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
        const flipped = opposite[place];
        if (fits(flipped)) place = flipped;
      }

      // Compute position
      switch (place) {
        case "top":
          x = trigger.left + trigger.width / 2 - tip.width / 2;
          y = trigger.top - tip.height - gap;
          break;
        case "bottom":
          x = trigger.left + trigger.width / 2 - tip.width / 2;
          y = trigger.bottom + gap;
          break;
        case "left":
          x = trigger.left - tip.width - gap;
          y = trigger.top + trigger.height / 2 - tip.height / 2;
          break;
        case "right":
          x = trigger.right + gap;
          y = trigger.top + trigger.height / 2 - tip.height / 2;
          break;
      }

      // Clamp within viewport
      x = Math.max(padding, Math.min(x, vw - tip.width - padding));
      y = Math.max(padding, Math.min(y, vh - tip.height - padding));

      currentX = x;
      currentY = y;

      // Arrow position
      if (arrowEl) {
        const arrowSize = 5;
        let ax = "";
        const borderColor = {
          top: "#1a1a1a",
          bottom: "#1a1a1a",
          left: "#1a1a1a",
          right: "#1a1a1a",
        };
        const bc = borderColor[place];

        switch (place) {
          case "top":
            ax = `bottom:-${arrowSize * 2}px;left:50%;margin-left:-${arrowSize}px;border-top-color:${bc};`;
            break;
          case "bottom":
            ax = `top:-${arrowSize * 2}px;left:50%;margin-left:-${arrowSize}px;border-bottom-color:${bc};`;
            break;
          case "left":
            ax = `right:-${arrowSize * 2}px;top:50%;margin-top:-${arrowSize}px;border-left-color:${bc};`;
            break;
          case "right":
            ax = `left:-${arrowSize * 2}px;top:50%;margin-top:-${arrowSize}px;border-right-color:${bc};`;
            break;
        }

        arrowEl.style.cssText += ax;
      }
    }

    // ── Show / hide ──

    let showTimer: ReturnType<typeof setTimeout> | undefined;

    function show() {
      clearTimeout(showTimer);
      showTimer = setTimeout(() => {
        // Measure tooltip off-screen first, then position
        el.style.opacity = "0";
        el.style.left = "-9999px";
        el.style.top = "-9999px";
        visible = true;

        // Force layout, then position
        requestAnimationFrame(() => {
          position();
          el.style.left = `${currentX}px`;
          el.style.top = `${currentY}px`;
          el.style.opacity = "1";
        });
      }, delay);
    }

    function hide() {
      clearTimeout(showTimer);
      showTimer = undefined;
      visible = false;
      el.style.opacity = "0";
    }

    // ── Listeners ──

    const listeners = [
      listen(node, "mouseenter", show),
      listen(node, "mouseleave", hide),
      listen(node, "focus", show),
      listen(node, "blur", hide),
      listen(window, "scroll", position, true),
      listen(window, "resize", position),
    ];

    return {
      destroy() {
        clearTimeout(showTimer);
        for (const l of listeners) l.destroy();
        node.removeAttribute("aria-describedby");
        el.remove();
      },
    };
  }

  return {
    get visible() {
      return visible;
    },
    action,
  };
}
