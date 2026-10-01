import { DielineGeometry, DimensionValues, TechnicalSettings, TemplateDefinition } from '../../types/dieline';
import {
  createDimension,
  createThumbNotchPath,
  makeBounds,
  PathBuilder
} from '../geometry';

/**
 * Clamshell Burger Box: One-piece clamshell with top and bottom trays and hinged back
 */
function generateBurgerBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(80, dims.width || 115);
  const L = Math.max(80, dims.height || 115);
  const D = Math.max(40, dims.depth || 65);
  const halfD = D / 2;
  const taper = 8; // slight taper for nesting

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Layout:
  // [Top Lid Tray (halfD walls)] - [Hinged Back Spine (halfD)] - [Bottom Base Tray (halfD walls)]
  const x0 = 10;
  const x1 = x0 + halfD;
  const x2 = x1 + W;
  const x3 = x2 + halfD;

  const y0 = 10;
  const y1 = y0 + halfD;
  const y2 = y1 + L; // Lid base
  const y3 = y2 + halfD; // Spine / hinge
  const y4 = y3 + L; // Bottom base
  const y5 = y4 + halfD; // Front flap

  // Outer cut with lock tabs on corners
  cut.rect(x1, y0, W, y5 - y0); // central column
  cut.rect(x0, y1, x3 - x0, L); // lid side wings
  cut.rect(x0, y3, x3 - x0, L); // base side wings

  // Front closure tuck tab
  const tabW = W * 0.4;
  cut.M(x1 + (W - tabW) / 2, y0)
    .L(x1 + (W - tabW) / 2 + 5, y0 - 10)
    .L(x1 + (W + tabW) / 2 - 5, y0 - 10)
    .L(x1 + (W + tabW) / 2, y0);

  // Creases:
  crease.rect(x1, y1, W, L); // lid base
  crease.rect(x1, y3, W, L); // bottom base
  crease.line(x1, y2, x2, y2); // hinge fold 1
  crease.line(x1, y3, x2, y3); // hinge fold 2

  // Diagonal corner fold creases for leak-proof folded corners
  crease.line(x1, y1, x0, y0);
  crease.line(x2, y1, x3, y0);
  crease.line(x1, y4, x0, y5);
  crease.line(x2, y4, x3, y5);

  const dimensions = [
    createDimension('dim-w', x1, y5 + 14, x2, y5 + 14, 'Width', W, 'horizontal'),
    createDimension('dim-l', x3 + 14, y3, x3 + 14, y4, 'Length', L, 'vertical'),
    createDimension('dim-d', x2, y5 + 14, x3, y5 + 14, 'Total Assembled Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(x0, y0 - 12, x3, y5, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: x1 + W / 2, y: y1 + L / 2, text: 'BURGER BOX TOP LID', role: 'panel-label' },
      { x: x1 + W / 2, y: y3 + L / 2, text: 'BURGER BOX BOTTOM BASE', role: 'panel-label' },
    ],
  };
}

/**
 * French Fry Scoop Box: Tapered scoop with curved front lip and fold-up bottom
 */
function generateFrenchFriesBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(60, dims.width || 85);
  const H = Math.max(80, dims.height || 120);
  const D = Math.max(30, dims.depth || 45);
  const G = 12;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Panels: [Glue Flap G] [Side D] [Back W] [Side D] [Front W]
  // Back is taller, front is lower with curved scoop lip
  const x0 = 10;
  const xG = x0 + G;
  const xD1 = xG + D;
  const xW1 = xD1 + W;
  const xD2 = xW1 + D;
  const xTotal = xD2 + W;

  const y0 = 10;
  const yBackTop = y0;
  const yFrontTop = y0 + H * 0.35; // lower front for scoop
  const yBottom = y0 + H;
  const bottomFlap = D * 0.85;

  // Cut contour
  cut.M(xG, yBackTop + 15).L(x0, yBackTop + 20).L(x0, yBottom - 5).L(xG, yBottom);

  // Bottom flaps
  cut.L(xG, yBottom + bottomFlap).L(xD1, yBottom + bottomFlap).L(xD1, yBottom);
  cut.L(xD1, yBottom + bottomFlap).L(xW1, yBottom + bottomFlap).L(xW1, yBottom);
  cut.L(xW1, yBottom + bottomFlap).L(xD2, yBottom + bottomFlap).L(xD2, yBottom);
  cut.L(xD2, yBottom + bottomFlap).L(xTotal, yBottom + bottomFlap).L(xTotal, yBottom);

  // Right edge
  cut.L(xTotal, yFrontTop);

  // Front scoop curved rim
  cut.Q(xD2 + W / 2, yFrontTop + 12, xD2, yFrontTop);

  // Side angled rim
  cut.L(xW1, yBackTop);

  // Back arched rim
  cut.Q(xD1 + W / 2, yBackTop - 15, xD1, yBackTop);

  // Left side angled rim
  cut.L(xG, yBackTop + 15);

  // Creases
  crease.line(xG, yBottom, xTotal, yBottom);
  crease.line(xG, yBackTop + 15, xG, yBottom);
  crease.line(xD1, yBackTop, xD1, yBottom);
  crease.line(xW1, yBackTop, xW1, yBottom);
  crease.line(xD2, yFrontTop, xD2, yBottom);

  const dimensions = [
    createDimension('dim-w', xD1, yBottom + bottomFlap + 14, xW1, yBottom + bottomFlap + 14, 'Width', W, 'horizontal'),
    createDimension('dim-h', xTotal + 14, yBackTop, xTotal + 14, yBottom, 'Back Height', H, 'vertical'),
    createDimension('dim-d', xG, yBottom + bottomFlap + 14, xD1, yBottom + bottomFlap + 14, 'Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(x0, yBackTop - 18, xTotal, yBottom + bottomFlap, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    glueFlapPaths: [`M ${x0} ${yBackTop + 20} L ${xG} ${yBackTop + 15} L ${xG} ${yBottom} L ${x0} ${yBottom - 5} Z`],
    dimensions,
    annotations: [
      { x: xD1 + W / 2, y: yBackTop + H / 2, text: 'SCOOP BACK', role: 'panel-label' },
      { x: xD2 + W / 2, y: yFrontTop + H / 2, text: 'SCOOP FRONT', role: 'panel-label' },
    ],
  };
}

/**
 * Handle Cake Box: Bakery box with interlocking carrying arch handle
 */
function generateHandleCakeBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(120, dims.width || 200);
  const L = Math.max(120, dims.height || 200);
  const D = Math.max(80, dims.depth || 140);
  const handleH = 50;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Layout: Base in center, 4 walls folding up, top flaps with handle arches
  const x0 = 10;
  const x1 = x0 + D;
  const x2 = x1 + W;
  const x3 = x2 + D;

  const y0 = 10;
  const y1 = y0 + handleH + D;
  const y2 = y1 + L;
  const y3 = y2 + D + handleH;

  // Outer cross layout
  cut.rect(x1, y0, W, y3 - y0); // vertical column with handle flaps
  cut.rect(x0, y1, x3 - x0, L); // horizontal side walls

  // Die-cut handle slot in top handle flaps
  const slotW = 55;
  const slotH = 16;
  const handleSlot1 = new PathBuilder().roundRect(x1 + (W - slotW) / 2, y0 + 12, slotW, slotH, 8);
  const handleSlot2 = new PathBuilder().roundRect(x1 + (W - slotW) / 2, y3 - 12 - slotH, slotW, slotH, 8);
  cut.parts.push(handleSlot1.toString(), handleSlot2.toString());

  // Creases:
  crease.rect(x1, y1, W, L); // cake box base
  crease.line(x1, y0 + handleH, x2, y0 + handleH); // top handle fold
  crease.line(x1, y3 - handleH, x2, y3 - handleH); // bottom handle fold

  // Side flap diagonal folds for web corners
  crease.line(x1, y1, x0, y1 - D * 0.8);
  crease.line(x2, y1, x3, y1 - D * 0.8);
  crease.line(x1, y2, x0, y2 + D * 0.8);
  crease.line(x2, y2, x3, y2 + D * 0.8);

  const dimensions = [
    createDimension('dim-w', x1, y3 + 14, x2, y3 + 14, 'Width', W, 'horizontal'),
    createDimension('dim-l', x3 + 14, y1, x3 + 14, y2, 'Length', L, 'vertical'),
    createDimension('dim-d', x2, y3 + 14, x3, y3 + 14, 'Box Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(x0, y0, x3, y3, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: x1 + W / 2, y: y1 + L / 2, text: 'CAKE BOX BASE', role: 'panel-label' },
      { x: x1 + W / 2, y: y0 + handleH / 2, text: 'CARRYING HANDLE', role: 'spec', fontSize: 9 },
    ],
  };
}

/**
 * Chinese Takeout / Noodle Box: Folded one-piece leakproof pail
 */
function generateNoodleBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(70, dims.width || 90);
  const H = Math.max(70, dims.height || 105);
  const D = Math.max(50, dims.depth || 70);

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // 4 panels + glue flap, with tapered base and folded web corners
  const G = 12;
  const x0 = 10;
  const xG = x0 + G;
  const xW1 = xG + W;
  const xD1 = xW1 + D;
  const xW2 = xD1 + W;
  const xTotal = xW2 + D;

  const y0 = 10;
  const yLidH = D * 0.7;
  const yTop = y0 + yLidH;
  const yBottom = yTop + H;
  const yBaseFlap = W * 0.6;

  // Cut contour
  cut.M(xG, yTop).L(x0, yTop + 5).L(x0, yBottom - 5).L(xG, yBottom);

  // Bottom interlocking flaps
  cut.L(xG, yBottom + yBaseFlap).L(xW1, yBottom + yBaseFlap).L(xW1, yBottom);
  cut.L(xW1, yBottom + yBaseFlap).L(xD1, yBottom + yBaseFlap).L(xD1, yBottom);
  cut.L(xD1, yBottom + yBaseFlap).L(xW2, yBottom + yBaseFlap).L(xW2, yBottom);
  cut.L(xW2, yBottom + yBaseFlap).L(xTotal, yBottom + yBaseFlap).L(xTotal, yBottom);

  // Right edge
  cut.L(xTotal, yTop);

  // Top overlapping closure flaps
  cut.L(xTotal - 5, y0).L(xW2 + 5, y0).L(xW2, yTop);
  cut.L(xW2 - 5, y0).L(xD1 + 5, y0).L(xD1, yTop);
  cut.L(xD1 - 5, y0).L(xW1 + 5, y0).L(xW1, yTop);
  cut.L(xW1 - 5, y0).L(xG + 5, y0).L(xG, yTop);

  // Creases
  crease.line(xG, yTop, xTotal, yTop);
  crease.line(xG, yBottom, xTotal, yBottom);
  crease.line(xG, yTop, xG, yBottom);
  crease.line(xW1, yTop, xW1, yBottom);
  crease.line(xD1, yTop, xD1, yBottom);
  crease.line(xW2, yTop, xW2, yBottom);

  const dimensions = [
    createDimension('dim-w', xG, yBottom + yBaseFlap + 14, xW1, yBottom + yBaseFlap + 14, 'Width', W, 'horizontal'),
    createDimension('dim-h', xTotal + 14, yTop, xTotal + 14, yBottom, 'Height', H, 'vertical'),
    createDimension('dim-d', xW1, yBottom + yBaseFlap + 14, xD1, yBottom + yBaseFlap + 14, 'Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(x0, y0, xTotal, yBottom + yBaseFlap, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: xG + W / 2, y: yTop + H / 2, text: 'NOODLE PAIL FRONT', role: 'panel-label' },
    ],
  };
}

/**
 * Single Pizza Slice Wedge Box
 */
function generatePizzaSliceBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(120, dims.width || 180); // Crust width
  const L = Math.max(140, dims.height || 220); // Length from tip to crust
  const D = Math.max(25, dims.depth || 35); // Box depth

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Wedge layout: triangular base, triangular lid, side walls
  const x0 = 10;
  const xMid = x0 + W / 2;
  const xRight = x0 + W;
  const y0 = 10;
  const yTip = y0 + L;
  const yWall = yTip + D;

  // Triangular base and side walls
  cut.M(xMid, y0).L(xRight + D, yTip).L(xRight, yWall).L(x0, yWall).L(x0 - D, yTip).Z();

  // Creases
  crease.M(xMid, y0).L(xRight, yTip).L(x0, yTip).Z();

  const dimensions = [
    createDimension('dim-w', x0, yWall + 14, xRight, yWall + 14, 'Crust Width', W, 'horizontal'),
    createDimension('dim-l', xRight + D + 14, y0, xRight + D + 14, yTip, 'Slice Length', L, 'vertical'),
  ];

  return {
    bounds: makeBounds(x0 - D, y0, xRight + D, yWall, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: xMid, y: y0 + L * 0.6, text: 'PIZZA SLICE WEDGE', role: 'panel-label' },
    ],
  };
}

/**
 * Cupcake Box with Multi-Hole Insert
 */
function generateCupcakeBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(100, dims.width || 180);
  const L = Math.max(100, dims.height || 180);
  const D = Math.max(60, dims.depth || 100);

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Base tray with 4-corner locks and separate cupcake insert holes
  const x0 = 10;
  const x1 = x0 + D;
  const x2 = x1 + W;
  const x3 = x2 + D;

  const y0 = 10;
  const y1 = y0 + D;
  const y2 = y1 + L;
  const y3 = y2 + D;

  cut.rect(x1, y0, W, y3 - y0);
  cut.rect(x0, y1, x3 - x0, L);

  // 4 circular cupcake apertures in insert area
  const holeR = Math.min(28, W * 0.16);
  const cx1 = x1 + W * 0.3;
  const cx2 = x1 + W * 0.7;
  const cy1 = y1 + L * 0.3;
  const cy2 = y1 + L * 0.7;

  cut.circle(cx1, cy1, holeR);
  cut.circle(cx2, cy1, holeR);
  cut.circle(cx1, cy2, holeR);
  cut.circle(cx2, cy2, holeR);

  crease.rect(x1, y1, W, L);

  const dimensions = [
    createDimension('dim-w', x1, y3 + 14, x2, y3 + 14, 'Width', W, 'horizontal'),
    createDimension('dim-l', x3 + 14, y1, x3 + 14, y2, 'Length', L, 'vertical'),
    createDimension('dim-d', x2, y3 + 14, x3, y3 + 14, 'Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(x0, y0, x3, y3, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: x1 + W / 2, y: y1 + L / 2, text: 'CUPCAKE HOLDER INSERT (4-HOLE)', role: 'panel-label' },
    ],
  };
}

function createFoodTemplate(
  id: string,
  name: string,
  desc: string,
  recUse: string,
  diff: 'Basic' | 'Intermediate' | 'Advanced',
  genType: 'burger' | 'fries' | 'cake' | 'noodle' | 'slice' | 'cupcake',
  dimDefaults: { w: number; h: number; d: number }
): TemplateDefinition {
  let generator = generateBurgerBox;
  if (genType === 'fries') generator = generateFrenchFriesBox;
  else if (genType === 'cake') generator = generateHandleCakeBox;
  else if (genType === 'noodle') generator = generateNoodleBox;
  else if (genType === 'slice') generator = generatePizzaSliceBox;
  else if (genType === 'cupcake') generator = generateCupcakeBox;

  return {
    id,
    name,
    category: 'food-packaging',
    categoryName: 'Food Packaging',
    industryCode: 'FOOD-GRADE ECMA/FEFCO',
    description: desc,
    recommendedUse: recUse,
    stockRecommendation: 'Food-safe virgin barrier paperboard or grease-resistant Kraft board (280 - 380 gsm).',
    difficulty: diff,
    dimensions: [
      { key: 'width', label: 'Width (W)', defaultVal: dimDefaults.w, minVal: 40, maxVal: 500, required: true },
      { key: 'height', label: 'Length / Height (L/H)', defaultVal: dimDefaults.h, minVal: 40, maxVal: 500, required: true },
      { key: 'depth', label: 'Depth (D)', defaultVal: dimDefaults.d, minVal: 15, maxVal: 300, required: true },
    ],
    generator,
  };
}

export const foodPackagingTemplates: TemplateDefinition[] = [
  createFoodTemplate(
    'bakery-box',
    'Bakery Box with Lock Corners',
    'Foldable one-piece bakery box engineered for pastries and baked goods with vapor-releasing corner slits.',
    'Croissants, cupcakes, artisan bread, tarts, cookies.',
    'Basic',
    'cake',
    { w: 180, h: 180, d: 80 }
  ),
  createFoodTemplate(
    'cake-box',
    'Handle Cake Box with Interlocking Arch',
    'Celebration cake carton with sturdy interlocking arch handles that eliminate the need for an external carrier bag.',
    'Birthday cakes, tiered cheesecakes, patisserie towers.',
    'Intermediate',
    'cake',
    { w: 220, h: 220, d: 150 }
  ),
  createFoodTemplate(
    'cupcake-box',
    'Cupcake Box with 4-Hole Insert',
    'Bakery carton featuring an internal suspended platform with 60mm diameter finger-notched retention holes.',
    'Muffins, frosted cupcakes, mini cheesecakes.',
    'Intermediate',
    'cupcake',
    { w: 180, h: 180, d: 90 }
  ),
  createFoodTemplate(
    'donut-box',
    'Donut Box with Flip Lid',
    'Shallow rectangular carton designed for single-layer arrangement of glazed donuts without frosting contact.',
    'Donuts, churros, cannoli, eclairs.',
    'Basic',
    'cake',
    { w: 260, h: 180, d: 65 }
  ),
  createFoodTemplate(
    'sweet-box',
    'Confectionery Sweet Box',
    'Food-grade presentation box with rolled edge double walls providing thermal insulation for fine sweets.',
    'Turkish delight, macarons, fudge, brittle.',
    'Basic',
    'cake',
    { w: 150, h: 150, d: 50 }
  ),
  createFoodTemplate(
    'chocolate-box',
    'Chocolate Truffle Box with Partition Grid',
    'Luxury confectionery carton designed to fit food-contact parchment cups and thermoformed cavities.',
    'Handmade artisan truffles, praline assortments, bonbons.',
    'Intermediate',
    'cake',
    { w: 160, h: 160, d: 40 }
  ),
  createFoodTemplate(
    'snack-box',
    'Takeaway Snack Box',
    'Grease-resistant folding container with ventilation flaps and quick tab closure for fast-casual dining.',
    'Chicken wings, onion rings, nachos, street food skewers.',
    'Basic',
    'burger',
    { w: 140, h: 120, d: 60 }
  ),
  createFoodTemplate(
    'takeaway-box',
    'Biodegradable Takeaway Box',
    'Leak-resistant one-piece food container with poly-coated or aqueous barrier lining.',
    'Rice bowls, curries, loaded fries, salads.',
    'Basic',
    'burger',
    { w: 160, h: 130, d: 65 }
  ),
  createFoodTemplate(
    'food-tray',
    'Open Food Serving Tray',
    'Collapsible shallow paperboard tray for immediate food consumption at festivals and food trucks.',
    'Hot dogs, loaded chips, sliders, churro bites.',
    'Basic',
    'burger',
    { w: 150, h: 100, d: 45 }
  ),
  createFoodTemplate(
    'burger-box',
    'Clamshell Burger Box',
    'Classic fast-food hinged clamshell with flanged front closure tab and grease-resistant folding corners.',
    'Gourmet hamburgers, chicken sandwiches, breakfast muffins.',
    'Basic',
    'burger',
    { w: 115, h: 115, d: 70 }
  ),
  createFoodTemplate(
    'french-fries-box',
    'French Fry Scoop Cup / Box',
    'Iconic fast-food fry carton with high curved back, low front access rim, and fast pop-open bottom.',
    'French fries, sweet potato wedges, churro sticks.',
    'Basic',
    'fries',
    { w: 85, h: 125, d: 45 }
  ),
  createFoodTemplate(
    'noodle-box',
    'Noodle Takeout Pail Box',
    'Traditional folded Chinese takeout carton designed to unfold into a convenient dining plate.',
    'Stir-fry noodles, fried rice, pasta bowls, ramen.',
    'Intermediate',
    'noodle',
    { w: 90, h: 110, d: 75 }
  ),
  createFoodTemplate(
    'pizza-slice-box',
    'Triangular Pizza Slice Box',
    'Wedge-shaped single-portion pizza dieline that keeps crust crispy while protecting topping moisture.',
    'Single-serve pizza slices, savory pies, quiches.',
    'Basic',
    'slice',
    { w: 190, h: 220, d: 35 }
  ),
  createFoodTemplate(
    'tea-box',
    'Tea Bag Dispenser Box',
    'Upright retail carton featuring a pre-perforated lower dispensing slot for individual sachet removal.',
    'Herbal tea bags, coffee pods, single-serve sweetener sachets.',
    'Intermediate',
    'noodle',
    { w: 80, h: 150, d: 70 }
  ),
  createFoodTemplate(
    'coffee-box',
    'Coffee Bean Bag Carton',
    'Structural outer box engineered to encapsulate flexible nitrogen-flushed coffee bean valve pouches.',
    'Specialty single-origin coffee beans, ground coffee bags.',
    'Basic',
    'burger',
    { w: 100, h: 170, d: 65 }
  ),
  createFoodTemplate(
    'sandwich-wedge-box',
    'Sandwich Wedge Clamshell Box',
    'Classic triangular sandwich pack with front-facing presentation angle.',
    'Deli sandwiches, club sandwiches, wraps.',
    'Basic',
    'slice',
    { w: 130, h: 130, d: 75 }
  ),
];
