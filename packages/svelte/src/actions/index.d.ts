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

/** Svelte action that shows a positioned tooltip on hover. */
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
};

/** A single item extracted from a paste event. */
export interface PasteItem {
  kind: "text" | "image" | "file";
  text?: string;
  getAsFile(): File | null;
}

/** Svelte action that handles paste events. */
export function createPaste(
  node: HTMLElement,
  opts: {
    accept?: "text" | "image" | "file" | "all";
    onPaste: (items: PasteItem[]) => void | Promise<void>;
  },
): { destroy(): void };

/** Svelte action that copies text to the clipboard on click. */
export function createCopy(opts?: {
  target?: () => HTMLElement | null;
  text?: string;
  onCopy?: (text: string) => void;
  onError?: (error: Error) => void;
  resetMs?: number;
}): {
  readonly copied: boolean;
  action: (node: HTMLElement) => { destroy(): void };
};

/** A file that was rejected from the drop zone. */
export interface RejectedFile {
  file: File;
  reason: "size" | "type";
}

/** Svelte action that creates a file drop zone. */
export function createDropZone(opts: {
  accept?: string[];
  multiple?: boolean;
  maxSize?: number;
  onDrop: (files: File[], rejected: RejectedFile[]) => void;
}): {
  readonly isOver: boolean;
  readonly isRejected: boolean;
  action: (node: HTMLElement) => { destroy(): void };
};

/** Svelte action that preloads page data on hover or viewport entry. */
export function createPreloadData(
  node: HTMLAnchorElement,
  opts?: {
    on?: "hover" | "viewport" | "both";
    delay?: number;
  },
): { destroy(): void };
