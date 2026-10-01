import { DimensionCallout, GeometryBounds, Unit } from '../types/dieline';

/**
 * Fluent SVG Path builder with precision coordinates
 */
export class PathBuilder {
  public parts: string[] = [];

  constructor(initial?: string) {
    if (initial) this.parts.push(initial);
  }

  addRaw(...cmds: string[]): this {
    this.parts.push(...cmds);
    return this;
  }

  private r(num: number): string {
    return Number.isFinite(num) ? num.toFixed(2).replace(/\.?0+$/, '') : '0';
  }

  M(x: number, y: number): this {
    this.parts.push(`M ${this.r(x)} ${this.r(y)}`);
    return this;
  }

  L(x: number, y: number): this {
    this.parts.push(`L ${this.r(x)} ${this.r(y)}`);
    return this;
  }

  H(x: number): this {
    this.parts.push(`H ${this.r(x)}`);
    return this;
  }

  V(y: number): this {
    this.parts.push(`V ${this.r(y)}`);
    return this;
  }

  C(x1: number, y1: number, x2: number, y2: number, x: number, y: number): this {
    this.parts.push(`C ${this.r(x1)} ${this.r(y1)}, ${this.r(x2)} ${this.r(y2)}, ${this.r(x)} ${this.r(y)}`);
    return this;
  }

  Q(x1: number, y1: number, x: number, y: number): this {
    this.parts.push(`Q ${this.r(x1)} ${this.r(y1)}, ${this.r(x)} ${this.r(y)}`);
    return this;
  }

  A(rx: number, ry: number, xAxisRotation: number, largeArcFlag: number, sweepFlag: number, x: number, y: number): this {
    this.parts.push(`A ${this.r(rx)} ${this.r(ry)} ${xAxisRotation} ${largeArcFlag} ${sweepFlag} ${this.r(x)} ${this.r(y)}`);
    return this;
  }

  Z(): this {
    this.parts.push('Z');
    return this;
  }

  rect(x: number, y: number, w: number, h: number): this {
    return this.M(x, y).L(x + w, y).L(x + w, y + h).L(x, y + h).Z();
  }

  roundRect(x: number, y: number, w: number, h: number, r: number): this {
    const radius = Math.min(r, w / 2, h / 2);
    return this.M(x + radius, y)
      .L(x + w - radius, y)
      .A(radius, radius, 0, 0, 1, x + w, y + radius)
      .L(x + w, y + h - radius)
      .A(radius, radius, 0, 0, 1, x + w - radius, y + h)
      .L(x + radius, y + h)
      .A(radius, radius, 0, 0, 1, x, y + h - radius)
      .L(x, y + radius)
      .A(radius, radius, 0, 0, 1, x + radius, y)
      .Z();
  }

  circle(cx: number, cy: number, r: number): this {
    return this.M(cx - r, cy)
      .A(r, r, 0, 1, 0, cx + r, cy)
      .A(r, r, 0, 1, 0, cx - r, cy)
      .Z();
  }

  ellipse(cx: number, cy: number, rx: number, ry: number): this {
    return this.M(cx - rx, cy)
      .A(rx, ry, 0, 1, 0, cx + rx, cy)
      .A(rx, ry, 0, 1, 0, cx - rx, cy)
      .Z();
  }

  line(x1: number, y1: number, x2: number, y2: number): this {
    return this.M(x1, y1).L(x2, y2);
  }

  toString(): string {
    return this.parts.join(' ');
  }
}

/**
 * Precision clockwise Top Tuck Flap (moving right-to-left from x+w down to x)
 */
export function createTopTuckFlapClockwise(
  x: number,
  y: number,
  w: number,
  h: number,
  tuck: number
): string {
  const p = new PathBuilder();
  const topClosureY = y - h;
  const topTuckY = topClosureY - tuck;
  const cornerR = Math.min(6, tuck * 0.45, w * 0.12);
  const shoulder = Math.min(3, w * 0.05);

  // Starts from right side of closure: (x + w, y)
  // Up right closure wall
  p.L(x + w, topClosureY);
  // Tuck flap right shoulder and locking notch
  p.L(x + w - shoulder, topClosureY - tuck * 0.2);
  p.L(x + w - shoulder * 0.6, topClosureY - tuck * 0.45);
  p.L(x + w - shoulder * 1.4, topClosureY - tuck * 0.55);
  p.L(x + w - shoulder * 1.5, topTuckY + cornerR);
  p.Q(x + w - shoulder * 1.5, topTuckY, x + w - shoulder * 1.5 - cornerR, topTuckY);
  // Across top tuck edge
  p.L(x + shoulder * 1.5 + cornerR, topTuckY);
  p.Q(x + shoulder * 1.5, topTuckY, x + shoulder * 1.5, topTuckY + cornerR);
  // Left locking notch and shoulder
  p.L(x + shoulder * 1.4, topClosureY - tuck * 0.55);
  p.L(x + shoulder * 0.6, topClosureY - tuck * 0.45);
  p.L(x + shoulder, topClosureY - tuck * 0.2);
  p.L(x, topClosureY);
  // Down left closure wall back to body
  p.L(x, y);

  return p.toString();
}

/**
 * Precision clockwise Bottom Tuck Flap (moving left-to-right from x down to x+w)
 */
export function createBottomTuckFlapClockwise(
  x: number,
  y: number,
  w: number,
  h: number,
  tuck: number
): string {
  const p = new PathBuilder();
  const botClosureY = y + h;
  const botTuckY = botClosureY + tuck;
  const cornerR = Math.min(6, tuck * 0.45, w * 0.12);
  const shoulder = Math.min(3, w * 0.05);

  // Starts from left side of closure: (x, y)
  // Down left closure wall
  p.L(x, botClosureY);
  // Tuck flap left shoulder and locking notch
  p.L(x + shoulder, botClosureY + tuck * 0.2);
  p.L(x + shoulder * 0.6, botClosureY + tuck * 0.45);
  p.L(x + shoulder * 1.4, botClosureY + tuck * 0.55);
  p.L(x + shoulder * 1.5, botTuckY - cornerR);
  p.Q(x + shoulder * 1.5, botTuckY, x + shoulder * 1.5 + cornerR, botTuckY);
  // Across bottom tuck edge
  p.L(x + w - shoulder * 1.5 - cornerR, botTuckY);
  p.Q(x + w - shoulder * 1.5, botTuckY, x + w - shoulder * 1.5, botTuckY - cornerR);
  // Right locking notch and shoulder
  p.L(x + w - shoulder * 1.4, botClosureY + tuck * 0.55);
  p.L(x + w - shoulder * 0.6, botClosureY + tuck * 0.45);
  p.L(x + w - shoulder, botClosureY + tuck * 0.2);
  p.L(x + w, botClosureY);
  // Up right closure wall back to body
  p.L(x + w, y);

  return p.toString();
}

/**
 * Standard Unit Conversion functions
 */
export function mmToUnit(mm: number, unit: Unit): number {
  if (unit === 'in') return mm / 25.4;
  if (unit === 'cm') return mm / 10;
  return mm;
}

export function unitToMm(val: number, unit: Unit): number {
  if (unit === 'in') return val * 25.4;
  if (unit === 'cm') return val * 10;
  return val;
}

export function formatMeasurement(mm: number, unit: Unit, decimals = 1): string {
  const converted = mmToUnit(mm, unit);
  if (unit === 'in') {
    return `${converted.toFixed(2)} in`;
  }
  if (unit === 'cm') {
    return `${converted.toFixed(1)} cm`;
  }
  return `${converted.toFixed(decimals === 0 ? 0 : 1)} mm`;
}

/**
 * Standard Packaging Primitives & Mathematical Helpers
 */

/**
 * Creates a standard ECMA tuck flap with rounded lock shoulders
 * @param x Origin X
 * @param y Origin Y
 * @param w Flap width
 * @param h Flap length/depth
 * @param dir 'top' | 'bottom'
 * @param frictionLock Whether to include standard die-cut friction notches
 */
export function createTuckFlapPath(
  x: number,
  y: number,
  w: number,
  h: number,
  dir: 'top' | 'bottom',
  frictionLock = true
): string {
  const p = new PathBuilder();
  const cornerR = Math.min(6, h * 0.4, w * 0.15);
  const shoulder = Math.min(3, w * 0.05);

  if (dir === 'top') {
    // Extends upward (-Y)
    const topY = y - h;
    p.M(x, y);
    p.L(x + shoulder, y - h * 0.2);
    if (frictionLock) {
      // Little friction ear notch
      p.L(x + shoulder * 0.6, y - h * 0.45);
      p.L(x + shoulder * 1.4, y - h * 0.55);
    }
    p.L(x + shoulder * 1.5, topY + cornerR);
    p.Q(x + shoulder * 1.5, topY, x + shoulder * 1.5 + cornerR, topY);
    p.L(x + w - shoulder * 1.5 - cornerR, topY);
    p.Q(x + w - shoulder * 1.5, topY, x + w - shoulder * 1.5, topY + cornerR);
    if (frictionLock) {
      p.L(x + w - shoulder * 1.4, y - h * 0.55);
      p.L(x + w - shoulder * 0.6, y - h * 0.45);
    }
    p.L(x + w - shoulder, y - h * 0.2);
    p.L(x + w, y);
  } else {
    // Extends downward (+Y)
    const bottomY = y + h;
    p.M(x, y);
    p.L(x + shoulder, y + h * 0.2);
    if (frictionLock) {
      p.L(x + shoulder * 0.6, y + h * 0.45);
      p.L(x + shoulder * 1.4, y + h * 0.55);
    }
    p.L(x + shoulder * 1.5, bottomY - cornerR);
    p.Q(x + shoulder * 1.5, bottomY, x + shoulder * 1.5 + cornerR, bottomY);
    p.L(x + w - shoulder * 1.5 - cornerR, bottomY);
    p.Q(x + w - shoulder * 1.5, bottomY, x + w - shoulder * 1.5, bottomY - cornerR);
    if (frictionLock) {
      p.L(x + w - shoulder * 1.4, y + h * 0.55);
      p.L(x + w - shoulder * 0.6, y + h * 0.45);
    }
    p.L(x + w - shoulder, y + h * 0.2);
    p.L(x + w, y);
  }

  return p.toString();
}

/**
 * Creates standard Dust Flap with 45-degree angle relief
 */
export function createDustFlapPath(
  x: number,
  y: number,
  w: number,
  h: number,
  dir: 'top' | 'bottom',
  taper = 0.5
): string {
  const p = new PathBuilder();
  const taperX = Math.min(w * taper, h * 0.6);

  if (dir === 'top') {
    p.M(x, y)
      .L(x + taperX, y - h)
      .L(x + w - taperX, y - h)
      .L(x + w, y);
  } else {
    p.M(x, y)
      .L(x + taperX, y + h)
      .L(x + w - taperX, y + h)
      .L(x + w, y);
  }
  return p.toString();
}

/**
 * Creates standard Glue Flap along the side
 */
export function createGlueFlapPath(
  x: number,
  y: number,
  w: number, // flap width (usually 12-18mm)
  h: number, // height along the body
  bevel = 4 // bevel cut-in angle in mm
): string {
  const p = new PathBuilder();
  p.M(x, y)
    .L(x - w, y + bevel)
    .L(x - w, y + h - bevel)
    .L(x, y + h);
  return p.toString();
}

/**
 * Creates Euro-Slot / Sombrero hanging slot cut-path
 */
export function createEuroSlotPath(cx: number, cy: number, w = 32, h = 9): string {
  const p = new PathBuilder();
  const halfW = w / 2;
  const halfH = h / 2;
  const earW = 8;
  const earH = 4;

  p.M(cx - halfW + 3, cy - halfH)
    .L(cx - earW, cy - halfH)
    .L(cx - earW, cy - halfH - earH)
    .A(2, 2, 0, 0, 1, cx - earW + 2, cy - halfH - earH - 2)
    .L(cx + earW - 2, cy - halfH - earH - 2)
    .A(2, 2, 0, 0, 1, cx + earW, cy - halfH - earH)
    .L(cx + earW, cy - halfH)
    .L(cx + halfW - 3, cy - halfH)
    .A(3, 3, 0, 0, 1, cx + halfW, cy - halfH + 3)
    .L(cx + halfW, cy + halfH - 3)
    .A(3, 3, 0, 0, 1, cx + halfW - 3, cy + halfH)
    .L(cx - halfW + 3, cy + halfH)
    .A(3, 3, 0, 0, 1, cx - halfW, cy + halfH - 3)
    .L(cx - halfW, cy - halfH + 3)
    .A(3, 3, 0, 0, 1, cx - halfW + 3, cy - halfH)
    .Z();

  return p.toString();
}

/**
 * Creates Thumb notch for easy opening
 */
export function createThumbNotchPath(cx: number, cy: number, r = 10, dir: 'up' | 'down' = 'down'): string {
  const p = new PathBuilder();
  if (dir === 'down') {
    p.M(cx - r, cy).A(r, r, 0, 0, 0, cx + r, cy);
  } else {
    p.M(cx - r, cy).A(r, r, 0, 0, 1, cx + r, cy);
  }
  return p.toString();
}

/**
 * Generate dimension callout objects with offset lines and text
 */
export function createDimension(
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string,
  valueMm: number,
  orientation: 'horizontal' | 'vertical' | 'aligned',
  offset = 18
): DimensionCallout {
  return {
    id,
    x1,
    y1,
    x2,
    y2,
    label,
    valueMm,
    orientation,
    offset,
  };
}

/**
 * Calculate bounding box with padding
 */
export function makeBounds(minX: number, minY: number, maxX: number, maxY: number, pad = 10): GeometryBounds {
  return {
    minX: minX - pad,
    minY: minY - pad,
    maxX: maxX + pad,
    maxY: maxY + pad,
    width: maxX - minX + pad * 2,
    height: maxY - minY + pad * 2,
  };
}

/**
 * Helper to build rectangular safe area
 */
export function createRectangularSafeArea(x: number, y: number, w: number, h: number, margin = 3): string {
  const p = new PathBuilder();
  if (w <= margin * 2 || h <= margin * 2) return '';
  return p.rect(x + margin, y + margin, w - margin * 2, h - margin * 2).toString();
}

/**
 * Helper to build rectangular bleed
 */
export function createRectangularBleed(x: number, y: number, w: number, h: number, bleed = 3): string {
  const p = new PathBuilder();
  return p.rect(x - bleed, y - bleed, w + bleed * 2, h + bleed * 2).toString();
}
