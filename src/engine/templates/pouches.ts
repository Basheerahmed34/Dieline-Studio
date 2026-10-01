import { DielineGeometry, DimensionValues, TechnicalSettings, TemplateDefinition } from '../../types/dieline';
import {
  createDimension,
  createEuroSlotPath,
  makeBounds,
  PathBuilder
} from '../geometry';

/**
 * Standard Doypack Stand-Up Pouch with Bottom K-Seal / Oval Gusset
 */
function generateStandUpPouch(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(80, dims.width || 140);
  const H = Math.max(100, dims.height || 210);
  const gusset = Math.max(20, (dims.gusset as number) || (dims.depth as number) || 35);
  const seal = 8; // standard heat seal perimeter (mm)
  const zipDist = 25; // distance from top to zipper line

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Layout: Front face, Back face, and Bottom oval gusset insert
  const x0 = 10;
  const xFront = x0;
  const xBack = xFront + W + 15;
  const xGusset = xBack + W + 15;
  const totalX = xGusset + W;

  const y0 = 10;
  const yBottom = y0 + H;

  // Front face rectangle with top tear notches and rounded bottom corners
  cut.roundRect(xFront, y0, W, H, 4);
  // Back face rectangle
  cut.roundRect(xBack, y0, W, H, 4);
  // Bottom oval/lenticular gusset
  cut.ellipse(xGusset + W / 2, y0 + H / 2, W / 2 - 2, gusset);

  // Tear notch cuts on front and back
  cut.line(xFront, y0 + zipDist - 8, xFront + 3, y0 + zipDist - 8);
  cut.line(xFront + W - 3, y0 + zipDist - 8, xFront + W, y0 + zipDist - 8);
  cut.line(xBack, y0 + zipDist - 8, xBack + 3, y0 + zipDist - 8);
  cut.line(xBack + W - 3, y0 + zipDist - 8, xBack + W, y0 + zipDist - 8);

  // Creases / Seal boundary indicator lines:
  // Heat seal zones along left, right, and bottom margins
  crease.line(xFront + seal, y0, xFront + seal, yBottom);
  crease.line(xFront + W - seal, y0, xFront + W - seal, yBottom);
  crease.line(xFront, yBottom - seal, xFront + W, yBottom - seal);
  crease.line(xFront, y0 + seal, xFront + W, y0 + seal);

  // Zipper line
  crease.line(xFront + seal, y0 + zipDist, xFront + W - seal, y0 + zipDist);
  crease.line(xBack + seal, y0 + zipDist, xBack + W - seal, y0 + zipDist);

  // Back face seals
  crease.line(xBack + seal, y0, xBack + seal, yBottom);
  crease.line(xBack + W - seal, y0, xBack + W - seal, yBottom);
  crease.line(xBack, yBottom - seal, xBack + W, yBottom - seal);
  crease.line(xBack, y0 + seal, xBack + W, y0 + seal);

  // Center fold on bottom gusset
  crease.line(xGusset + 2, y0 + H / 2, xGusset + W - 2, y0 + H / 2);

  const dimensions = [
    createDimension('dim-w', xFront, yBottom + 14, xFront + W, yBottom + 14, 'Pouch Width', W, 'horizontal'),
    createDimension('dim-h', xFront - 14, y0, xFront - 14, yBottom, 'Pouch Height', H, 'vertical'),
    createDimension('dim-g', xGusset, y0 + H / 2 + gusset + 12, xGusset + W, y0 + H / 2 + gusset + 12, 'Bottom Gusset Depth', gusset * 2, 'horizontal'),
  ];

  return {
    bounds: makeBounds(x0, y0, totalX, yBottom, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: xFront + W / 2, y: y0 + H / 2, text: 'POUCH FRONT PANEL', role: 'panel-label' },
      { x: xBack + W / 2, y: y0 + H / 2, text: 'POUCH BACK PANEL', role: 'panel-label' },
      { x: xGusset + W / 2, y: y0 + H / 2 - gusset - 8, text: 'BOTTOM W-FOLD GUSSET', role: 'spec', fontSize: 8 },
      { x: xFront + W / 2, y: y0 + zipDist - 4, text: 'PRESS-TO-CLOSE ZIPPER', role: 'spec', fontSize: 7 },
    ],
  };
}

/**
 * Three Side Seal Flat Pouch (Sachet)
 */
function generateFlatPouch(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(50, dims.width || 100);
  const H = Math.max(60, dims.height || 140);
  const seal = 6;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  const x0 = 10;
  const xFront = x0;
  const xBack = xFront + W + 15;
  const totalX = xBack + W;
  const y0 = 10;
  const yBottom = y0 + H;

  cut.roundRect(xFront, y0, W, H, 2);
  cut.roundRect(xBack, y0, W, H, 2);

  // Tear notch
  cut.line(xFront, y0 + 15, xFront + 3, y0 + 15);
  cut.line(xFront + W - 3, y0 + 15, xFront + W, y0 + 15);

  // Seals on 3 sides
  crease.line(xFront + seal, y0, xFront + seal, yBottom);
  crease.line(xFront + W - seal, y0, xFront + W - seal, yBottom);
  crease.line(xFront, yBottom - seal, xFront + W, yBottom - seal);

  crease.line(xBack + seal, y0, xBack + seal, yBottom);
  crease.line(xBack + W - seal, y0, xBack + W - seal, yBottom);
  crease.line(xBack, yBottom - seal, xBack + W, yBottom - seal);

  const dimensions = [
    createDimension('dim-w', xFront, yBottom + 14, xFront + W, yBottom + 14, 'Width', W, 'horizontal'),
    createDimension('dim-h', xFront - 14, y0, xFront - 14, yBottom, 'Height', H, 'vertical'),
  ];

  return {
    bounds: makeBounds(x0, y0, totalX, yBottom, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: xFront + W / 2, y: y0 + H / 2, text: '3-SIDE SEAL SACHET FRONT', role: 'panel-label' },
      { x: xBack + W / 2, y: y0 + H / 2, text: 'SACHET BACK', role: 'panel-label' },
    ],
  };
}

/**
 * Center Fin Seal Pouch (Pillow Pouch / Flow Wrap)
 */
function generateCenterSealPouch(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(60, dims.width || 120);
  const H = Math.max(80, dims.height || 180);
  const finSeal = 15; // overlap fin seal along back

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // One continuous flat film sheet: [Left Fin 1/2] [Back Left 1/2] [Front W] [Back Right 1/2] [Right Fin 1/2]
  const halfW = W / 2;
  const x0 = 10;
  const xFin1 = x0 + finSeal;
  const xBackL = xFin1 + halfW;
  const xFront = xBackL + W;
  const xBackR = xFront + halfW;
  const xTotal = xBackR + finSeal;

  const y0 = 10;
  const yTopSeal = y0 + 15;
  const yBottomSeal = y0 + H - 15;
  const yBottom = y0 + H;

  cut.rect(x0, y0, xTotal - x0, H);

  // Top and bottom transverse heat seals
  crease.line(x0, yTopSeal, xTotal, yTopSeal);
  crease.line(x0, yBottomSeal, xTotal, yBottomSeal);

  // Vertical body fold lines
  crease.line(xFin1, y0, xFin1, yBottom);
  crease.line(xBackL, y0, xBackL, yBottom);
  crease.line(xFront, y0, xFront, yBottom);
  crease.line(xBackR, y0, xBackR, yBottom);

  const dimensions = [
    createDimension('dim-w', xBackL, yBottom + 14, xFront, yBottom + 14, 'Front Face Width', W, 'horizontal'),
    createDimension('dim-h', xTotal + 14, y0, xTotal + 14, yBottom, 'Pouch Height', H, 'vertical'),
  ];

  return {
    bounds: makeBounds(x0, y0, xTotal, yBottom, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: xBackL + W / 2, y: y0 + H / 2, text: 'FRONT FACE', role: 'panel-label' },
      { x: xFin1 + halfW / 2, y: y0 + H / 2, text: 'BACK LEFT', role: 'spec', fontSize: 8 },
      { x: xFront + halfW / 2, y: y0 + H / 2, text: 'BACK RIGHT', role: 'spec', fontSize: 8 },
      { x: x0 + finSeal / 2, y: y0 + H / 2, text: 'FIN SEAL', role: 'spec', fontSize: 7 },
    ],
  };
}

/**
 * Side Gusseted Coffee Pouch
 */
function generateSideGussetPouch(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(60, dims.width || 100);
  const H = Math.max(100, dims.height || 220);
  const gusset = Math.max(25, (dims.gusset as number) || (dims.depth as number) || 40);
  const finSeal = 12;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Panels: [Fin: finSeal] [Back L: W/2] [Gusset 1: gusset] [Front: W] [Gusset 2: gusset] [Back R: W/2]
  const halfW = W / 2;
  const x0 = 10;
  const x1 = x0 + finSeal;
  const x2 = x1 + halfW;
  const x3 = x2 + gusset;
  const x4 = x3 + W;
  const x5 = x4 + gusset;
  const xTotal = x5 + halfW;

  const y0 = 10;
  const yBottom = y0 + H;
  const yBottomSeal = yBottom - 20;

  cut.rect(x0, y0, xTotal - x0, H);

  // Bottom seal line
  crease.line(x0, yBottomSeal, xTotal, yBottomSeal);

  // Vertical panel creases
  crease.line(x1, y0, x1, yBottom);
  crease.line(x2, y0, x2, yBottom);
  crease.line(x3, y0, x3, yBottom);
  crease.line(x4, y0, x4, yBottom);
  crease.line(x5, y0, x5, yBottom);

  // Center V-crease inside gusset panels
  crease.line(x2 + gusset / 2, y0, x2 + gusset / 2, yBottom);
  crease.line(x4 + gusset / 2, y0, x4 + gusset / 2, yBottom);

  const dimensions = [
    createDimension('dim-w', x3, yBottom + 14, x4, yBottom + 14, 'Face Width', W, 'horizontal'),
    createDimension('dim-h', xTotal + 14, y0, xTotal + 14, yBottom, 'Pouch Height', H, 'vertical'),
    createDimension('dim-g', x2, yBottom + 14, x3, yBottom + 14, 'Side Gusset Depth', gusset, 'horizontal'),
  ];

  return {
    bounds: makeBounds(x0, y0, xTotal, yBottom, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: x3 + W / 2, y: y0 + H / 2, text: 'COFFEE POUCH FRONT', role: 'panel-label' },
      { x: x2 + gusset / 2, y: y0 + H / 2, text: 'SIDE GUSSET', role: 'spec', fontSize: 7 },
    ],
  };
}

function createPouchTemplate(
  id: string,
  name: string,
  desc: string,
  recUse: string,
  diff: 'Basic' | 'Intermediate' | 'Advanced',
  genType: 'standup' | 'flat' | 'center' | 'side-gusset',
  dimDefaults: { w: number; h: number; g?: number }
): TemplateDefinition {
  let generator = generateStandUpPouch;
  if (genType === 'flat') generator = generateFlatPouch;
  else if (genType === 'center') generator = generateCenterSealPouch;
  else if (genType === 'side-gusset') generator = generateSideGussetPouch;

  const dims = [
    { key: 'width', label: 'Face Width (W)', defaultVal: dimDefaults.w, minVal: 40, maxVal: 500, required: true },
    { key: 'height', label: 'Height (H)', defaultVal: dimDefaults.h, minVal: 50, maxVal: 800, required: true },
  ];
  if (dimDefaults.g !== undefined) {
    dims.push({ key: 'gusset', label: 'Gusset (G)', defaultVal: dimDefaults.g, minVal: 15, maxVal: 200, required: true });
  }

  return {
    id,
    name,
    category: 'pouches',
    categoryName: 'Pouches & Flexible Packaging',
    industryCode: 'FLEXIBLE PACKAGING (FPA)',
    description: desc,
    recommendedUse: recUse,
    stockRecommendation: 'Multi-layer barrier laminate film (PET/ALU/PE or Kraft/PLA bio-film, 80 - 150 microns).',
    difficulty: diff,
    dimensions: dims,
    generator,
  };
}

export const pouchTemplates: TemplateDefinition[] = [
  createPouchTemplate(
    'stand-up-pouch',
    'Stand Up Pouch (Doypack)',
    'Self-standing flexible pouch with bottom W-fold oval gusset and press-to-close zipper for superior retail shelf presence.',
    'Granola, coffee beans, pet treats, bath salts, beef jerky.',
    'Intermediate',
    'standup',
    { w: 140, h: 210, g: 35 }
  ),
  createPouchTemplate(
    'flat-pouch',
    'Flat Pouch (3-Side Seal)',
    'Economical flat sachet sealed on three sides with tear notch for single-serve portions or sample distributions.',
    'Protein powder samples, facial sheet masks, wipes, spices.',
    'Basic',
    'flat',
    { w: 100, h: 140 }
  ),
  createPouchTemplate(
    'three-side-seal-pouch',
    'Three Side Seal Barrier Sachet',
    'Hermetically sealed foil pouch providing maximum oxygen and moisture barrier protection for sensitive consumables.',
    'Pharmaceutical powders, active reagents, dehydrated foods.',
    'Basic',
    'flat',
    { w: 90, h: 130 }
  ),
  createPouchTemplate(
    'center-seal-pouch',
    'Center Fin Seal Pillow Pouch',
    'Classic vertical form-fill-seal (VFFS) bag with longitudinal back fin seal and horizontal end seals.',
    'Potato chips, snack pretzels, candies, frozen vegetables.',
    'Basic',
    'center',
    { w: 130, h: 200 }
  ),
  createPouchTemplate(
    'gusset-pouch',
    'Bottom Gusseted Pouch',
    'Expanding bottom gusset structure engineered to hold high volumetric density without bulging.',
    'Dry baking flour, sugar, seeds, trail mix.',
    'Intermediate',
    'standup',
    { w: 150, h: 230, g: 45 }
  ),
  createPouchTemplate(
    'side-gusset-pouch',
    'Side Gusseted Coffee Pouch',
    'Traditional coffee bag with folded side gussets that create a clean block-like profile when filled.',
    'Roasted whole coffee beans, specialty teas, dry pet kibble.',
    'Intermediate',
    'side-gusset',
    { w: 100, h: 240, g: 40 }
  ),
  createPouchTemplate(
    'quad-seal-pouch',
    'Quad Seal Box Pouch',
    'Four-corner sealed flat bottom pouch offering four completely flat graphic printable panels for maximum branding.',
    'Premium pet nutrition, specialty coffees, confectionery gift bags.',
    'Advanced',
    'side-gusset',
    { w: 120, h: 260, g: 50 }
  ),
  createPouchTemplate(
    'spout-pouch',
    'Spouted Liquid Pouch',
    'Pouch with corner-mounted welded plastic spout neck for clean reclosable dispensing of liquid contents.',
    'Energy gels, fruit purees, baby food, detergents, liquid soaps.',
    'Advanced',
    'standup',
    { w: 110, h: 170, g: 30 }
  ),
  createPouchTemplate(
    'zipper-pouch',
    'Resealable Zipper Pouch',
    'Heavy-duty barrier pouch equipped with airtight grip zipper and laser-scored tear nick for effortless consumer opening.',
    'Superfood powders, chia seeds, dried fruits, cannabis edibles.',
    'Intermediate',
    'standup',
    { w: 160, h: 220, g: 40 }
  ),
  createPouchTemplate(
    'kraft-pouch',
    'Natural Kraft Barrier Pouch',
    'Eco-conscious flexible pouch with exterior unbleached Kraft paper bonded to high-barrier biodegradable inner film.',
    'Organic herbal teas, organic loose grain, artisanal oats.',
    'Intermediate',
    'standup',
    { w: 130, h: 200, g: 35 }
  ),
  createPouchTemplate(
    'header-pouch',
    'Header Display Pouch with Peg Hole',
    'Flat barrier pouch with reinforced upper sealed header featuring a Sombrero / Euro punch slot for hanging displays.',
    'Phone screen protectors, fishing tackle, hardware fasteners.',
    'Basic',
    'flat',
    { w: 110, h: 180 }
  ),
  createPouchTemplate(
    'stick-pack-sachet',
    'Stick Pack Flexible Sachet',
    'Slender tubular sachet with high aspect ratio designed for pouring single-serving powder into standard water bottle necks.',
    'Electrolyte drink mixes, instant coffee sticks, collagen powders.',
    'Basic',
    'center',
    { w: 30, h: 130 }
  ),
];
