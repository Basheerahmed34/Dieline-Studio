import { DielineGeometry, DimensionValues, TechnicalSettings, TemplateDefinition } from '../../types/dieline';
import {
  createDimension,
  createRectangularSafeArea,
  makeBounds,
  PathBuilder
} from '../geometry';

/**
 * Rectangular Label with optional rounded corners
 */
function generateRectangleLabel(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(10, dims.width || 90);
  const H = Math.max(10, dims.height || 50);
  const r = Math.max(0, (dims.radius as number) || 3);
  const safeMargin = settings.safeArea || 2.5;

  const cut = new PathBuilder();
  const safeP = new PathBuilder();

  const x0 = 10;
  const y0 = 10;

  if (r > 0) {
    cut.roundRect(x0, y0, W, H, r);
  } else {
    cut.rect(x0, y0, W, H);
  }

  safeP.roundRect(x0 + safeMargin, y0 + safeMargin, W - safeMargin * 2, H - safeMargin * 2, Math.max(0, r - 1));

  const dimensions = [
    createDimension('dim-w', x0, y0 + H + 12, x0 + W, y0 + H + 12, 'Label Width', W, 'horizontal'),
    createDimension('dim-h', x0 + W + 14, y0, x0 + W + 14, y0 + H, 'Label Height', H, 'vertical'),
  ];

  return {
    bounds: makeBounds(x0, y0, x0 + W, y0 + H, 15),
    cutPath: cut.toString(),
    creasePath: '',
    safeAreaPath: safeP.toString(),
    dimensions,
    annotations: [
      { x: x0 + W / 2, y: y0 + H / 2, text: 'PRODUCT LABEL DIE-LINE', role: 'panel-label' },
    ],
  };
}

/**
 * Circular Label with registration marks
 */
function generateCircleLabel(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const D = Math.max(15, dims.width || 60);
  const r = D / 2;
  const safeMargin = settings.safeArea || 2.5;

  const cut = new PathBuilder();
  const safeP = new PathBuilder();
  const crease = new PathBuilder();

  const cx = 10 + r;
  const cy = 10 + r;

  cut.circle(cx, cy, r);
  safeP.circle(cx, cy, Math.max(2, r - safeMargin));

  // Crosshair registration marks
  const regArm = 8;
  crease.line(cx - r - regArm, cy, cx - r + 3, cy);
  crease.line(cx + r - 3, cy, cx + r + regArm, cy);
  crease.line(cx, cy - r - regArm, cx, cy - r + 3);
  crease.line(cx, cy + r - 3, cx, cy + r + regArm);

  const dimensions = [
    createDimension('dim-d', cx - r, cy + r + 12, cx + r, cy + r + 12, 'Diameter', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(cx - r - regArm, cy - r - regArm, cx + r + regArm, cy + r + regArm, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    safeAreaPath: safeP.toString(),
    dimensions,
    annotations: [
      { x: cx, y: cy, text: 'ROUND LABEL (JAR / LID)', role: 'panel-label' },
    ],
  };
}

/**
 * Oval Label
 */
function generateOvalLabel(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(20, dims.width || 80);
  const H = Math.max(15, dims.height || 50);
  const rx = W / 2;
  const ry = H / 2;
  const safeMargin = settings.safeArea || 2.5;

  const cut = new PathBuilder();
  const safeP = new PathBuilder();

  const cx = 10 + rx;
  const cy = 10 + ry;

  cut.ellipse(cx, cy, rx, ry);
  safeP.ellipse(cx, cy, Math.max(2, rx - safeMargin), Math.max(2, ry - safeMargin));

  const dimensions = [
    createDimension('dim-w', cx - rx, cy + ry + 12, cx + rx, cy + ry + 12, 'Major Axis (W)', W, 'horizontal'),
    createDimension('dim-h', cx + rx + 14, cy - ry, cx + rx + 14, cy + ry, 'Minor Axis (H)', H, 'vertical'),
  ];

  return {
    bounds: makeBounds(cx - rx, cy - ry, cx + rx, cy + ry, 15),
    cutPath: cut.toString(),
    creasePath: '',
    safeAreaPath: safeP.toString(),
    dimensions,
    annotations: [
      { x: cx, y: cy, text: 'OVAL BOTTLE LABEL', role: 'panel-label' },
    ],
  };
}

/**
 * Wraparound Bottle Label with overlap seam
 */
function generateWraparoundLabel(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(80, dims.width || 215); // circumference + overlap
  const H = Math.max(20, dims.height || 90);
  const overlap = 15;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  const x0 = 10;
  const y0 = 10;

  cut.rect(x0, y0, W, H);
  // Indicator line for overlap glue seam
  crease.line(x0 + W - overlap, y0, x0 + W - overlap, y0 + H);

  const dimensions = [
    createDimension('dim-w', x0, y0 + H + 12, x0 + W, y0 + H + 12, 'Wrap Length (Circumference + Overlap)', W, 'horizontal'),
    createDimension('dim-h', x0 + W + 14, y0, x0 + W + 14, y0 + H, 'Label Height', H, 'vertical'),
  ];

  return {
    bounds: makeBounds(x0, y0, x0 + W, y0 + H, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: x0 + (W - overlap) / 2, y: y0 + H / 2, text: 'WRAPAROUND BOTTLE FACE', role: 'panel-label' },
      { x: x0 + W - overlap / 2, y: y0 + H / 2, text: 'OVERLAP', role: 'spec', fontSize: 7 },
    ],
  };
}

/**
 * Folded Hang Tag with eyelet hole
 */
function generateHangTag(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(30, dims.width || 50);
  const H = Math.max(40, dims.height || 90); // single panel height
  const holeD = 4;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  const x0 = 10;
  const y0 = 10;
  const totalH = H * 2;

  // Outer folded card with angled top corners
  const angle = 10;
  cut.M(x0 + angle, y0)
    .L(x0 + W - angle, y0)
    .L(x0 + W, y0 + angle)
    .L(x0 + W, y0 + totalH - angle)
    .L(x0 + W - angle, y0 + totalH)
    .L(x0 + angle, y0 + totalH)
    .L(x0, y0 + totalH - angle)
    .L(x0, y0 + angle)
    .Z();

  // Eyelet drill hole near top
  cut.circle(x0 + W / 2, y0 + 12, holeD / 2);
  // Matching hole on back panel
  cut.circle(x0 + W / 2, y0 + totalH - 12, holeD / 2);

  // Center fold score
  crease.line(x0, y0 + H, x0 + W, y0 + H);

  const dimensions = [
    createDimension('dim-w', x0, y0 + totalH + 12, x0 + W, y0 + totalH + 12, 'Tag Width', W, 'horizontal'),
    createDimension('dim-h', x0 + W + 14, y0, x0 + W + 14, y0 + H, 'Folded Height', H, 'vertical'),
  ];

  return {
    bounds: makeBounds(x0, y0, x0 + W, y0 + totalH, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: x0 + W / 2, y: y0 + H / 2, text: 'HANG TAG FRONT', role: 'panel-label' },
      { x: x0 + W / 2, y: y0 + H + H / 2, text: 'HANG TAG BACK', role: 'panel-label' },
    ],
  };
}

/**
 * Bottle Neck Collar / Ring Tag
 */
function generateBottleNeckTag(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(40, dims.width || 60);
  const H = Math.max(80, dims.height || 130);
  const ringD = 38; // standard wine bottle neck hole

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  const x0 = 10;
  const y0 = 10;

  // Teardrop / collar shape
  cut.roundRect(x0, y0, W, H, 8);

  // Neck hole near top
  cut.circle(x0 + W / 2, y0 + ringD / 2 + 12, ringD / 2);

  // Horizontal crease below hole for hanging angle
  crease.line(x0, y0 + ringD + 20, x0 + W, y0 + ringD + 20);

  const dimensions = [
    createDimension('dim-w', x0, y0 + H + 12, x0 + W, y0 + H + 12, 'Collar Width', W, 'horizontal'),
    createDimension('dim-h', x0 + W + 14, y0, x0 + W + 14, y0 + H, 'Collar Height', H, 'vertical'),
  ];

  return {
    bounds: makeBounds(x0, y0, x0 + W, y0 + H, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: x0 + W / 2, y: y0 + ringD + 20 + (H - ringD - 20) / 2, text: 'NECK TAG DISPLAY', role: 'panel-label' },
    ],
  };
}

function createLabelTemplate(
  id: string,
  name: string,
  desc: string,
  recUse: string,
  diff: 'Basic' | 'Intermediate' | 'Advanced',
  genType: 'rect' | 'circle' | 'oval' | 'wrap' | 'hang' | 'collar',
  dimDefaults: { w: number; h?: number; r?: number }
): TemplateDefinition {
  let generator = generateRectangleLabel;
  if (genType === 'circle') generator = generateCircleLabel;
  else if (genType === 'oval') generator = generateOvalLabel;
  else if (genType === 'wrap') generator = generateWraparoundLabel;
  else if (genType === 'hang') generator = generateHangTag;
  else if (genType === 'collar') generator = generateBottleNeckTag;

  const dims = [
    { key: 'width', label: genType === 'circle' ? 'Diameter (D)' : 'Width (W)', defaultVal: dimDefaults.w, minVal: 10, maxVal: 500, required: true },
  ];
  if (dimDefaults.h !== undefined && genType !== 'circle') {
    dims.push({ key: 'height', label: 'Height (H)', defaultVal: dimDefaults.h, minVal: 10, maxVal: 500, required: true });
  }
  if (dimDefaults.r !== undefined) {
    dims.push({ key: 'radius', label: 'Corner Radius (R)', defaultVal: dimDefaults.r, minVal: 0, maxVal: 50, required: false });
  }

  return {
    id,
    name,
    category: 'labels',
    categoryName: 'Labels & Tags',
    industryCode: 'FINAT DIE-CUT LABEL STANDARDS',
    description: desc,
    recommendedUse: recUse,
    stockRecommendation: 'Self-adhesive Semi-Gloss Paper, Synthetic Polypropylene (BOPP), or Textured Wine Stock.',
    difficulty: diff,
    dimensions: dims,
    generator,
  };
}

export const labelTemplates: TemplateDefinition[] = [
  createLabelTemplate(
    'rectangle-label',
    'Rectangle Product Label',
    'Standard cut-to-size rectangular self-adhesive label for container jars, cardboard boxes, and retail packaging.',
    'Cosmetic jars, shipping boxes, tins, food jars.',
    'Basic',
    'rect',
    { w: 90, h: 50, r: 0 }
  ),
  createLabelTemplate(
    'square-label',
    'Square Product Label',
    'Balanced square die-cut label with micro rounded corners for high-speed roll applicator dispensers.',
    'Candle tins, spice jars, coffee bags, gourmet honey.',
    'Basic',
    'rect',
    { w: 60, h: 60, r: 2 }
  ),
  createLabelTemplate(
    'rounded-rectangle-label',
    'Rounded Corner Die-Cut Label',
    'Self-adhesive pressure-sensitive label with radius corners that prevent edge lift during shipping and handling.',
    'Skincare bottles, beverage cans, health supplements.',
    'Basic',
    'rect',
    { w: 85, h: 55, r: 5 }
  ),
  createLabelTemplate(
    'circle-label',
    'Circular Jar Lid & Bottle Label',
    'Precision circular die-cut dieline with optical registration crosshair marks for automated rotary labelers.',
    'Jar lids, round cosmetic pots, sticker seals, beer caps.',
    'Basic',
    'circle',
    { w: 60 }
  ),
  createLabelTemplate(
    'oval-label',
    'Oval Cosmetic Bottle Label',
    'Smooth elliptical contour dieline tailored for tapered or contoured cosmetic squeeze tubes and lotion bottles.',
    'Shampoo bottles, hand creams, essential oil blends.',
    'Basic',
    'oval',
    { w: 80, h: 50 }
  ),
  createLabelTemplate(
    'bottle-label',
    'Wine / Spirits Bottle Label',
    'Classic vertical rectangular wine label proportioned to fit standard Bordeaux and Burgundy 750ml glass bottles.',
    'Wine bottles, whiskey decanters, olive oil bottles.',
    'Basic',
    'rect',
    { w: 90, h: 120, r: 2 }
  ),
  createLabelTemplate(
    'wraparound-label',
    'Full Wraparound Beverage Label',
    'Extended horizontal label with 15mm overlap allowance designed to wrap 360 degrees around cylinders.',
    'Water bottles, beer cans, soda bottles, aerosol sprays.',
    'Intermediate',
    'wrap',
    { w: 215, h: 90 }
  ),
  createLabelTemplate(
    'jar-label',
    'Apothecary Jar Label',
    'Wide rectangular label with subtle vintage arched or clipped borders for artisanal glass preserves.',
    'Jam jars, pickled foods, apothecary tinctures.',
    'Basic',
    'rect',
    { w: 110, h: 45, r: 3 }
  ),
  createLabelTemplate(
    'tube-label',
    'Flexible Squeeze Tube Label',
    'Polyolefin label dieline with heat-seal crimp allowance along the top edge for cosmetic tubes.',
    'Toothpaste tubes, sunscreen creams, cosmetic lotions.',
    'Basic',
    'rect',
    { w: 95, h: 110, r: 2 }
  ),
  createLabelTemplate(
    'hang-tag',
    'Folded Apparel Hang Tag',
    'Bi-fold presentation swing tag with reinforced 4mm drill hole for eyelets and string attachment.',
    'Clothing garments, artisan crafts, luxury luggage, umbrellas.',
    'Basic',
    'hang',
    { w: 50, h: 90 }
  ),
  createLabelTemplate(
    'bottle-neck-tag',
    'Bottle Neck Collar Promotion Tag',
    'Retail collar tag with 38mm neck aperture that hangs gracefully around wine and liquor bottle bottlenecks.',
    'Medal award announcements, recipe booklets, discount coupons.',
    'Intermediate',
    'collar',
    { w: 60, h: 130 }
  ),
];
