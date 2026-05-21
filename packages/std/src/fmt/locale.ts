/** Detect the runtime locale.  Falls back to `"en"` on the server. */
export const locale = () => (typeof navigator !== "undefined" ? navigator.language : "en");
