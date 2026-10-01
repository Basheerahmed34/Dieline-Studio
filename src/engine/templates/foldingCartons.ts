import { DielineGeometry, DimensionValues, TechnicalSettings, TemplateDefinition } from '../../types/dieline';
import {
  createBottomTuckFlapClockwise,
  createDimension,
  createDustFlapPath,
  createEuroSlotPath,
  createGlueFlapPath,
  createThumbNotchPath,
  createTopTuckFlapClockwise,
  createTuckFlapPath,
  makeBounds,
  PathBuilder
} from '../geometry';

/**
 * Standard Tuck End Carton Generator (STE / RTE / Reverse Tuck / Snap Lock / Auto Bottom etc.)
 */

function generateStraightTuckEnd(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(10, dims.width || 60);
  const H = Math.max(10, dims.height || 120);
  const D = Math.max(10, dims.depth || 40);
  const G = Math.max(8, settings.glueFlapWidth || 15);
  const tuck = Math.max(10, settings.tuckFlapLength || Math.min(18, D * 0.45));
  const dustH = Math.min(D * 0.65, 30);

  // Layout panels horizontally:
  // [0..G: Glue Flap] [G..G+D: Left] [G+D..G+D+W: Front] [G+D+W..G+2D+W: Right] [G+2D+W..G+2D+2W: Back]
  const xG = 0;
  const xD1 = G;
  const xW1 = xD1 + D;
  const xD2 = xW1 + W;
  const xW2 = xD2 + D;
  const totalX = xW2 + W;

  const yBodyTop = D + tuck + 10;
  const yBodyBottom = yBodyTop + H;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // 100% Continuous Closed Loop Outer Die Cut Contour:
  // Starts at top-left of Left panel: (xD1, yBodyTop)
  cut.M(xD1, yBodyTop)
    .L(xG, yBodyTop + 5)
    .L(xG, yBodyBottom - 5)
    .L(xD1, yBodyBottom);

  // Bottom Left dust flap (D1)
  cut.L(xD1 + 5, yBodyBottom + dustH)
    .L(xW1 - 5, yBodyBottom + dustH)
    .L(xW1, yBodyBottom);

  // Front bottom closure + tuck flap (STE)
  const botFlap = createBottomTuckFlapClockwise(xW1, yBodyBottom, W, D, tuck);
  cut.addRaw(botFlap.replace(/^M\s*[\d\.\-]+\s+[\d\.\-]+/, ''));

  // Bottom Right dust flap (D2)
  cut.L(xD2 + 5, yBodyBottom + dustH)
    .L(xW2 - 5, yBodyBottom + dustH)
    .L(xW2, yBodyBottom);

  // Back bottom edge and far-right vertical edge
  cut.L(totalX, yBodyBottom)
    .L(totalX, yBodyTop)
    .L(xW2, yBodyTop);

  // Top Right dust flap (D2)
  cut.L(xW2 - 5, yBodyTop - dustH)
    .L(xD2 + 5, yBodyTop - dustH)
    .L(xD2, yBodyTop);

  // Front top closure + tuck flap (STE)
  const topFlap = createTopTuckFlapClockwise(xW1, yBodyTop, W, D, tuck);
  cut.addRaw(topFlap.replace(/^M\s*[\d\.\-]+\s+[\d\.\-]+/, ''));

  // Top Left dust flap (D1)
  cut.L(xW1 - 5, yBodyTop - dustH)
    .L(xD1 + 5, yBodyTop - dustH)
    .L(xD1, yBodyTop)
    .Z(); // Continuous closed perimeter!

  // Crease lines:
  // Horizontal creases at top and bottom body lines
  crease.line(xD1, yBodyTop, totalX, yBodyTop);
  crease.line(xD1, yBodyBottom, totalX, yBodyBottom);
  // Top & bottom fold to tuck flaps
  crease.line(xW1, yBodyTop - D, xD2, yBodyTop - D);
  crease.line(xW1, yBodyBottom + D, xD2, yBodyBottom + D);

  // Vertical body panel creases
  crease.line(xD1, yBodyTop, xD1, yBodyBottom);
  crease.line(xW1, yBodyTop, xW1, yBodyBottom);
  crease.line(xD2, yBodyTop, xD2, yBodyBottom);
  crease.line(xW2, yBodyTop, xW2, yBodyBottom);

  // Safe area for all printable panels
  const safeP = new PathBuilder();
  const safeMargin = settings.safeArea || 3;
  // Front & Back panels
  safeP.rect(xW1 + safeMargin, yBodyTop + safeMargin, W - safeMargin * 2, H - safeMargin * 2);
  safeP.rect(xW2 + safeMargin, yBodyTop + safeMargin, W - safeMargin * 2, H - safeMargin * 2);
  // Left & Right side panels
  if (D > safeMargin * 2) {
    safeP.rect(xD1 + safeMargin, yBodyTop + safeMargin, D - safeMargin * 2, H - safeMargin * 2);
    safeP.rect(xD2 + safeMargin, yBodyTop + safeMargin, D - safeMargin * 2, H - safeMargin * 2);
    // Top & Bottom closure panels
    safeP.rect(xW1 + safeMargin, yBodyTop - D + safeMargin, W - safeMargin * 2, D - safeMargin * 2);
    safeP.rect(xW1 + safeMargin, yBodyBottom + safeMargin, W - safeMargin * 2, D - safeMargin * 2);
  }

  // Bleed boundary
  const bleedVal = settings.bleed || 3;
  const bleedP = new PathBuilder();
  bleedP.rect(xG - bleedVal, yBodyTop - D - tuck - bleedVal, totalX - xG + bleedVal * 2, H + (D + tuck) * 2 + bleedVal * 2);

  const glueArea = [
    `M ${xG} ${yBodyTop + 5} L ${xD1} ${yBodyTop} L ${xD1} ${yBodyBottom} L ${xG} ${yBodyBottom - 5} Z`
  ];

  const dimensions = [
    createDimension('dim-w', xW1, yBodyBottom + D + tuck + 12, xD2, yBodyBottom + D + tuck + 12, 'Width', W, 'horizontal'),
    createDimension('dim-h', totalX + 16, yBodyTop, totalX + 16, yBodyBottom, 'Height', H, 'vertical'),
    createDimension('dim-d', xD1, yBodyBottom + D + tuck + 12, xW1, yBodyBottom + D + tuck + 12, 'Depth', D, 'horizontal'),
  ];

  const annotations = [
    { x: xW1 + W / 2, y: yBodyTop + H / 2 - 10, text: 'FRONT PANEL', role: 'panel-label' as const },
    { x: xW2 + W / 2, y: yBodyTop + H / 2 - 10, text: 'BACK PANEL', role: 'panel-label' as const },
    { x: xD1 + D / 2, y: yBodyTop + H / 2 - 10, text: 'LEFT SIDE', role: 'panel-label' as const },
    { x: xD2 + D / 2, y: yBodyTop + H / 2 - 10, text: 'RIGHT SIDE', role: 'panel-label' as const },
    { x: xW1 + W / 2, y: yBodyTop - D / 2, text: 'TOP CLOSURE', role: 'panel-label' as const },
    { x: xW1 + W / 2, y: yBodyBottom + D / 2, text: 'BOTTOM CLOSURE', role: 'panel-label' as const },
    { x: xD1 - G / 2, y: yBodyTop + H / 2, text: 'GLUE FLAP', role: 'grain' as const, fontSize: 8 },
  ];

  return {
    bounds: makeBounds(xG, yBodyTop - D - tuck, totalX, yBodyBottom + D + tuck, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    safeAreaPath: safeP.toString(),
    bleedPath: bleedP.toString(),
    glueFlapPaths: glueArea,
    dimensions,
    annotations,
  };
}

function generateReverseTuckEnd(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(10, dims.width || 60);
  const H = Math.max(10, dims.height || 120);
  const D = Math.max(10, dims.depth || 40);
  const G = Math.max(8, settings.glueFlapWidth || 15);
  const tuck = Math.max(10, settings.tuckFlapLength || Math.min(18, D * 0.45));
  const dustH = Math.min(D * 0.65, 30);

  const xD1 = G;
  const xW1 = xD1 + D;
  const xD2 = xW1 + W;
  const xW2 = xD2 + D;
  const totalX = xW2 + W;

  const yBodyTop = D + tuck + 10;
  const yBodyBottom = yBodyTop + H;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // 100% Continuous Closed Outer Contour (RTE)
  // Starts at top-left of Left panel: (xD1, yBodyTop)
  cut.M(xD1, yBodyTop)
    .L(0, yBodyTop + 5)
    .L(0, yBodyBottom - 5)
    .L(xD1, yBodyBottom);

  // Bottom Left dust flap (D1)
  cut.L(xD1 + 5, yBodyBottom + dustH)
    .L(xW1 - 5, yBodyBottom + dustH)
    .L(xW1, yBodyBottom)
    .L(xD2, yBodyBottom); // front panel straight bottom edge

  // Bottom Right dust flap (D2)
  cut.L(xD2 + 5, yBodyBottom + dustH)
    .L(xW2 - 5, yBodyBottom + dustH)
    .L(xW2, yBodyBottom);

  // Bottom closure + tuck flap attached to BACK panel (xW2..totalX)
  const botFlap = createBottomTuckFlapClockwise(xW2, yBodyBottom, W, D, tuck);
  cut.addRaw(botFlap.replace(/^M\s*[\d\.\-]+\s+[\d\.\-]+/, ''));

  // Right edge
  cut.L(totalX, yBodyTop)
    .L(xW2, yBodyTop); // back panel top edge

  // Top Right dust flap (D2)
  cut.L(xW2 - 5, yBodyTop - dustH)
    .L(xD2 + 5, yBodyTop - dustH)
    .L(xD2, yBodyTop);

  // Top closure + tuck flap attached to FRONT panel (xW1..xD2)
  const topFlap = createTopTuckFlapClockwise(xW1, yBodyTop, W, D, tuck);
  cut.addRaw(topFlap.replace(/^M\s*[\d\.\-]+\s+[\d\.\-]+/, ''));

  // Top Left dust flap (D1)
  cut.L(xW1 - 5, yBodyTop - dustH)
    .L(xD1 + 5, yBodyTop - dustH)
    .L(xD1, yBodyTop)
    .Z();

  // Creases
  crease.line(xD1, yBodyTop, totalX, yBodyTop);
  crease.line(xD1, yBodyBottom, totalX, yBodyBottom);
  crease.line(xW1, yBodyTop - D, xD2, yBodyTop - D); // top panel fold
  crease.line(xW2, yBodyBottom + D, totalX, yBodyBottom + D); // bottom panel fold
  crease.line(xD1, yBodyTop, xD1, yBodyBottom);
  crease.line(xW1, yBodyTop, xW1, yBodyBottom);
  crease.line(xD2, yBodyTop, xD2, yBodyBottom);
  crease.line(xW2, yBodyTop, xW2, yBodyBottom);

  const safeP = new PathBuilder();
  const safeMargin = settings.safeArea || 3;
  safeP.rect(xW1 + safeMargin, yBodyTop + safeMargin, W - safeMargin * 2, H - safeMargin * 2);
  safeP.rect(xW2 + safeMargin, yBodyTop + safeMargin, W - safeMargin * 2, H - safeMargin * 2);
  if (D > safeMargin * 2) {
    safeP.rect(xD1 + safeMargin, yBodyTop + safeMargin, D - safeMargin * 2, H - safeMargin * 2);
    safeP.rect(xD2 + safeMargin, yBodyTop + safeMargin, D - safeMargin * 2, H - safeMargin * 2);
    safeP.rect(xW1 + safeMargin, yBodyTop - D + safeMargin, W - safeMargin * 2, D - safeMargin * 2);
    safeP.rect(xW2 + safeMargin, yBodyBottom + safeMargin, W - safeMargin * 2, D - safeMargin * 2);
  }

  const bleedVal = settings.bleed || 3;
  const bleedP = new PathBuilder();
  bleedP.rect(0 - bleedVal, yBodyTop - D - tuck - bleedVal, totalX + bleedVal * 2, H + (D + tuck) * 2 + bleedVal * 2);

  const dimensions = [
    createDimension('dim-w', xW1, yBodyBottom + D + tuck + 12, xD2, yBodyBottom + D + tuck + 12, 'Width', W, 'horizontal'),
    createDimension('dim-h', totalX + 16, yBodyTop, totalX + 16, yBodyBottom, 'Height', H, 'vertical'),
    createDimension('dim-d', xD1, yBodyBottom + D + tuck + 12, xW1, yBodyBottom + D + tuck + 12, 'Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(0, yBodyTop - D - tuck, totalX, yBodyBottom + D + tuck, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    safeAreaPath: safeP.toString(),
    bleedPath: bleedP.toString(),
    glueFlapPaths: [`M 0 ${yBodyTop + 5} L ${xD1} ${yBodyTop} L ${xD1} ${yBodyBottom} L 0 ${yBodyBottom - 5} Z`],
    dimensions,
    annotations: [
      { x: xW1 + W / 2, y: yBodyTop + H / 2, text: 'FRONT (RTE)', role: 'panel-label' },
      { x: xW2 + W / 2, y: yBodyTop + H / 2, text: 'BACK (RTE)', role: 'panel-label' },
      { x: xD1 + D / 2, y: yBodyTop + H / 2, text: 'LEFT SIDE', role: 'panel-label' },
      { x: xD2 + D / 2, y: yBodyTop + H / 2, text: 'RIGHT SIDE', role: 'panel-label' },
      { x: xW1 + W / 2, y: yBodyTop - D / 2, text: 'TOP CLOSURE (FRONT)', role: 'panel-label' },
      { x: xW2 + W / 2, y: yBodyBottom + D / 2, text: 'BOTTOM CLOSURE (BACK)', role: 'panel-label' },
    ],
  };
}

function generateCrashLockBottom(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(10, dims.width || 80);
  const H = Math.max(10, dims.height || 120);
  const D = Math.max(10, dims.depth || 50);
  const G = Math.max(8, settings.glueFlapWidth || 15);
  const tuck = Math.max(10, settings.tuckFlapLength || 16);

  const xD1 = G;
  const xW1 = xD1 + D;
  const xD2 = xW1 + W;
  const xW2 = xD2 + D;
  const totalX = xW2 + W;

  const yBodyTop = D + tuck + 10;
  const yBodyBottom = yBodyTop + H;
  const bottomFlapH = D * 0.75;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Glue flap
  cut.M(xD1, yBodyTop).L(0, yBodyTop + 5).L(0, yBodyBottom - 5).L(xD1, yBodyBottom);

  // Crash lock bottom interlocking flaps (45 degree angles)
  // Flap 1 (on D1): 45-deg angled flap
  cut.M(xD1, yBodyBottom).L(xD1, yBodyBottom + bottomFlapH * 0.7).L(xW1 - D * 0.3, yBodyBottom + bottomFlapH).L(xW1, yBodyBottom);
  // Flap 2 (on W1): Main interlocking tongue with center angle
  cut.M(xW1, yBodyBottom).L(xW1, yBodyBottom + bottomFlapH).L(xW1 + W / 2, yBodyBottom + bottomFlapH * 0.9).L(xD2, yBodyBottom + bottomFlapH).L(xD2, yBodyBottom);
  // Flap 3 (on D2): 45-deg angled flap with glue tab
  cut.M(xD2, yBodyBottom).L(xD2, yBodyBottom + bottomFlapH * 0.7).L(xW2 - D * 0.3, yBodyBottom + bottomFlapH).L(xW2, yBodyBottom);
  // Flap 4 (on W2): Interlocking back flap
  cut.M(xW2, yBodyBottom).L(xW2, yBodyBottom + bottomFlapH).L(xW2 + W / 2, yBodyBottom + bottomFlapH * 0.9).L(totalX, yBodyBottom + bottomFlapH).L(totalX, yBodyBottom);

  cut.L(totalX, yBodyTop);

  // Top tuck flap over W1
  cut.L(xW2, yBodyTop);
  cut.M(xW2, yBodyTop).L(xW2 - 5, yBodyTop - D * 0.5).L(xD2 + 5, yBodyTop - D * 0.5).L(xD2, yBodyTop);
  const topFlap = createTuckFlapPath(xW1, yBodyTop - D, W, tuck, 'top');
  cut.L(xD2, yBodyTop - D);
  cut.parts.push(topFlap.replace(/^M\s*[\d\.\-]+\s+[\d\.\-]+/, ''));
  cut.L(xW1, yBodyTop);
  cut.M(xW1, yBodyTop).L(xW1 - 5, yBodyTop - D * 0.5).L(xD1 + 5, yBodyTop - D * 0.5).L(xD1, yBodyTop);

  // Creases: body, panels, plus crash lock 45-degree diagonal creases
  crease.line(xD1, yBodyTop, totalX, yBodyTop);
  crease.line(xD1, yBodyBottom, totalX, yBodyBottom);
  crease.line(xW1, yBodyTop - D, xD2, yBodyTop - D);
  crease.line(xD1, yBodyTop, xD1, yBodyBottom);
  crease.line(xW1, yBodyTop, xW1, yBodyBottom);
  crease.line(xD2, yBodyTop, xD2, yBodyBottom);
  crease.line(xW2, yBodyTop, xW2, yBodyBottom);

  // Crash lock diagonal 45-deg creases on panels
  crease.line(xD1, yBodyBottom, xD1 + D * 0.45, yBodyBottom + bottomFlapH * 0.5);
  crease.line(xD2, yBodyBottom, xD2 + D * 0.45, yBodyBottom + bottomFlapH * 0.5);

  const dimensions = [
    createDimension('dim-w', xW1, yBodyBottom + bottomFlapH + 12, xD2, yBodyBottom + bottomFlapH + 12, 'Width', W, 'horizontal'),
    createDimension('dim-h', totalX + 16, yBodyTop, totalX + 16, yBodyBottom, 'Height', H, 'vertical'),
    createDimension('dim-d', xD1, yBodyBottom + bottomFlapH + 12, xW1, yBodyBottom + bottomFlapH + 12, 'Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(0, yBodyTop - D - tuck, totalX, yBodyBottom + bottomFlapH, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    glueFlapPaths: [`M 0 ${yBodyTop + 5} L ${xD1} ${yBodyTop} L ${xD1} ${yBodyBottom} L 0 ${yBodyBottom - 5} Z`],
    dimensions,
    annotations: [
      { x: xW1 + W / 2, y: yBodyTop + H / 2, text: 'AUTO-BOTTOM / CRASH LOCK', role: 'panel-label' },
      { x: xW1 + W / 2, y: yBodyBottom + bottomFlapH / 2, text: '45° AUTO LOCK FLAP', role: 'spec', fontSize: 9 },
    ],
  };
}

function generateSnapLockBottom(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(10, dims.width || 70);
  const H = Math.max(10, dims.height || 100);
  const D = Math.max(10, dims.depth || 50);
  const G = Math.max(8, settings.glueFlapWidth || 15);
  const tuck = Math.max(10, settings.tuckFlapLength || 16);

  const xD1 = G;
  const xW1 = xD1 + D;
  const xD2 = xW1 + W;
  const xW2 = xD2 + D;
  const totalX = xW2 + W;

  const yBodyTop = D + tuck + 10;
  const yBodyBottom = yBodyTop + H;
  const lockH = Math.min(D * 0.7, 45);

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Glue flap
  cut.M(xD1, yBodyTop).L(0, yBodyTop + 5).L(0, yBodyBottom - 5).L(xD1, yBodyBottom);

  // 1-2-3 Snap lock bottom flaps:
  // Flap 1 (Left D): Stepped lock wing
  cut.M(xD1, yBodyBottom).L(xD1, yBodyBottom + lockH * 0.8).L(xW1 - 5, yBodyBottom + lockH * 0.5).L(xW1, yBodyBottom);
  // Flap 2 (Front W): Main notched tongue
  cut.M(xW1, yBodyBottom).L(xW1, yBodyBottom + lockH).L(xW1 + W * 0.3, yBodyBottom + lockH).L(xW1 + W * 0.35, yBodyBottom + lockH - 6).L(xD2 - W * 0.35, yBodyBottom + lockH - 6).L(xD2 - W * 0.3, yBodyBottom + lockH).L(xD2, yBodyBottom + lockH).L(xD2, yBodyBottom);
  // Flap 3 (Right D): Stepped lock wing
  cut.M(xD2, yBodyBottom).L(xD2, yBodyBottom + lockH * 0.5).L(xW2 - 5, yBodyBottom + lockH * 0.8).L(xW2, yBodyBottom);
  // Flap 4 (Back W): Secondary tongue
  cut.M(xW2, yBodyBottom).L(xW2 + 5, yBodyBottom + lockH * 0.6).L(totalX - 5, yBodyBottom + lockH * 0.6).L(totalX, yBodyBottom);

  cut.L(totalX, yBodyTop);

  // Top tuck flap over W1
  cut.L(xW2, yBodyTop);
  cut.M(xW2, yBodyTop).L(xW2 - 5, yBodyTop - D * 0.5).L(xD2 + 5, yBodyTop - D * 0.5).L(xD2, yBodyTop);
  const topFlap = createTuckFlapPath(xW1, yBodyTop - D, W, tuck, 'top');
  cut.L(xD2, yBodyTop - D);
  cut.parts.push(topFlap.replace(/^M\s*[\d\.\-]+\s+[\d\.\-]+/, ''));
  cut.L(xW1, yBodyTop);
  cut.M(xW1, yBodyTop).L(xW1 - 5, yBodyTop - D * 0.5).L(xD1 + 5, yBodyTop - D * 0.5).L(xD1, yBodyTop);

  // Creases
  crease.line(xD1, yBodyTop, totalX, yBodyTop);
  crease.line(xD1, yBodyBottom, totalX, yBodyBottom);
  crease.line(xW1, yBodyTop - D, xD2, yBodyTop - D);
  crease.line(xD1, yBodyTop, xD1, yBodyBottom);
  crease.line(xW1, yBodyTop, xW1, yBodyBottom);
  crease.line(xD2, yBodyTop, xD2, yBodyBottom);
  crease.line(xW2, yBodyTop, xW2, yBodyBottom);

  const dimensions = [
    createDimension('dim-w', xW1, yBodyBottom + lockH + 12, xD2, yBodyBottom + lockH + 12, 'Width', W, 'horizontal'),
    createDimension('dim-h', totalX + 16, yBodyTop, totalX + 16, yBodyBottom, 'Height', H, 'vertical'),
    createDimension('dim-d', xD1, yBodyBottom + lockH + 12, xW1, yBodyBottom + lockH + 12, 'Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(0, yBodyTop - D - tuck, totalX, yBodyBottom + lockH, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    glueFlapPaths: [`M 0 ${yBodyTop + 5} L ${xD1} ${yBodyTop} L ${xD1} ${yBodyBottom} L 0 ${yBodyBottom - 5} Z`],
    dimensions,
    annotations: [
      { x: xW1 + W / 2, y: yBodyTop + H / 2, text: '1-2-3 SNAP LOCK BOTTOM', role: 'panel-label' },
    ],
  };
}

function generatePillowBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(30, dims.width || 90);
  const L = Math.max(40, dims.height || 140);
  const curveH = Math.max(10, Math.min(25, W * 0.25));
  const G = Math.max(8, settings.glueFlapWidth || 12);

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  const x0 = 10;
  const xG = x0 + G;
  const xPanel1 = xG + W;
  const xPanel2 = xPanel1 + W;
  const yTop = 30;
  const yBottom = yTop + L;

  // Glue flap
  cut.M(xG, yTop).L(x0, yTop + 5).L(x0, yBottom - 5).L(xG, yBottom);

  // Bottom curved flaps
  // Panel 1 bottom flap
  cut.M(xG, yBottom).Q(xG + W / 2, yBottom + curveH * 1.5, xPanel1, yBottom);
  // Panel 2 bottom flap with thumb notch
  cut.M(xPanel1, yBottom).Q(xPanel1 + W / 2, yBottom + curveH * 1.5, xPanel2, yBottom);
  cut.L(xPanel2, yTop);

  // Top curved flaps
  cut.M(xPanel2, yTop).Q(xPanel1 + W / 2, yTop - curveH * 1.5, xPanel1, yTop);
  cut.M(xPanel1, yTop).Q(xG + W / 2, yTop - curveH * 1.5, xG, yTop);

  // Thumb notch cut on one flap
  const thumb = createThumbNotchPath(xPanel1 + W / 2, yTop - curveH * 0.8, 8, 'up');
  cut.parts.push(thumb);

  // Creases: center fold line between panels
  crease.line(xPanel1, yTop, xPanel1, yBottom);
  crease.line(xG, yTop, xG, yBottom);

  // Curved score lines at ends
  // Top curves (bowing downward)
  crease.M(xG, yTop).Q(xG + W / 2, yTop + curveH, xPanel1, yTop);
  crease.M(xPanel1, yTop).Q(xPanel1 + W / 2, yTop + curveH, xPanel2, yTop);
  // Bottom curves (bowing upward)
  crease.M(xG, yBottom).Q(xG + W / 2, yBottom - curveH, xPanel1, yBottom);
  crease.M(xPanel1, yBottom).Q(xPanel1 + W / 2, yBottom - curveH, xPanel2, yBottom);

  const dimensions = [
    createDimension('dim-w', xG, yBottom + curveH * 1.5 + 10, xPanel1, yBottom + curveH * 1.5 + 10, 'Width', W, 'horizontal'),
    createDimension('dim-l', xPanel2 + 15, yTop, xPanel2 + 15, yBottom, 'Length', L, 'vertical'),
  ];

  return {
    bounds: makeBounds(x0, yTop - curveH * 1.5, xPanel2, yBottom + curveH * 1.5, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    glueFlapPaths: [`M ${x0} ${yTop + 5} L ${xG} ${yTop} L ${xG} ${yBottom} L ${x0} ${yBottom - 5} Z`],
    dimensions,
    annotations: [
      { x: xG + W / 2, y: yTop + L / 2, text: 'PILLOW BOX PANEL A', role: 'panel-label' },
      { x: xPanel1 + W / 2, y: yTop + L / 2, text: 'PILLOW BOX PANEL B', role: 'panel-label' },
    ],
  };
}

function generateGableBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(20, dims.width || 80);
  const H = Math.max(30, dims.height || 100);
  const D = Math.max(20, dims.depth || 60);
  const G = Math.max(8, settings.glueFlapWidth || 15);
  const gableH = D * 0.75;
  const handleH = 35;

  const xD1 = G;
  const xW1 = xD1 + D;
  const xD2 = xW1 + W;
  const xW2 = xD2 + D;
  const totalX = xW2 + W;

  const yBodyTop = gableH + handleH + 10;
  const yBodyBottom = yBodyTop + H;
  const bottomFlapH = D * 0.65;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Glue flap
  cut.M(xD1, yBodyTop).L(0, yBodyTop + 5).L(0, yBodyBottom - 5).L(xD1, yBodyBottom);

  // Bottom standard interlocking flaps
  cut.M(xD1, yBodyBottom).L(xD1, yBodyBottom + bottomFlapH).L(xW1, yBodyBottom + bottomFlapH).L(xW1, yBodyBottom);
  cut.M(xW1, yBodyBottom).L(xW1, yBodyBottom + bottomFlapH).L(xD2, yBodyBottom + bottomFlapH).L(xD2, yBodyBottom);
  cut.M(xD2, yBodyBottom).L(xD2, yBodyBottom + bottomFlapH).L(xW2, yBodyBottom + bottomFlapH).L(xW2, yBodyBottom);
  cut.M(xW2, yBodyBottom).L(xW2, yBodyBottom + bottomFlapH).L(totalX, yBodyBottom + bottomFlapH).L(totalX, yBodyBottom);
  cut.L(totalX, yBodyTop);

  // Top gable and handle contours:
  // Back panel handle (W2)
  cut.L(totalX, yBodyTop - gableH).L(totalX - 10, yBodyTop - gableH - handleH).L(xW2 + 10, yBodyTop - gableH - handleH).L(xW2, yBodyTop - gableH);
  // Side gable angle (D2)
  cut.L(xD2, yBodyTop - gableH);
  // Front panel handle (W1)
  cut.L(xD2 - 10, yBodyTop - gableH - handleH).L(xW1 + 10, yBodyTop - gableH - handleH).L(xW1, yBodyTop - gableH);
  // Side gable angle (D1)
  cut.L(xD1, yBodyTop - gableH).L(xD1, yBodyTop);

  // Handle cutouts in front and back handle flaps
  const handleW = Math.min(W * 0.5, 45);
  const handleR = 7;
  const handle1 = new PathBuilder().roundRect(xW1 + (W - handleW) / 2, yBodyTop - gableH - handleH + 10, handleW, 14, handleR);
  const handle2 = new PathBuilder().roundRect(xW2 + (W - handleW) / 2, yBodyTop - gableH - handleH + 10, handleW, 14, handleR);
  cut.parts.push(handle1.toString());
  cut.parts.push(handle2.toString());

  // Creases
  crease.line(xD1, yBodyTop, totalX, yBodyTop);
  crease.line(xD1, yBodyBottom, totalX, yBodyBottom);
  crease.line(xD1, yBodyTop - gableH, totalX, yBodyTop - gableH); // fold line below handle
  crease.line(xD1, yBodyTop, xD1, yBodyBottom);
  crease.line(xW1, yBodyTop, xW1, yBodyBottom);
  crease.line(xD2, yBodyTop, xD2, yBodyBottom);
  crease.line(xW2, yBodyTop, xW2, yBodyBottom);

  // Triangular gable score lines on side panels D1 and D2
  crease.line(xD1, yBodyTop, xD1 + D / 2, yBodyTop - gableH);
  crease.line(xW1, yBodyTop, xD1 + D / 2, yBodyTop - gableH);
  crease.line(xD2, yBodyTop, xD2 + D / 2, yBodyTop - gableH);
  crease.line(xW2, yBodyTop, xD2 + D / 2, yBodyTop - gableH);

  const dimensions = [
    createDimension('dim-w', xW1, yBodyBottom + bottomFlapH + 12, xD2, yBodyBottom + bottomFlapH + 12, 'Width', W, 'horizontal'),
    createDimension('dim-h', totalX + 16, yBodyTop, totalX + 16, yBodyBottom, 'Height', H, 'vertical'),
    createDimension('dim-d', xD1, yBodyBottom + bottomFlapH + 12, xW1, yBodyBottom + bottomFlapH + 12, 'Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(0, yBodyTop - gableH - handleH, totalX, yBodyBottom + bottomFlapH, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    glueFlapPaths: [`M 0 ${yBodyTop + 5} L ${xD1} ${yBodyTop} L ${xD1} ${yBodyBottom} L 0 ${yBodyBottom - 5} Z`],
    dimensions,
    annotations: [
      { x: xW1 + W / 2, y: yBodyTop + H / 2, text: 'GABLE BOX FRONT', role: 'panel-label' },
      { x: xD1 + D / 2, y: yBodyTop - gableH / 2, text: 'TRIANGLE GABLE CREASE', role: 'spec', fontSize: 8 },
    ],
  };
}

function generateSleeveBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(20, dims.width || 100);
  const H = Math.max(20, dims.height || 120);
  const D = Math.max(10, dims.depth || 30);
  const G = Math.max(8, settings.glueFlapWidth || 15);

  const xD1 = G;
  const xW1 = xD1 + D;
  const xD2 = xW1 + W;
  const xW2 = xD2 + D;
  const totalX = xW2 + W;

  const yTop = 20;
  const yBottom = yTop + H;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Simple wrap sleeve: glued tube open on both ends
  cut.M(xD1, yTop).L(0, yTop + 4).L(0, yBottom - 4).L(xD1, yBottom);
  cut.L(totalX, yBottom).L(totalX, yTop).L(xD1, yTop);

  // Optional thumb notches on front and back
  const thumbNotch1 = createThumbNotchPath(xW1 + W / 2, yTop, 10, 'down');
  const thumbNotch2 = createThumbNotchPath(xW2 + W / 2, yTop, 10, 'down');
  cut.parts.push(thumbNotch1, thumbNotch2);

  // Creases between panels
  crease.line(xD1, yTop, xD1, yBottom);
  crease.line(xW1, yTop, xW1, yBottom);
  crease.line(xD2, yTop, xD2, yBottom);
  crease.line(xW2, yTop, xW2, yBottom);

  const dimensions = [
    createDimension('dim-w', xW1, yBottom + 12, xD2, yBottom + 12, 'Width', W, 'horizontal'),
    createDimension('dim-h', totalX + 14, yTop, totalX + 14, yBottom, 'Height', H, 'vertical'),
    createDimension('dim-d', xD1, yBottom + 12, xW1, yBottom + 12, 'Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(0, yTop, totalX, yBottom, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    glueFlapPaths: [`M 0 ${yTop + 4} L ${xD1} ${yTop} L ${xD1} ${yBottom} L 0 ${yBottom - 4} Z`],
    dimensions,
    annotations: [
      { x: xW1 + W / 2, y: yTop + H / 2, text: 'SLEEVE TOP', role: 'panel-label' },
      { x: xW2 + W / 2, y: yTop + H / 2, text: 'SLEEVE BOTTOM', role: 'panel-label' },
    ],
  };
}

function generateDrawerTrayBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(20, dims.width || 95);
  const L = Math.max(20, dims.height || 115);
  const D = Math.max(10, dims.depth || 28);
  const roll = D * 0.95; // double roll-over walls for rigidity

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Tray with roll-over walls
  const x0 = 10;
  const xW0 = x0 + roll;
  const xW1 = xW0 + D;
  const xW2 = xW1 + W;
  const xW3 = xW2 + D;
  const xTotal = xW3 + roll;

  const y0 = 10;
  const yL0 = y0 + roll;
  const yL1 = yL0 + D;
  const yL2 = yL1 + L;
  const yL3 = yL2 + D;
  const yTotal = yL3 + roll;

  // Outer cut contour with corner notches
  cut.rect(xW1, y0, W, yTotal - y0); // top/bottom extensions
  cut.rect(x0, yL1, xTotal - x0, L); // left/right extensions

  // Corner dust / locking tabs
  const tabW = D * 0.8;
  cut.rect(xW0 - tabW, yL0, tabW, D);
  cut.rect(xW3, yL0, tabW, D);
  cut.rect(xW0 - tabW, yL2, tabW, D);
  cut.rect(xW3, yL2, tabW, D);

  // Creases: base boundary + wall folds
  crease.rect(xW1, yL1, W, L); // bottom tray base
  crease.line(xW0, yL1, xW0, yL2);
  crease.line(xW3, yL1, xW3, yL2);
  crease.line(xW1, yL0, xW2, yL0);
  crease.line(xW1, yL3, xW2, yL3);

  const dimensions = [
    createDimension('dim-w', xW1, yTotal + 12, xW2, yTotal + 12, 'Base Width', W, 'horizontal'),
    createDimension('dim-l', xTotal + 14, yL1, xTotal + 14, yL2, 'Base Length', L, 'vertical'),
    createDimension('dim-d', xW2, yTotal + 12, xW3, yTotal + 12, 'Wall Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(x0, y0, xTotal, yTotal, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: xW1 + W / 2, y: yL1 + L / 2, text: 'DRAWER TRAY BASE', role: 'panel-label' },
    ],
  };
}

function generateHangingHeaderBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const base = generateStraightTuckEnd(dims, settings);
  const W = Math.max(10, dims.width || 60);
  const D = Math.max(10, dims.depth || 40);
  const headerH = Math.max(25, (dims.headerHeight as number) || 35);
  const G = Math.max(8, settings.glueFlapWidth || 15);

  const xD1 = G;
  const xW1 = xD1 + D;
  const xD2 = xW1 + W;
  const xW2 = xD2 + D;

  // Extended header attached to back panel
  const yTop = D + 18 + 10;
  const euroSlot = createEuroSlotPath(xW2 + W / 2, yTop - headerH / 2, 32, 9);

  const cut = new PathBuilder(base.cutPath);
  // Add header extension and euro slot
  cut.M(xW2, yTop).L(xW2, yTop - headerH).L(xW2 + W, yTop - headerH).L(xW2 + W, yTop);
  cut.parts.push(euroSlot);

  return {
    ...base,
    bounds: makeBounds(base.bounds.minX, yTop - headerH, base.bounds.maxX, base.bounds.maxY, 15),
    cutPath: cut.toString(),
    annotations: [
      ...base.annotations,
      { x: xW2 + W / 2, y: yTop - headerH / 2 - 12, text: 'HANGING HEADER (EURO SLOT)', role: 'spec', fontSize: 8 },
    ],
  };
}

function generateWindowBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const base = generateStraightTuckEnd(dims, settings);
  const W = Math.max(10, dims.width || 60);
  const H = Math.max(10, dims.height || 120);
  const D = Math.max(10, dims.depth || 40);
  const G = Math.max(8, settings.glueFlapWidth || 15);

  const xW1 = G + D;
  const yBodyTop = D + 18 + 10;

  // Aperture in front panel
  const winMargin = Math.min(12, W * 0.18);
  const winW = W - winMargin * 2;
  const winH = H - winMargin * 2.5;
  const winCornerR = 6;

  const windowPath = new PathBuilder().roundRect(xW1 + winMargin, yBodyTop + winMargin * 1.5, winW, winH, winCornerR);
  const cut = new PathBuilder(base.cutPath);
  cut.parts.push(windowPath.toString());

  return {
    ...base,
    cutPath: cut.toString(),
    annotations: [
      ...base.annotations,
      { x: xW1 + W / 2, y: yBodyTop + H / 2, text: 'DIE-CUT WINDOW', role: 'spec', fontSize: 9 },
    ],
  };
}

function generateFourCornerTray(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(20, dims.width || 120);
  const L = Math.max(20, dims.height || 150);
  const D = Math.max(10, dims.depth || 45);
  const flapW = Math.min(D * 0.85, 40);

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  const x0 = 10;
  const x1 = x0 + D;
  const x2 = x1 + W;
  const x3 = x2 + D;

  const y0 = 10;
  const y1 = y0 + D;
  const y2 = y1 + L;
  const y3 = y2 + D;

  // Base and 4 walls
  cut.M(x1, y0).L(x2, y0).L(x2, y1);
  cut.L(x3, y1).L(x3, y2).L(x2, y2);
  cut.L(x2, y3).L(x1, y3).L(x1, y2);
  cut.L(x0, y2).L(x0, y1).L(x1, y1).Z();

  // 4 corner glue tabs with 45-degree angle
  cut.M(x1, y1).L(x1 - flapW, y1 - flapW * 0.5).L(x1 - flapW, y1).Z();
  cut.M(x2, y1).L(x2 + flapW, y1 - flapW * 0.5).L(x2 + flapW, y1).Z();
  cut.M(x1, y2).L(x1 - flapW, y2 + flapW * 0.5).L(x1 - flapW, y2).Z();
  cut.M(x2, y2).L(x2 + flapW, y2 + flapW * 0.5).L(x2 + flapW, y2).Z();

  // Creases around bottom base
  crease.rect(x1, y1, W, L);

  const dimensions = [
    createDimension('dim-w', x1, y3 + 12, x2, y3 + 12, 'Base Width', W, 'horizontal'),
    createDimension('dim-l', x3 + 14, y1, x3 + 14, y2, 'Base Length', L, 'vertical'),
    createDimension('dim-d', x2, y3 + 12, x3, y3 + 12, 'Tray Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(x0, y0, x3, y3, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: x1 + W / 2, y: y1 + L / 2, text: '4-CORNER BEERS TRAY', role: 'panel-label' },
    ],
  };
}

function generateHexagonalBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const sideW = Math.max(15, dims.width || 40);
  const H = Math.max(20, dims.height || 90);
  const G = Math.max(8, settings.glueFlapWidth || 12);
  const flapH = sideW * 0.85;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  const panels = 6;
  const totalW = sideW * panels;
  const x0 = 10;
  const xG = x0 + G;
  const yTop = flapH + 15;
  const yBottom = yTop + H;

  // Side glue flap
  cut.M(xG, yTop).L(x0, yTop + 4).L(x0, yBottom - 4).L(xG, yBottom);

  // Bottom 6 triangular interlocking flaps
  for (let i = 0; i < panels; i++) {
    const px = xG + i * sideW;
    cut.M(px, yBottom).L(px + sideW / 2, yBottom + flapH).L(px + sideW, yBottom);
    // Top flaps
    cut.M(px, yTop).L(px + sideW / 2, yTop - flapH).L(px + sideW, yTop);
  }

  cut.M(xG + totalW, yTop).L(xG + totalW, yBottom);

  // Horizontal crease lines
  crease.line(xG, yTop, xG + totalW, yTop);
  crease.line(xG, yBottom, xG + totalW, yBottom);

  // Vertical panel creases
  for (let i = 0; i <= panels; i++) {
    crease.line(xG + i * sideW, yTop, xG + i * sideW, yBottom);
  }

  const dimensions = [
    createDimension('dim-w', xG, yBottom + flapH + 12, xG + sideW, yBottom + flapH + 12, 'Facet Width', sideW, 'horizontal'),
    createDimension('dim-h', xG + totalW + 14, yTop, xG + totalW + 14, yBottom, 'Height', H, 'vertical'),
  ];

  return {
    bounds: makeBounds(x0, yTop - flapH, xG + totalW, yBottom + flapH, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    glueFlapPaths: [`M ${x0} ${yTop + 4} L ${xG} ${yTop} L ${xG} ${yBottom} L ${x0} ${yBottom - 4} Z`],
    dimensions,
    annotations: [
      { x: xG + totalW / 2, y: yTop + H / 2, text: '6-FACET HEXAGONAL CARTON', role: 'panel-label' },
    ],
  };
}

function generateTriangleBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const sideW = Math.max(20, dims.width || 60);
  const H = Math.max(30, dims.height || 140);
  const G = Math.max(8, settings.glueFlapWidth || 12);
  const flapH = sideW * 0.866; // equilateral triangle height

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  const panels = 3;
  const totalW = sideW * panels;
  const x0 = 10;
  const xG = x0 + G;
  const yTop = flapH + 15;
  const yBottom = yTop + H;

  cut.M(xG, yTop).L(x0, yTop + 4).L(x0, yBottom - 4).L(xG, yBottom);

  for (let i = 0; i < panels; i++) {
    const px = xG + i * sideW;
    cut.M(px, yBottom).L(px + sideW / 2, yBottom + flapH).L(px + sideW, yBottom);
    cut.M(px, yTop).L(px + sideW / 2, yTop - flapH).L(px + sideW, yTop);
  }
  cut.M(xG + totalW, yTop).L(xG + totalW, yBottom);

  crease.line(xG, yTop, xG + totalW, yTop);
  crease.line(xG, yBottom, xG + totalW, yBottom);

  for (let i = 0; i <= panels; i++) {
    crease.line(xG + i * sideW, yTop, xG + i * sideW, yBottom);
  }

  const dimensions = [
    createDimension('dim-w', xG, yBottom + flapH + 12, xG + sideW, yBottom + flapH + 12, 'Face Width', sideW, 'horizontal'),
    createDimension('dim-h', xG + totalW + 14, yTop, xG + totalW + 14, yBottom, 'Prism Height', H, 'vertical'),
  ];

  return {
    bounds: makeBounds(x0, yTop - flapH, xG + totalW, yBottom + flapH, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: xG + totalW / 2, y: yTop + H / 2, text: 'TRIANGULAR PRISM CARTON', role: 'panel-label' },
    ],
  };
}

/**
 * Standard factory helper to build variations of folding cartons
 */
function createFoldingCartonTemplate(
  id: string,
  name: string,
  desc: string,
  recUse: string,
  code: string,
  diff: 'Basic' | 'Intermediate' | 'Advanced',
  genType: 'ste' | 'rte' | 'crash' | 'snap' | 'pillow' | 'gable' | 'sleeve' | 'drawer' | 'hanging' | 'window' | '4corner' | 'hex' | 'tri',
  dimDefaults: { w: number; h: number; d?: number }
): TemplateDefinition {
  const dims = [
    { key: 'width', label: 'Width (W)', defaultVal: dimDefaults.w, minVal: 10, maxVal: 500, required: true },
    { key: 'height', label: 'Height (H)', defaultVal: dimDefaults.h, minVal: 10, maxVal: 800, required: true },
  ];
  if (dimDefaults.d !== undefined) {
    dims.push({ key: 'depth', label: 'Depth (D)', defaultVal: dimDefaults.d, minVal: 10, maxVal: 400, required: true });
  }

  let generator = generateStraightTuckEnd;
  if (genType === 'rte') generator = generateReverseTuckEnd;
  else if (genType === 'crash') generator = generateCrashLockBottom;
  else if (genType === 'snap') generator = generateSnapLockBottom;
  else if (genType === 'pillow') generator = generatePillowBox;
  else if (genType === 'gable') generator = generateGableBox;
  else if (genType === 'sleeve') generator = generateSleeveBox;
  else if (genType === 'drawer') generator = generateDrawerTrayBox;
  else if (genType === 'hanging') generator = generateHangingHeaderBox;
  else if (genType === 'window') generator = generateWindowBox;
  else if (genType === '4corner') generator = generateFourCornerTray;
  else if (genType === 'hex') generator = generateHexagonalBox;
  else if (genType === 'tri') generator = generateTriangleBox;

  return {
    id,
    name,
    category: 'folding-cartons',
    categoryName: 'Folding Cartons',
    industryCode: code,
    description: desc,
    recommendedUse: recUse,
    stockRecommendation: 'SBB/SBS Solid Bleached Sulfate or FBB Folding Boxboard (250 - 400 gsm / 12 - 20 pt).',
    difficulty: diff,
    dimensions: dims,
    generator,
  };
}

export const foldingCartonTemplates: TemplateDefinition[] = [
  createFoldingCartonTemplate(
    'straight-tuck-end',
    'Straight Tuck End Box (STE)',
    'Classic folding carton with top and bottom tuck flaps folding from the front panel. Clean front face with no visible raw edges.',
    'Cosmetics, luxury beauty, personal care, medicine, pharmaceuticals.',
    'ECMA A20.20.01.01',
    'Basic',
    'ste',
    { w: 60, h: 120, d: 40 }
  ),
  createFoldingCartonTemplate(
    'reverse-tuck-end',
    'Reverse Tuck End Box (RTE)',
    'Standard packaging carton where top tuck folds from front and bottom tuck folds from back for maximum nesting efficiency on sheet.',
    'Consumer goods, hardware, tea, dry foods, electronics accessories.',
    'ECMA A20.20.03.01',
    'Basic',
    'rte',
    { w: 60, h: 120, d: 40 }
  ),
  createFoldingCartonTemplate(
    'auto-bottom-box',
    'Auto Bottom Box (Crash Lock)',
    'High-speed packaging carton featuring pre-glued 45-degree interlocking bottom flaps that snap closed instantly when opened.',
    'Fast-paced fulfillment lines, heavier retail goods, candles, glass bottles.',
    'ECMA A50.20.01.01',
    'Advanced',
    'crash',
    { w: 75, h: 140, d: 55 }
  ),
  createFoldingCartonTemplate(
    'snap-lock-bottom',
    'Snap Lock Bottom Box (1-2-3 Lock)',
    'No-glue interlocking bottom with four numbered folding flaps that lock securely into each other without adhesive.',
    'Electronics, heavier retail items, craft goods, retail displays.',
    'ECMA A40.20.01.01',
    'Intermediate',
    'snap',
    { w: 70, h: 110, d: 50 }
  ),
  createFoldingCartonTemplate(
    'crash-lock-carton',
    'Crash Lock Bottom Carton',
    'Heavy-duty crash lock structure designed for high-density contents and rapid semi-automated packing.',
    'Health supplements, bottled beverages, perfumes, ceramic mugs.',
    'ECMA A50.20.02.01',
    'Advanced',
    'crash',
    { w: 85, h: 160, d: 65 }
  ),
  createFoldingCartonTemplate(
    'pillow-box',
    'Curved Pillow Box',
    'Distinctive elliptical packaging with convex curved score lines and side finger tabs for sleek gift presentation.',
    'Jewelry, silk scarves, gift cards, small fashion accessories, soaps.',
    'ECMA D10.20.01.01',
    'Intermediate',
    'pillow',
    { w: 90, h: 140 }
  ),
  createFoldingCartonTemplate(
    'gable-box',
    'Gable Top Gift Box with Handle',
    'Charming tent-top structure with integrated die-cut carrying handle and triangular side gusset scores.',
    'Bakery items, party favors, meal kits, promotional gifts.',
    'ECMA C20.20.01.01',
    'Advanced',
    'gable',
    { w: 100, h: 120, d: 70 }
  ),
  createFoldingCartonTemplate(
    'sleeve-box',
    'Wrap Sleeve Carton',
    'Four-panel open-ended tubular wrap designed to slip snugly over thermoformed trays or inner drawer cartons.',
    'Gourmet chocolates, ready meals, software boxes, soap wraps.',
    'ECMA F10.10.01.01',
    'Basic',
    'sleeve',
    { w: 110, h: 140, d: 35 }
  ),
  createFoldingCartonTemplate(
    'drawer-box',
    'Sliding Drawer Inner Tray',
    'Rigid folding tray with roll-over double side walls, built to slide seamlessly into matching outer sleeves.',
    'Luxury confectionery, premium cosmetics, jewelry gift sets.',
    'ECMA F20.20.01.01',
    'Intermediate',
    'drawer',
    { w: 105, h: 135, d: 32 }
  ),
  createFoldingCartonTemplate(
    'hanging-carton',
    'Hanging Display Carton (Euro Slot)',
    'Retail pegboard carton with extended header panel featuring standard 32mm Sombrero / Euro punch slot.',
    'Headphones, cables, cosmetics, phone accessories, retail pegs.',
    'ECMA A20.40.01.01',
    'Basic',
    'hanging',
    { w: 65, h: 130, d: 35 }
  ),
  createFoldingCartonTemplate(
    'euro-slot-box',
    'Euro Slot Retail Box',
    'Compact retail folding carton engineered specifically for hanging rack merchandise with reinforced top flap.',
    'Batteries, toothbrushes, stylus pens, stationery, hardware.',
    'ECMA A20.40.02.01',
    'Basic',
    'hanging',
    { w: 55, h: 100, d: 25 }
  ),
  createFoldingCartonTemplate(
    'window-carton',
    'Die-Cut Window Display Carton',
    'Folding carton with precision perimeter die-cut aperture allowing consumer visibility of inner product or transparent PET film.',
    'Toys, dolls, artisanal soaps, baked goods, premium tech.',
    'ECMA A20.30.01.01',
    'Intermediate',
    'window',
    { w: 80, h: 140, d: 50 }
  ),
  createFoldingCartonTemplate(
    'four-corner-tray',
    '4-Corner Beers Tray Carton',
    'Collapsible shallow retail tray with angled corner glue flaps that fold flat for shipping and erect into rigid display trays.',
    'Bakery trays, fruit punnets, retail apparel, subscription kits.',
    'ECMA C10.20.01.01',
    'Intermediate',
    '4corner',
    { w: 140, h: 180, d: 45 }
  ),
  createFoldingCartonTemplate(
    'six-corner-carton',
    '6-Corner Folded Tray with Attached Lid',
    'One-piece carton featuring 4-corner tray bottom with an attached 2-corner folding lid for bakery and pastry presentation.',
    'Donuts, cakes, pastries, luxury garments, presentation gifts.',
    'ECMA C30.20.01.01',
    'Advanced',
    '4corner',
    { w: 160, h: 200, d: 55 }
  ),
  createFoldingCartonTemplate(
    'hexagonal-box',
    'Hexagonal Prism Box',
    'Six-sided geometric packaging structure with interlocking triangular petal closures top and bottom.',
    'Perfumes, luxury candles, specialty teas, artisanal candies.',
    'ECMA D20.10.01.01',
    'Advanced',
    'hex',
    { w: 45, h: 110 }
  ),
  createFoldingCartonTemplate(
    'triangle-box',
    'Triangular Prism Carton',
    'Three-sided eye-catching prism carton with triangular end flaps, famous for gourmet chocolate bars and promotional mailers.',
    'Toblerone-style chocolates, umbrella boxes, specialty cosmetics.',
    'ECMA D20.20.01.01',
    'Intermediate',
    'tri',
    { w: 60, h: 160 }
  ),
  createFoldingCartonTemplate(
    'tall-cosmetic-carton',
    'Tall Cosmetic Bottle Carton',
    'Slender straight-tuck carton with reinforced dust flaps engineered specifically for glass dropper bottles and serum tubes.',
    'Facial serums, essential oils, mascaras, lipsticks, perfumes.',
    'ECMA A20.20.01.02',
    'Basic',
    'ste',
    { w: 38, h: 115, d: 38 }
  ),
  createFoldingCartonTemplate(
    'medicine-carton',
    'Pharmaceutical Medicine Carton',
    'Strict standard ECMA medicine box with extended friction tuck tabs and braille embossing clearance margin.',
    'Prescription drugs, vitamins, eye drops, ointment tubes.',
    'ECMA A20.20.01.03',
    'Basic',
    'rte',
    { w: 50, h: 85, d: 35 }
  ),
  createFoldingCartonTemplate(
    'soap-carton',
    'Bar Soap Folding Carton',
    'Snug protective carton engineered to preserve rectangular bar soaps with clean tuck closures.',
    'Artisanal soap bars, travel soaps, solid shampoo bars.',
    'ECMA A20.20.01.04',
    'Basic',
    'ste',
    { w: 68, h: 95, d: 32 }
  ),
  createFoldingCartonTemplate(
    'matchbox-carton',
    'Matchbox Style Sliding Carton',
    'Two-piece assembly consisting of an outer wrap sleeve and inner slide tray with finger thumb notches.',
    'Matches, USB drives, boutique jewelry, confectioneries.',
    'ECMA F10.20.01.01',
    'Intermediate',
    'sleeve',
    { w: 75, h: 50, d: 22 }
  ),
  createFoldingCartonTemplate(
    'sliding-sleeve-carton',
    'Sliding Sleeve Packaging Box',
    'Versatile outer sleeve dieline with micro-caliper allowance for effortless sliding action over inner rigid cores.',
    'Smartphone accessories, apparel socks, gift sets, stationery.',
    'ECMA F10.10.02.01',
    'Basic',
    'sleeve',
    { w: 120, h: 160, d: 40 }
  ),
  createFoldingCartonTemplate(
    'one-piece-tuck-box',
    'One Piece Tuck Top Box',
    'Single sheet carton with integrated folding lid and front closure tab, minimizing board wastage.',
    'Playing cards, business cards, tarot decks, flashcards.',
    'ECMA B10.20.01.01',
    'Basic',
    'ste',
    { w: 65, h: 92, d: 20 }
  ),
  createFoldingCartonTemplate(
    'full-overlap-carton',
    'Full Overlap Seal End Carton',
    'High-barrier seal end carton where outer top and bottom flaps overlap completely across the full depth for adhesive sealing.',
    'Cereal boxes, detergent powders, frozen meals, dry pasta.',
    'ECMA A10.20.01.01',
    'Basic',
    'ste',
    { w: 130, h: 190, d: 50 }
  ),
  createFoldingCartonTemplate(
    'half-slotted-carton',
    'Half Slotted Folding Carton',
    'Open-top carton with standard folding bottom closure, designed for open bin merchandising or separate slip-on lids.',
    'Bin storage, desk organizers, retail merchandise displays.',
    'ECMA A10.10.01.01',
    'Basic',
    'snap',
    { w: 80, h: 120, d: 80 }
  ),
  createFoldingCartonTemplate(
    'display-carton',
    'Counter Display Carton (Shelf Ready)',
    'Carton with perforated front tear-off panel that converts from transit packaging into a counter retail display.',
    'Energy bars, chewing gum, candy packs, cosmetic sachets.',
    'ECMA A20.30.02.01',
    'Intermediate',
    'window',
    { w: 90, h: 130, d: 60 }
  ),
  createFoldingCartonTemplate(
    'header-box',
    'Extended Header Retail Box',
    'Carton with solid billboard header for expanded marketing graphics and branding above the product compartment.',
    'Specialty consumer items, premium retail shelf products.',
    'ECMA A20.40.03.01',
    'Basic',
    'hanging',
    { w: 70, h: 120, d: 45 }
  ),
  createFoldingCartonTemplate(
    'octagonal-box',
    'Octagonal Prism Box',
    'Eight-sided geometric carton with multi-faceted visual appeal for ultra-luxury presentation.',
    'Premium spirits, luxury decanters, high-end gift sets.',
    'ECMA D20.30.01.01',
    'Advanced',
    'hex',
    { w: 35, h: 130 }
  ),
  createFoldingCartonTemplate(
    'square-carton',
    'Square Cube Folding Carton',
    'Equilateral cube carton with identical width, height, and depth for balanced minimalist presentation.',
    'Diffusers, scented cube candles, mugs, smart speakers.',
    'ECMA A20.20.01.05',
    'Basic',
    'ste',
    { w: 80, h: 80, d: 80 }
  ),
  createFoldingCartonTemplate(
    'rectangular-carton',
    'Rectangular Product Carton',
    'General-purpose packaging dieline with standard proportions optimized for standard pallet and shipping containers.',
    'Consumer electronics, small appliances, household tools.',
    'ECMA A20.20.01.06',
    'Basic',
    'ste',
    { w: 90, h: 150, d: 50 }
  ),
  createFoldingCartonTemplate(
    'small-product-carton',
    'Small Product / Sample Carton',
    'Compact dieline engineered with micro-tuck flaps to prevent paperboard tearing during small-scale assembly.',
    'Lip balms, perfume samples, memory cards, electronic chips.',
    'ECMA A20.20.01.07',
    'Basic',
    'ste',
    { w: 30, h: 65, d: 25 }
  ),
  createFoldingCartonTemplate(
    'book-style-carton',
    'Book Style Foldover Box',
    'Carton with hinged front cover mimicking a hardcover book spine, ideal for presentation and unboxing drama.',
    'Software boxes, luxury chocolate collections, gift editions.',
    'ECMA F30.20.01.01',
    'Intermediate',
    'drawer',
    { w: 120, h: 160, d: 30 }
  ),
  createFoldingCartonTemplate(
    'magnetic-style-box',
    'Magnetic Flap Style Box',
    'Folding carton structure with extended wrap flap engineered to house embedded neodymium magnets for snap closure.',
    'Luxury watches, couture jewelry, executive corporate gifts.',
    'ECMA F30.30.01.01',
    'Advanced',
    'drawer',
    { w: 130, h: 170, d: 40 }
  ),
  createFoldingCartonTemplate(
    'folding-gift-box',
    'Folding Gift Box with Ribbon Slits',
    'Elegant collapsible gift box with die-cut slits on closure flaps for threading satin ribbons.',
    'Bridal gifts, luxury fashion accessories, souvenir items.',
    'ECMA C20.10.01.01',
    'Intermediate',
    '4corner',
    { w: 150, h: 150, d: 60 }
  ),
  createFoldingCartonTemplate(
    'double-wall-tuck-top',
    'Double Wall Tuck Top Box',
    'Enhanced carton featuring double folded side walls providing exceptional stacking strength and edge crush resistance.',
    'Heavy glass bottles, ceramic wares, delicate collectibles.',
    'ECMA B20.10.01.01',
    'Intermediate',
    'ste',
    { w: 85, h: 140, d: 55 }
  ),
  createFoldingCartonTemplate(
    'five-panel-folder',
    'Five Panel Folder (FPF)',
    'Single sheet folder with 5 wrapping panels designed for flat long objects with quick glue seam or taping.',
    'Posters, rolled maps, umbrella packaging, fluorescent bulbs.',
    'FEFCO 0401 / ECMA',
    'Basic',
    'sleeve',
    { w: 70, h: 300, d: 70 }
  ),
  createFoldingCartonTemplate(
    'diagonal-tuck-carton',
    'Diagonal Asymmetric Tuck Carton',
    'Avant-garde retail carton with angled diagonal closure flap for dramatic retail differentiation.',
    'Trendy skincare, specialty confectioneries, craft spirits.',
    'ECMA D30.10.01.01',
    'Intermediate',
    'ste',
    { w: 65, h: 135, d: 45 }
  ),
];
