// ── Browser utility ──

/**
 * Returns `true` when running in a browser environment.
 *
 * Useful for SSR-safe guards in universal SvelteKit code.
 */
export function isBrowser(): boolean;

// ── Re-exports ──

export * from "./primitives/index.js";
export * from "./composables/index.js";
export * from "./actions/index.js";
