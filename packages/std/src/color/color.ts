/**
 * An immutable color value stored as sRGB with alpha.
 *
 * Create instances via the static constructors (`fromHex`, `fromRgb`,
 * `fromHsl`), then chain manipulation methods (each returns a new `Color`).
 * All math is pure — no DOM dependencies, works in any runtime.
 *
 * @example
 * ```ts
 * import { Color } from "@anyhow/std/color";
 *
 * const brand = Color.fromHex("#3b82f6");
 * const hover = brand.lighten(0.15);
 * const border = brand.darken(0.1);
 * const readable = brand.contrast(Color.fromHex("#ffffff")) >= 4.5;
 * ```
 */
export class Color {
  // Internal: sRGB channels (0–255) and alpha (0–1)
  readonly #r: number;
  readonly #g: number;
  readonly #b: number;
  readonly #a: number;

  private constructor(r: number, g: number, b: number, a: number) {
    this.#r = r;
    this.#g = g;
    this.#b = b;
    this.#a = a;
  }

  // ── Static constructors ─────────────────────────────────────────────────

  /**
   * Creates a `Color` from a hex string.
   *
   * Accepts `#RGB`, `#RRGGBB`, `#RGBA`, `#RRGGBBAA`, or unprefixed forms.
   *
   * @param hex - A hex color string like `"#3b82f6"`, `"#fff"`, or `"ff0080cc"`.
   * @throws If the string is not a valid hex color.
   *
   * @example
   * ```ts
   * Color.fromHex("#3b82f6");
   * Color.fromHex("ff0");  // unprefixed, 3-digit
   * ```
   */
  static fromHex(hex: string): Color {
    let h = hex.replace(/^#/, "");
    if (h.length === 3) h = h[0]! + h[0] + h[1]! + h[1] + h[2]! + h[2];
    if (h.length === 4) {
      h = h[0]! + h[0] + h[1]! + h[1] + h[2]! + h[2] + h[3]! + h[3];
    }
    const invalid = () => {
      throw new Error(`Invalid hex color: ${hex}`);
    };
    if (h.length !== 6 && h.length !== 8) invalid();
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) invalid();
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return new Color(r, g, b, a);
  }

  /**
   * Creates a `Color` from sRGB channel values (0–255).
   *
   * Accepts either individual arguments or an object.
   *
   * @param r - Red channel (0–255).
   * @param g - Green channel (0–255).
   * @param b - Blue channel (0–255).
   * @param a - Alpha channel (0–1, default `1`).
   *
   * @example
   * ```ts
   * Color.fromRgb(59, 130, 246);
   * Color.fromRgb({ r: 59, g: 130, b: 246, a: 0.5 });
   * ```
   */
  static fromRgb(r: number, g: number, b: number, a?: number): Color;
  static fromRgb(obj: { r: number; g: number; b: number; a?: number }): Color;
  static fromRgb(
    rOrObj: number | { r: number; g: number; b: number; a?: number },
    g?: number,
    b?: number,
    a?: number,
  ): Color {
    if (typeof rOrObj === "object") {
      return new Color(rOrObj.r, rOrObj.g, rOrObj.b, rOrObj.a ?? 1);
    }
    return new Color(rOrObj, g!, b!, a ?? 1);
  }

  /**
   * Creates a `Color` from HSL values.
   *
   * @param h - Hue (0–360).
   * @param s - Saturation (0–100).
   * @param l - Lightness (0–100).
   * @param a - Alpha channel (0–1, default `1`).
   *
   * @example
   * ```ts
   * Color.fromHsl(217, 91, 60);
   * Color.fromHsl({ h: 217, s: 91, l: 60 });
   * ```
   */
  static fromHsl(h: number, s: number, l: number, a?: number): Color;
  static fromHsl(obj: { h: number; s: number; l: number; a?: number }): Color;
  static fromHsl(
    hOrObj: number | { h: number; s: number; l: number; a?: number },
    s?: number,
    l?: number,
    a?: number,
  ): Color {
    let h: number, _s: number, _l: number, _a: number;
    if (typeof hOrObj === "object") {
      h = hOrObj.h;
      _s = hOrObj.s / 100;
      _l = hOrObj.l / 100;
      _a = hOrObj.a ?? 1;
    } else {
      h = hOrObj;
      _s = s! / 100;
      _l = l! / 100;
      _a = a ?? 1;
    }

    if (_s === 0) {
      const v = Math.round(_l * 255);
      return new Color(v, v, v, _a);
    }

    const q = _l < 0.5 ? _l * (1 + _s) : _l + _s - _l * _s;
    const p = 2 * _l - q;
    const hk = h / 360;

    const tr = (hk + 1 / 3) % 1;
    const tg = hk;
    const tb = (hk - 1 / 3 + 1) % 1;

    const conv = (t: number): number => {
      if (t < 1 / 6) return Math.round((p + (q - p) * 6 * t) * 255);
      if (t < 1 / 2) return Math.round(q * 255);
      if (t < 2 / 3) return Math.round((p + (q - p) * (2 / 3 - t) * 6) * 255);
      return Math.round(p * 255);
    };

    return new Color(conv(tr), conv(tg), conv(tb), _a);
  }

  // ── Converters ───────────────────────────────────────────────────────────

  /**
   * Returns the color as a hex string (e.g. `"#3b82f6"`).
   *
   * Includes alpha channel as `#RRGGBBAA` when `alpha < 1`.
   */
  toHex(): string {
    const hex = (n: number) => n.toString(16).padStart(2, "0");
    const rrggbb = `#${hex(this.#r)}${hex(this.#g)}${hex(this.#b)}`;
    if (this.#a < 1) {
      return rrggbb + hex(Math.round(this.#a * 255));
    }
    return rrggbb;
  }

  /** Returns the sRGB channel values. */
  toRgb(): { r: number; g: number; b: number } {
    return { r: this.#r, g: this.#g, b: this.#b };
  }

  /** Returns the color as an `rgb()` or `rgba()` CSS string. */
  toRgbString(): string {
    if (this.#a < 1) {
      return `rgba(${this.#r},${this.#g},${this.#b},${this.#a})`;
    }
    return `rgb(${this.#r},${this.#g},${this.#b})`;
  }

  /** Returns HSL values (h: 0–360, s: 0–100, l: 0–100). */
  toHsl(): { h: number; s: number; l: number } {
    const r = this.#r / 255;
    const g = this.#g / 255;
    const b = this.#b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;
    if (d !== 0) {
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }

    const l = (max + min) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  // ── Manipulation (returns new Color) ─────────────────────────────────────

  /** Alpha value (0–1). */
  get alpha(): number {
    return this.#a;
  }

  /**
   * Returns a new `Color` with the given alpha.
   *
   * @param a - Alpha channel (0–1).
   */
  withAlpha(a: number): Color {
    return new Color(this.#r, this.#g, this.#b, a);
  }

  /**
   * Lightens the color by a factor (0–1).
   *
   * Mixes the color toward white by `amount`.
   */
  lighten(amount: number): Color {
    return this.mix(new Color(255, 255, 255, 1), amount);
  }

  /**
   * Darkens the color by a factor (0–1).
   *
   * Mixes the color toward black by `amount`.
   */
  darken(amount: number): Color {
    return this.mix(new Color(0, 0, 0, 1), amount);
  }

  /**
   * Increases saturation by a factor (0–1).
   *
   * Moves HSL saturation toward 100% by `amount`.
   */
  saturate(amount: number): Color {
    const hsl = this.toHsl();
    return Color.fromHsl(hsl.h, Math.min(100, hsl.s + amount * 100), hsl.l, this.#a);
  }

  /**
   * Decreases saturation by a factor (0–1).
   *
   * Moves HSL saturation toward 0% by `amount`.
   */
  desaturate(amount: number): Color {
    const hsl = this.toHsl();
    return Color.fromHsl(hsl.h, Math.max(0, hsl.s - amount * 100), hsl.l, this.#a);
  }

  /**
   * Mixes this color with another by a factor (0–1).
   *
   * `0` returns `this`, `1` returns `other`. Blends sRGB channels linearly.
   *
   * @param other - The color to mix with.
   * @param amount - Blend factor (0–1).
   */
  mix(other: Color, amount: number): Color {
    const t = Math.max(0, Math.min(1, amount));
    const inv = 1 - t;
    return new Color(
      Math.round(this.#r * inv + other.#r * t),
      Math.round(this.#g * inv + other.#g * t),
      Math.round(this.#b * inv + other.#b * t),
      this.#a * inv + other.#a * t,
    );
  }

  // ── Read ─────────────────────────────────────────────────────────────────

  /**
   * Returns the WCAG 2.0 relative luminance of the color.
   *
   * Used as input for {@link contrast}. Range: 0 (black) to 1 (white).
   */
  luminance(): number {
    const lin = (c: number): number => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(this.#r) + 0.7152 * lin(this.#g) + 0.0722 * lin(this.#b);
  }

  /**
   * Returns the WCAG 2.0 contrast ratio between two colors.
   *
   * Range: 1 (identical) to 21 (black vs white). A value ≥ 4.5 satisfies
   * AA for normal text; ≥ 3 for large text.
   *
   * @param other - The color to compare against.
   */
  contrast(other: Color): number {
    const l1 = this.luminance();
    const l2 = other.luminance();
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }
}
