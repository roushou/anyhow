/**
 * Clamps a value between `min` and `max` (inclusive).
 *
 * @param v - The value to clamp.
 * @param min - The lower bound.
 * @param max - The upper bound.
 * @returns `v` clamped to `[min, max]`.
 *
 * @example
 * ```ts
 * clamp(150, 0, 100); // 100
 * clamp(-10, 0, 100); // 0
 * clamp(50, 0, 100);  // 50
 * ```
 */
export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Linearly interpolates between `a` and `b` by `t`.
 *
 * `t` is automatically clamped to `[0, 1]`.
 *
 * @param a - Start value.
 * @param b - End value.
 * @param t - Interpolation factor (0 = `a`, 1 = `b`).
 * @returns The interpolated value.
 *
 * @example
 * ```ts
 * lerp(0, 100, 0.5); // 50
 * lerp(0, 100, 1.5); // 100 (clamped)
 * ```
 */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t, 0, 1);

/**
 * Normalizes `v` within `[min, max]` to a `[0, 1]` range.
 *
 * The result is clamped to `[0, 1]` even if `v` is outside the range.
 *
 * @param v - The value to normalize.
 * @param min - The lower bound of the input range.
 * @param max - The upper bound of the input range.
 * @returns A value in `[0, 1]`.
 *
 * @example
 * ```ts
 * normalize(50, 0, 100);  // 0.5
 * normalize(150, 0, 100); // 1
 * ```
 */
export const normalize = (v: number, min: number, max: number) =>
  clamp((v - min) / (max - min), 0, 1);

/**
 * Re-maps `v` from the range `[inMin, inMax]` to `[outMin, outMax]`.
 *
 * @param v - The value to re-map.
 * @param inMin - Lower bound of the input range.
 * @param inMax - Upper bound of the input range.
 * @param outMin - Lower bound of the output range.
 * @param outMax - Upper bound of the output range.
 * @returns The re-mapped value.
 *
 * @example
 * ```ts
 * mapRange(50, 0, 100, 0, 1); // 0.5
 * mapRange(0.5, 0, 1, 0, 100); // 50
 * ```
 */
export const mapRange = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);

/**
 * Rounds `v` to `decimals` decimal places.
 *
 * @param v - The value to round.
 * @param decimals - Number of decimal places.
 * @returns The rounded value.
 *
 * @example
 * ```ts
 * roundTo(3.14159, 2); // 3.14
 * roundTo(3.14159, 0); // 3
 * ```
 */
export const roundTo = (v: number, decimals: number) =>
  Math.round(v * 10 ** decimals) / 10 ** decimals;
