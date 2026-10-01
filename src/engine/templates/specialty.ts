import { DielineGeometry, DimensionValues, TechnicalSettings, TemplateDefinition } from '../../types/dieline';
import {
  createDimension,
  makeBounds,
  PathBuilder
} from '../geometry';

/**
 * 4-Pack Beverage Carrier with central upright carrying handle
 */
function generateFourPackCarrier(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const cellW = Math.max(60, dims.width || 70); // Bottle diameter + clearance
  const cellH = Math.max(100, dims.height || 140); // Bottle body height
  const cellD = Math.max(60, dims.depth || 70);
  const handleH = 60;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Layout: 2x2 grid carrier folding from central handle spine
  const W = cellW * 2;
  const D = cellD * 2;
  const x0 = 10;
  const xW1 = x0 + cellW;
  const xW2 = xW1 + cellW;
  const xW3 = xW2 + cellW;
  const xTotal = xW3 + cellW;

  const y0 = 10;
  const yHandle = y0 + handleH;
  const yWall = yHandle + cellH;
  const yBase = yWall + cellD;

  // Outer cut
  cut.rect(x0, yHandle, xTotal - x0, cellH + cellD);

  // Central handle extension
  cut.rect(xW1, y0, cellW * 2, handleH);

  // Handle hand cutout slot
  const slotW = 60;
  const slotH = 18;
  const handleSlot = new PathBuilder().roundRect(xW1 + (cellW * 2 - slotW) / 2, y0 + 15, slotW, slotH, 9);
  cut.parts.push(handleSlot.toString());

  // Creases
  crease.line(x0, yHandle, xTotal, yHandle);
  crease.line(x0, yWall, xTotal, yWall);
  crease.line(xW1, yHandle, xW1, yBase);
  crease.line(xW2, yHandle, xW2, yBase);
  crease.line(xW3, yHandle, xW3, yBase);

  const dimensions = [
    createDimension('dim-w', x0, yBase + 14, xTotal, yBase + 14, 'Total Width (2 Cells)', W, 'horizontal'),
    createDimension('dim-h', xTotal + 14, yHandle, xTotal + 14, yWall, 'Pocket Height', cellH, 'vertical'),
    createDimension('dim-d', x0 - 14, yWall, x0 - 14, yBase, 'Base Depth', cellD, 'vertical'),
  ];

  return {
    bounds: makeBounds(x0, y0, xTotal, yBase, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: xW1 + cellW, y: y0 + handleH / 2, text: 'CENTER CARRYING HANDLE', role: 'panel-label' },
      { x: x0 + cellW, y: yHandle + cellH / 2, text: 'BOTTLE POCKET CELL 1', role: 'spec', fontSize: 8 },
      { x: xW2 + cellW, y: yHandle + cellH / 2, text: 'BOTTLE POCKET CELL 2', role: 'spec', fontSize: 8 },
    ],
  };
}

/**
 * Two-Pocket Presentation Folder with business card slits
 */
function generatePresentationFolder(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const panelW = Math.max(180, dims.width || 225); // fits 8.5x11 or A4 sheets
  const panelH = Math.max(250, dims.height || 310);
  const pocketH = Math.max(60, (dims.depth as number) || 100);
  const spine = 6; // expandable spine thickness
  const flapGlue = 15;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Panels: Left Cover, Spine, Right Cover, with bottom folding pockets on both covers
  const x0 = 10;
  const xLeftCover = x0;
  const xSpine1 = xLeftCover + panelW;
  const xSpine2 = xSpine1 + spine;
  const xRightCover = xSpine2 + panelW;
  const xTotal = xRightCover;

  const y0 = 10;
  const yCoverBottom = y0 + panelH;
  const yPocketBottom = yCoverBottom + pocketH;

  // Outer cut contour
  cut.rect(xLeftCover, y0, panelW, panelH);
  cut.rect(xSpine2, y0, panelW, panelH);
  // Spine top bridge
  cut.line(xSpine1, y0, xSpine2, y0);

  // Bottom pockets
  cut.rect(xLeftCover, yCoverBottom, panelW, pocketH);
  cut.rect(xSpine2, yCoverBottom, panelW, pocketH);

  // Business card die-cut slits in right pocket
  const cardSlitW = 55;
  const cardX = xSpine2 + panelW / 2 - cardSlitW / 2;
  const cardY = yCoverBottom + pocketH / 2;
  cut.line(cardX, cardY - 12, cardX + cardSlitW, cardY - 12);
  cut.line(cardX, cardY + 12, cardX + cardSlitW, cardY + 12);

  // CREASES:
  // Horizontal pocket fold line
  crease.line(xLeftCover, yCoverBottom, xSpine1, yCoverBottom);
  crease.line(xSpine2, yCoverBottom, xRightCover, yCoverBottom);

  // Vertical spine creases
  crease.line(xSpine1, y0, xSpine1, yCoverBottom);
  crease.line(xSpine2, y0, xSpine2, yCoverBottom);

  const dimensions = [
    createDimension('dim-w', xLeftCover, yPocketBottom + 14, xSpine1, yPocketBottom + 14, 'Cover Width', panelW, 'horizontal'),
    createDimension('dim-h', xTotal + 14, y0, xTotal + 14, yCoverBottom, 'Folder Height', panelH, 'vertical'),
    createDimension('dim-p', x0 - 14, yCoverBottom, x0 - 14, yPocketBottom, 'Pocket Depth', pocketH, 'vertical'),
  ];

  return {
    bounds: makeBounds(x0, y0, xTotal, yPocketBottom, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: xLeftCover + panelW / 2, y: y0 + panelH / 2, text: 'INSIDE LEFT COVER', role: 'panel-label' },
      { x: xSpine2 + panelW / 2, y: y0 + panelH / 2, text: 'INSIDE RIGHT COVER', role: 'panel-label' },
      { x: xLeftCover + panelW / 2, y: yCoverBottom + pocketH / 2, text: 'LEFT POCKET FLAP', role: 'spec', fontSize: 8 },
      { x: xSpine2 + panelW / 2, y: yCoverBottom + pocketH / 2, text: 'RIGHT POCKET (CARD SLITS)', role: 'spec', fontSize: 8 },
    ],
  };
}

/**
 * Counter Display Unit (CDU) with Header
 */
function generateCounterDisplayUnit(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(150, dims.width || 220);
  const L = Math.max(120, dims.height || 180);
  const D = Math.max(80, dims.depth || 120);
  const headerH = Math.max(60, 100);

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Layout: Display base tray with stepped angled sides and towering billboard header
  const x0 = 10;
  const x1 = x0 + D;
  const x2 = x1 + W;
  const x3 = x2 + D;

  const y0 = 10;
  const yHeader = y0 + headerH;
  const yBaseTop = yHeader + D;
  const yBaseBottom = yBaseTop + L;
  const yFrontLip = yBaseBottom + 35; // low front viewing lip

  // Outer cut
  cut.rect(x1, y0, W, yFrontLip - y0); // central column
  cut.rect(x0, yBaseTop, x3 - x0, L); // side walls

  // Creases:
  crease.rect(x1, yBaseTop, W, L); // product base area
  crease.line(x1, yHeader, x2, yHeader); // header fold

  const dimensions = [
    createDimension('dim-w', x1, yFrontLip + 14, x2, yFrontLip + 14, 'Display Width', W, 'horizontal'),
    createDimension('dim-l', x3 + 14, yBaseTop, x3 + 14, yBaseBottom, 'Product Bed Length', L, 'vertical'),
    createDimension('dim-h', x1 - 14, y0, x1 - 14, yHeader, 'Header Billboard Height', headerH, 'vertical'),
  ];

  return {
    bounds: makeBounds(x0, y0, x3, yFrontLip, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: x1 + W / 2, y: y0 + headerH / 2, text: 'POINT OF SALE HEADER BILLBOARD', role: 'panel-label' },
      { x: x1 + W / 2, y: yBaseTop + L / 2, text: 'PRODUCT DISPLAY BED', role: 'panel-label' },
    ],
  };
}

/**
 * Pyramid Gift Favor Box with Ribbon Peak Hole
 */
function generatePyramidBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const baseW = Math.max(40, dims.width || 70);
  const slantH = Math.max(50, dims.height || 90);
  const flapW = 12;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Central square base with 4 triangular faces radiating outward
  const x0 = 10;
  const xCenterL = x0 + slantH;
  const xCenterR = xCenterL + baseW;
  const xTotal = xCenterR + slantH;

  const y0 = 10;
  const yCenterT = y0 + slantH;
  const yCenterB = yCenterT + baseW;
  const yTotal = yCenterB + slantH;

  // Base crease
  crease.rect(xCenterL, yCenterT, baseW, baseW);

  // 4 triangular peaks
  // Top peak
  cut.M(xCenterL, yCenterT).L(xCenterL + baseW / 2, y0).L(xCenterR, yCenterT);
  // Right peak
  cut.L(xTotal, yCenterT + baseW / 2).L(xCenterR, yCenterB);
  // Bottom peak
  cut.L(xCenterL + baseW / 2, yTotal).L(xCenterL, yCenterB);
  // Left peak
  cut.L(x0, yCenterT + baseW / 2).Z();

  // Ribbon hole on each peak
  const holeR = 2.5;
  cut.circle(xCenterL + baseW / 2, y0 + 10, holeR);
  cut.circle(xTotal - 10, yCenterT + baseW / 2, holeR);
  cut.circle(xCenterL + baseW / 2, yTotal - 10, holeR);
  cut.circle(x0 + 10, yCenterT + baseW / 2, holeR);

  const dimensions = [
    createDimension('dim-b', xCenterL, yTotal + 14, xCenterR, yTotal + 14, 'Base Square Width', baseW, 'horizontal'),
    createDimension('dim-s', xCenterR + 14, yCenterT, xTotal, yCenterT + baseW / 2, 'Slant Height', slantH, 'aligned'),
  ];

  return {
    bounds: makeBounds(x0, y0, xTotal, yTotal, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: xCenterL + baseW / 2, y: yCenterT + baseW / 2, text: 'PYRAMID BASE', role: 'panel-label' },
    ],
  };
}

/**
 * Corrugated Cross Partition Matrix (Grid Divider for Bottles)
 */
function generatePartitionMatrix(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const cellW = Math.max(50, dims.width || 75);
  const cellH = Math.max(60, dims.height || 120);
  const numCells = 3;
  const totalL = cellW * numCells;
  const slotW = 4; // corrugated thickness
  const slotH = cellH / 2; // half-slot interlocking

  const cut = new PathBuilder();

  // Strip A
  const x0 = 10;
  const y0 = 10;
  cut.rect(x0, y0, totalL, cellH);

  // Slots in Strip A
  for (let i = 1; i < numCells; i++) {
    const sx = x0 + i * cellW - slotW / 2;
    cut.rect(sx, y0, slotW, slotH);
  }

  // Strip B (positioned below)
  const yB = y0 + cellH + 25;
  cut.rect(x0, yB, totalL, cellH);
  for (let i = 1; i < numCells; i++) {
    const sx = x0 + i * cellW - slotW / 2;
    cut.rect(sx, yB + cellH - slotH, slotW, slotH);
  }

  const dimensions = [
    createDimension('dim-l', x0, yB + cellH + 14, x0 + totalL, yB + cellH + 14, 'Divider Length', totalL, 'horizontal'),
    createDimension('dim-h', x0 + totalL + 14, y0, x0 + totalL + 14, y0 + cellH, 'Divider Height', cellH, 'vertical'),
  ];

  return {
    bounds: makeBounds(x0, y0, x0 + totalL, yB + cellH, 15),
    cutPath: cut.toString(),
    creasePath: '',
    dimensions,
    annotations: [
      { x: x0 + totalL / 2, y: y0 + cellH / 2 + 10, text: 'LONGITUDINAL PARTITION STRIP', role: 'panel-label' },
      { x: x0 + totalL / 2, y: yB + cellH / 2 - 10, text: 'TRANSVERSE PARTITION STRIP', role: 'panel-label' },
    ],
  };
}

function createSpecialtyTemplate(
  id: string,
  name: string,
  desc: string,
  recUse: string,
  diff: 'Basic' | 'Intermediate' | 'Advanced',
  genType: 'carrier' | 'folder' | 'cdu' | 'pyramid' | 'partition',
  dimDefaults: { w: number; h: number; d?: number }
): TemplateDefinition {
  let generator = generateFourPackCarrier;
  if (genType === 'folder') generator = generatePresentationFolder;
  else if (genType === 'cdu') generator = generateCounterDisplayUnit;
  else if (genType === 'pyramid') generator = generatePyramidBox;
  else if (genType === 'partition') generator = generatePartitionMatrix;

  const dims = [
    { key: 'width', label: 'Width (W)', defaultVal: dimDefaults.w, minVal: 30, maxVal: 600, required: true },
    { key: 'height', label: 'Height / Length (H)', defaultVal: dimDefaults.h, minVal: 30, maxVal: 800, required: true },
  ];
  if (dimDefaults.d !== undefined) {
    dims.push({ key: 'depth', label: 'Depth (D)', defaultVal: dimDefaults.d, minVal: 20, maxVal: 400, required: true });
  }

  return {
    id,
    name,
    category: 'specialty',
    categoryName: 'Specialty Packaging & Inserts',
    industryCode: 'SPECIALTY STRUCTURAL DESIGN',
    description: desc,
    recommendedUse: recUse,
    stockRecommendation: 'Carrier Kraft Board (350 - 450 gsm) or Heavyweight Coated Art Cardboard.',
    difficulty: diff,
    dimensions: dims,
    generator,
  };
}

export const specialtyTemplates: TemplateDefinition[] = [
  createSpecialtyTemplate(
    'bottle-carrier',
    '4-Pack Beverage Bottle Carrier',
    'Self-erecting beverage caddy with central vertical carrying handle designed for 12oz glass craft beer and cider bottles.',
    'Craft breweries, cideries, gourmet soda four-packs, cold brew coffees.',
    'Advanced',
    'carrier',
    { w: 70, h: 140, d: 70 }
  ),
  createSpecialtyTemplate(
    'can-carrier',
    '6-Pack Beverage Can Carrier',
    'Sturdy carrier caddy engineered to securely hug standard 330ml or 500ml beverage cans with center finger grip slots.',
    'Craft beer cans, seltzers, ready-to-drink cocktail six-packs.',
    'Advanced',
    'carrier',
    { w: 66, h: 125, d: 66 }
  ),
  createSpecialtyTemplate(
    'counter-display-box',
    'Counter Display Unit (CDU)',
    'Point-of-purchase counter display carton with high-impact advertising header board and shallow front merchandising lip.',
    'Lip balms, eye drops, snack bars, impulse retail checkout items.',
    'Intermediate',
    'cdu',
    { w: 220, h: 180, d: 120 }
  ),
  createSpecialtyTemplate(
    'presentation-folder',
    'Two-Pocket Presentation Folder',
    'Corporate presentation folder with dual internal document pockets, business card die-cut slits, and 6mm spine capacity.',
    'Sales proposals, corporate reports, conference kits, real estate portfolios.',
    'Basic',
    'folder',
    { w: 225, h: 310, d: 100 }
  ),
  createSpecialtyTemplate(
    'tri-fold-folder',
    'Tri-Fold Presentation Folder',
    'Three-panel expandable document folder offering vast internal graphic real estate and triple document flap capacity.',
    'Institutional portfolios, investment prospectuses, media kits.',
    'Intermediate',
    'folder',
    { w: 220, h: 305, d: 95 }
  ),
  createSpecialtyTemplate(
    'pyramid-box',
    'Pyramid Gift Favor Box',
    'Four-sided geometric pyramid with peak ribbon holes that cinch together to form an exquisite favor parcel.',
    'Wedding favors, fine candies, luxury perfume samples, jewelry.',
    'Basic',
    'pyramid',
    { w: 70, h: 85 }
  ),
  createSpecialtyTemplate(
    'divider-insert',
    'Corrugated Grid Partition Matrix',
    'Interlocking slot partition matrix dividing master shipping cases into isolated protective cells to prevent bottle impact.',
    'Wine shipments, olive oil bottles, ceramic jars, glassware.',
    'Basic',
    'partition',
    { w: 75, h: 140 }
  ),
  createSpecialtyTemplate(
    'corner-guard',
    'Corner Guard Edge Protector',
    'Triangular fold-up edge protector that wraps around pallet corners and fragile picture frames during transit.',
    'Framed artwork, furniture corners, glass table tops, appliances.',
    'Basic',
    'pyramid',
    { w: 80, h: 80 }
  ),
  createSpecialtyTemplate(
    'flyer-holder',
    'Countertop Brochure & Flyer Holder',
    'Angled tabletop literature dispenser designed to display tri-fold brochures and flyers cleanly at trade shows.',
    'Tourism brochures, restaurant menus, bank promotional flyers.',
    'Intermediate',
    'cdu',
    { w: 110, h: 160, d: 50 }
  ),
  createSpecialtyTemplate(
    'matchbox-velvet-tray',
    'Matchbox with Ring / Velvet Tray Insert',
    'Precision outer sliding sleeve paired with an internal die-cut foam/velvet slotted ring cushion platform.',
    'Engagement rings, cufflinks, USB tokens, boutique electronics.',
    'Intermediate',
    'folder',
    { w: 80, h: 55, d: 25 }
  ),
  createSpecialtyTemplate(
    'sleeve-with-insert',
    'Wrap Sleeve with Inner Partition Insert',
    'Outer paperboard sleeve combined with an interior multi-compartment slotted divider card.',
    'Macaron gift boxes, artisanal soap trios, golf ball packs.',
    'Intermediate',
    'cdu',
    { w: 140, h: 160, d: 45 }
  ),
  createSpecialtyTemplate(
    'cosmetic-insert',
    'Suspended Cosmetic Bottle Platform Insert',
    'Suspended paperboard die-cut insert that locks glass dropper bottles centrally away from outer impact walls.',
    'Luxury face oils, clinical serums, perfume spray bottles.',
    'Intermediate',
    'partition',
    { w: 65, h: 110 }
  ),
  createSpecialtyTemplate(
    'product-holder',
    'Easel Display Stand Card',
    'Self-standing fold-out easel strut display card for tabletop signage and product feature cards.',
    'Jewelry counters, museum signage, trade show product displays.',
    'Basic',
    'folder',
    { w: 150, h: 210, d: 60 }
  ),
  createSpecialtyTemplate(
    'cardboard-folder',
    'Document Pocket Folder with Tuck Clasp',
    'Single-piece die-cut document wallet with self-locking curved tuck tab closure, requiring no tape or staples.',
    'Medical records, university diplomas, architectural drawings.',
    'Basic',
    'folder',
    { w: 230, h: 320, d: 85 }
  ),
];
