/**
 * A simple boolean toggle backed by Svelte 5 `$state`.
 *
 * @param initial - Initial value (defaults to `false`).
 */
export function createToggle(initial?: boolean): {
  value: boolean;
  toggle(): void;
  on(): void;
  off(): void;
};

/**
 * Cycles through an array of values backed by Svelte 5 `$state`.
 *
 * @param values - The array of values to cycle through (must have at least one element).
 * @param startIndex - Optional starting index (defaults to `0`).
 */
export function createCycle<T>(values: T[], startIndex?: number): {
  readonly value: T;
  next(): void;
  prev(): void;
  reset(): void;
};

/**
 * Tracks the previous value of a reactive expression.
 *
 * @param getter - A function returning the current value.
 */
export function createPrevious<T>(getter: () => T): {
  readonly current: T | undefined;
};

/**
 * Resettable state backed by Svelte 5 `$state`.
 *
 * @param initial - The initial value.
 */
export function createResetable<T>(initial: T): {
  value: T;
  reset(): void;
};

/**
 * Debounced reactive state backed by Svelte 5 `$state`.
 *
 * @param initial - The initial value.
 * @param waitMs - Debounce delay in milliseconds.
 */
export function createDebouncedState<T>(initial: T, waitMs: number): {
  value: T;
  flush(): void;
};

/**
 * Throttled reactive state backed by Svelte 5 `$state`.
 *
 * @param initial - The initial value.
 * @param waitMs - Throttle window in milliseconds.
 */
export function createThrottledState<T>(initial: T, waitMs: number): {
  value: T;
  flush(): void;
};

/**
 * Reactive state persisted to `localStorage`, backed by Svelte 5 `$state`.
 */
export function createPersistedState<T>(key: string, initial: T): {
  value: T;
};

// ── Store ──

/** Reactive state persisted to browser storage (`local` or `session`). */
export function createStore<T>(opts: {
  key: string;
  initial: T;
  storage?: "local" | "session";
}): { value: T };

/**
 * Reactive media query matcher backed by Svelte 5 `$state`.
 *
 * @param query - A CSS media query string.
 */
export function createMediaQuery(query: string): {
  readonly current: boolean;
};

/**
 * Reactive URL search params backed by Svelte 5 `$state`.
 *
 * @param defaults - Default values for each param.
 */
export function createQueryParams<T extends Record<string, string>>(defaults: T): {
  value: T;
  reset(): void;
};

// ── Async ──

/**
 * Wraps an async function with reactive `$state` for loading, data, and error.
 */
export function createAsyncState<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
): {
  readonly loading: boolean;
  readonly data: T | undefined;
  readonly error: Error | undefined;
  execute(...args: Args): Promise<T | undefined>;
  reset(): void;
};

// ── Undo/redo ──

/**
 * Undo/redo state backed by Svelte 5 `$state`.
 */
export function createUndoRedo<T>(initial: T, maxSize?: number): {
  readonly value: T;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  push(value: T): void;
  undo(): void;
  redo(): void;
};

// ── Network ──

/** Reactive online/offline status backed by Svelte 5 `$state`. */
export function createOnline(): { readonly online: boolean };

// ── Timers ──

/** Managed `setInterval` with auto-cleanup via Svelte 5 `$effect`. */
export function createInterval(fn: () => void, ms: number): {
  readonly running: boolean;
  start(): void;
  stop(): void;
};

/** Managed `setTimeout` with reactive `$state`. */
export function createTimeout(fn: () => void, ms: number): {
  readonly running: boolean;
  start(): void;
  cancel(): void;
};

// ── Scroll ──

/** Reactive scroll position backed by Svelte 5 `$state`. */
export function createScrollPosition(): {
  readonly x: number;
  readonly y: number;
  readonly isScrolling: boolean;
  readonly direction: "up" | "down" | undefined;
};

// ── Breakpoints ──

/** Reactive breakpoint matching backed by Svelte 5 `$state`. */
export function createBreakpoints<T extends Record<string, number>>(
  breakpoints: T,
): {
  readonly current: keyof T | undefined;
  above(name: keyof T & string): boolean;
  below(name: keyof T & string): boolean;
};

// ── Clipboard ──

/** Clipboard access with reactive `$state` feedback. */
export function createCopyToClipboard(): {
  readonly copied: boolean;
  readonly error: Error | undefined;
  copy(text: string): Promise<boolean>;
  reset(): void;
};

// ── Focus ──

/** Reactive `document.activeElement` backed by Svelte 5 `$state`. */
export function createActiveElement(): { readonly element: Element | null };

// ── Polling ──

/** Async polling with reactive `$state` for data, error, and running state. */
export function createPolling<T>(fn: () => Promise<T>, ms: number): {
  readonly running: boolean;
  readonly data: T | undefined;
  readonly error: Error | undefined;
  start(): void;
  stop(): void;
};

// ── Window size ──

/** Reactive window size backed by Svelte 5 `$state`. */
export function createWindowSize(): {
  readonly width: number;
  readonly height: number;
};

// ── Hash ──

/** Reactive `window.location.hash` backed by Svelte 5 `$state`. */
export function createHash(): { hash: string };

// ── Idle ──

/** User idle detection backed by Svelte 5 `$state`. */
export function createIdle(ms: number): { readonly idle: boolean };

// ── Animation ──

/** Managed `requestAnimationFrame` loop with auto-cleanup. */
export function createRaf(fn: (time: DOMHighResTimeStamp) => void): {
  readonly running: boolean;
  start(): void;
  stop(): void;
};

// ── Server-Sent Events ──

/** Reactive `EventSource` wrapper with auto-cleanup. */
export function createEventSource(
  url: string | (() => string),
  opts?: EventSourceInit,
): {
  readonly data: string | null;
  readonly error: Error | undefined;
  readonly readyState: number;
  close(): void;
};

// ── Color scheme ──

/** Reactive OS color scheme (`prefers-color-scheme`). */
export function createColorScheme(): { readonly scheme: "light" | "dark" };

// ── Visibility ──

/** Reactive page visibility (`document.visibilityState`). */
export function createVisibility(): { readonly visible: boolean };

/**
 * Reactive mouse position backed by Svelte 5 `$state`.
 */
export function createMousePosition(): {
  readonly pageX: number;
  readonly pageY: number;
  readonly clientX: number;
  readonly clientY: number;
};

/**
 * Reactive WebSocket connection backed by Svelte 5 `$state`.
 */
export function createWebSocket(url: string | (() => string), protocols?: string | string[]): {
  readonly data: string | null;
  readonly readyState: number;
  readonly error: Error | undefined;
  send(message: string): void;
  close(code?: number, reason?: string): void;
};

/**
 * Reactive page-leave guard backed by Svelte 5 `$state`.
 */
export function createPageLeave(): {
  setDirty(value: boolean): void;
  disable(): void;
};

/**
 * Reactive geolocation backed by Svelte 5 `$state`.
 */
export function createGeolocation(opts?: PositionOptions): {
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly accuracy: number | null;
  readonly altitude: number | null;
  readonly altitudeAccuracy: number | null;
  readonly heading: number | null;
  readonly speed: number | null;
  readonly error: Error | undefined;
  readonly loading: boolean;
};

/**
 * Reactive Fullscreen API wrapper backed by Svelte 5 `$state`.
 */
export function createFullscreen(): {
  readonly isFullscreen: boolean;
  enter(el?: HTMLElement): Promise<void>;
  exit(): Promise<void>;
  toggle(): Promise<void>;
};

/**
 * Reactive reduced-motion preference backed by Svelte 5 `$state`.
 */
export function createReducedMotion(): { readonly reduced: boolean };

/**
 * Reactive text selection backed by Svelte 5 `$state`.
 */
export function createTextSelection(): {
  readonly text: string;
  readonly ranges: Range[];
  readonly rects: DOMRect[];
};

/**
 * Reactive preferred languages backed by Svelte 5 `$state`.
 */
export function createPreferredLanguages(): {
  readonly languages: string[];
};

/**
 * Reactive Screen Wake Lock API wrapper backed by Svelte 5 `$state`.
 */
export function createWakeLock(): {
  readonly isActive: boolean;
  readonly isSupported: boolean;
  request(): Promise<void>;
  release(): Promise<void>;
};

/**
 * Reactive Network Information API wrapper backed by Svelte 5 `$state`.
 */
export function createNetworkInformation(): {
  readonly effectiveType: string | undefined;
  readonly downlink: number | undefined;
  readonly rtt: number | undefined;
  readonly saveData: boolean | undefined;
  readonly isSupported: boolean;
};

/**
 * Reactive Speech Recognition (Web Speech API) wrapper backed by Svelte 5 `$state`.
 */
export function createSpeechRecognition(opts?: {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}): {
  readonly listening: boolean;
  readonly transcript: string;
  readonly interim: string;
  readonly error: Error | undefined;
  readonly isSupported: boolean;
  start(): void;
  stop(): void;
};

/**
 * Reactive Notification API wrapper backed by Svelte 5 `$state`.
 */
export function createNotification(): {
  readonly permission: NotificationPermission;
  readonly isSupported: boolean;
  show(title: string, opts?: NotificationOptions): boolean;
};

/**
 * Reactive Pointer Lock API wrapper backed by Svelte 5 `$state`.
 */
export function createPointerLock(): {
  readonly locked: boolean;
  readonly movementX: number;
  readonly movementY: number;
  readonly isSupported: boolean;
  request(el?: Element): Promise<void>;
  exit(): void;
};

/**
 * Reactive Screen Orientation API wrapper backed by Svelte 5 `$state`.
 */
export function createScreenOrientation(): {
  readonly type: string;
  readonly angle: number;
  readonly isSupported: boolean;
  lock(orientation: OrientationLockType): Promise<void>;
  unlock(): void;
};

/**
 * Reactive BroadcastChannel wrapper backed by Svelte 5 `$state`.
 */
export function createBroadcastChannel(name: string): {
  readonly messages: any[];
  postMessage(data: any): void;
  close(): void;
};
