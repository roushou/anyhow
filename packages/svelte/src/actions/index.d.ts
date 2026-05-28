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

/** Svelte action that traps keyboard focus within a DOM node. */
export function createFocusTrap(node: HTMLElement): { destroy(): void };

/** Svelte action that auto-focuses an element on mount. */
export function createAutoFocus(node: HTMLElement): { destroy(): void };

/** Svelte action that binds keyboard shortcuts to a DOM node. */
export function createKeydown(
  node: HTMLElement,
  shortcuts: Record<string, (e: KeyboardEvent) => void>,
): { destroy(): void };

/** Svelte action that moves an element to another DOM container. */
export function createPortal(target?: HTMLElement): {
  readonly target: HTMLElement | null;
  action: (node: HTMLElement) => { destroy(): void };
};

/** Svelte action that detects touch swipe gestures. */
export function createSwipe(
  node: HTMLElement,
  opts: {
    threshold?: number;
    onSwipe: (result: {
      direction: "left" | "right" | "up" | "down";
      distance: number;
      velocity: number;
    }) => void;
  },
): { destroy(): void };

/** Svelte action that triggers when an element enters the viewport. */
export function createLazyLoad(opts?: {
  onEnter?: () => void;
  once?: boolean;
}): {
  readonly isIntersecting: boolean;
  readonly entry: IntersectionObserverEntry | null;
  action: (node: HTMLElement) => { destroy(): void };
};

/** Svelte action that watches DOM mutations. */
export function createMutationObserver(opts?: MutationObserverInit): {
  readonly records: MutationRecord[];
  action: (node: HTMLElement) => { destroy(): void };
};

/** Svelte action that tracks hover state. */
export function createHover(): {
  readonly isHovering: boolean;
  action: (node: HTMLElement) => { destroy(): void };
};

/** Svelte action that tracks focus state. */
export function createFocus(): {
  readonly focused: boolean;
  action: (node: HTMLElement) => { destroy(): void };
};

/** Svelte action that tracks pointer-based drag. */
export function createDraggable(): {
  readonly x: number;
  readonly y: number;
  readonly dragging: boolean;
  action: (node: HTMLElement) => { destroy(): void };
};

/** Svelte action that dismisses an element on Escape and/or click outside. */
export function createDismissible(
  node: HTMLElement,
  opts: {
    handler: () => void;
    escape?: boolean;
    outside?: boolean;
  },
): { destroy(): void };

/** Svelte action that auto-resizes a `<textarea>` to fit its content. */
export function createTextareaAutosize(
  node: HTMLTextAreaElement,
  opts?: { minHeight?: number; maxHeight?: number },
): { destroy(): void };
