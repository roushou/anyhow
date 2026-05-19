export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t, 0, 1);

export const normalize = (v: number, min: number, max: number) =>
  clamp((v - min) / (max - min), 0, 1);

export const mapRange = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);

export const roundTo = (v: number, decimals: number) =>
  Math.round(v * 10 ** decimals) / 10 ** decimals;
