---
"@anyhow/std": minor
"@anyhow/svelte": minor
---

---

"@anyhow/std": minor
"@anyhow/svelte": minor

---

- **New `color` module** — `Color.fromHex`, `fromRgb`, `fromHsl` constructors; `toHex`, `toRgb`, `toRgbString`, `toHsl` converters; `lighten`, `darken`, `saturate`, `desaturate`, `mix`, `withAlpha` manipulation; `luminance` and `contrast` for WCAG 2.0 accessibility checks. Pure math, zero DOM dependencies.
- **New `Result.zip` and `Result.zipWith`** — combine two independent results into a tuple or apply a function, short-circuiting on the first `Err`.
- **Removed unnecessary type casts** from `Result` and `Option` implementations — cleaner internals, no API change.

- **15 new reactive primitives** — `createMousePosition`, `createWebSocket`, `createPageLeave`, `createGeolocation`, `createFullscreen`, `createReducedMotion`, `createTextSelection`, `createPreferredLanguages`, `createWakeLock`, `createNetworkInformation`, `createSpeechRecognition`, `createNotification`, `createPointerLock`, `createScreenOrientation`, `createBroadcastChannel`.
- **10 new Svelte actions** — `createFocusTrap`, `createAutoFocus`, `createKeydown`, `createPortal`, `createSwipe`, `createLazyLoad`, `createMutationObserver`, `createHover`, `createFocus`, `createDraggable`.
- **3 new data composables** — `createPagination`, `createFilteredList`, `createInfiniteScroll`.
