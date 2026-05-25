/**
 * Svelte action that detects clicks outside a DOM node.
 */
export function createClickOutside(
  node: HTMLElement,
  handler: (event: MouseEvent) => void,
): { destroy(): void };

/**
 * Svelte action that tracks an element's dimensions via `ResizeObserver`.
 */
export function createElementSize(): {
  readonly width: number;
  readonly height: number;
  action: (node: HTMLElement) => { destroy(): void };
};

/**
 * Svelte action that tracks element visibility via `IntersectionObserver`.
 */
export function createIntersectionObserver(opts?: IntersectionObserverInit): {
  readonly isIntersecting: boolean;
  readonly entry: IntersectionObserverEntry | null;
  action: (node: HTMLElement) => { destroy(): void };
};

/**
 * Svelte action that detects long-press / long-click interactions.
 */
export function createLongPress(
  node: HTMLElement,
  opts: { duration: number; handler: () => void },
): { destroy(): void };
