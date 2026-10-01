import { DielineGeometry, DimensionValues, TechnicalSettings, TemplateDefinition } from '../../types/dieline';
import {
  createDimension,
  createRectangularSafeArea,
  makeBounds,
  PathBuilder
} from '../geometry';

/**
 * FEFCO 0427: Standard Roll End Tuck Top (RETT) Mailer Box
 * The classic e-commerce unboxing box with roll-over side walls and front tuck tabs
 */
function generateRollEndTuckTop(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(80, dims.width || 200);
  const L = Math.max(80, dims.height || 150);
  const D = Math.max(30, dims.depth || 50);

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // FEFCO 0427 Layout:
  // Central column: Top Lid (L) + Lid Tuck Flap (D * 0.8) on top, Back Wall (D), Bottom Base (L), Front Wall (D), Roll-over Front Flap (D * 0.9)
  // Left & Right: Side roll-over walls (D + D) + Dust Flaps on Back Wall and Front Wall
  const roll = D * 0.96; // roll-over inner wall height
  const lidTuck = Math.min(D * 0.8, 35);
  const earW = Math.min(D * 0.6, 25); // locking cherry ears

  // Coordinates
  const x0 = 10;
  const xLeftRoll = x0 + roll;
  const xLeftWall = xLeftRoll + D;
  const xBase = xLeftWall; // left boundary of main base
  const xRightWall = xBase + W;
  const xRightRoll = xRightWall + D;
  const xTotal = xRightRoll + roll;

  // Vertical sequence from bottom to top:
  // Front Roll Flap -> Front Wall -> Base (L) -> Back Wall (D) -> Lid (L) -> Lid Tuck Flap
  const y0 = 10;
  const yLidTuck = y0 + lidTuck;
  const yLid = yLidTuck + L;
  const yBackWall = yLid + D;
  const yBaseBottom = yBackWall + L;
  const yFrontWall = yBaseBottom + D;
  const yFrontRoll = yFrontWall + roll;

  // 1. Lid and Tuck Flap with Locking Ears
  cut.M(xBase + earW, y0)
    .L(xRightWall - earW, y0)
    .L(xRightWall, y0 + 10)
    .L(xRightWall, yLidTuck);

  // Lid side dust flaps or wings
  cut.L(xRightWall + earW, yLidTuck)
    .L(xRightWall + earW, yLid - 10)
    .L(xRightWall, yLid);

  // Back wall transition
  cut.L(xRightWall + D * 0.85, yLid)
    .L(xRightWall + D * 0.85, yBackWall)
    .L(xRightRoll + roll, yBackWall);

  // Right roll-over side wall
  cut.L(xRightRoll + roll, yBaseBottom)
    .L(xRightWall, yBaseBottom);

  // Front wall and front roll-over
  cut.L(xRightWall + D * 0.8, yBaseBottom)
    .L(xRightWall + D * 0.8, yFrontWall)
    .L(xRightWall, yFrontWall)
    .L(xRightWall, yFrontRoll)
    .L(xBase, yFrontRoll)
    .L(xBase, yFrontWall)
    .L(xBase - D * 0.8, yFrontWall)
    .L(xBase - D * 0.8, yBaseBottom)
    .L(xBase, yBaseBottom);

  // Left roll-over side wall
  cut.L(x0, yBaseBottom)
    .L(x0, yBackWall)
    .L(xLeftWall - D * 0.85, yBackWall)
    .L(xLeftWall - D * 0.85, yLid)
    .L(xLeftWall, yLid);

  // Left lid ear
  cut.L(xLeftWall - earW, yLid - 10)
    .L(xLeftWall - earW, yLidTuck)
    .L(xLeftWall, yLidTuck)
    .L(xBase, y0 + 10)
    .L(xBase + earW, y0);

  // Slots in base for locking ears
  const slotW = 14;
  const slotH = 4;
  const slot1 = new PathBuilder().rect(xLeftWall, yBaseBottom - slotW - 5, slotH, slotW);
  const slot2 = new PathBuilder().rect(xRightWall - slotH, yBaseBottom - slotW - 5, slotH, slotW);
  cut.parts.push(slot1.toString(), slot2.toString());

  // CREASES:
  // Horizontal folds
  crease.line(xBase, yLidTuck, xRightWall, yLidTuck);
  crease.line(xBase, yLid, xRightWall, yLid);
  crease.line(xBase, yBackWall, xRightWall, yBackWall);
  crease.line(xBase, yBaseBottom, xRightWall, yBaseBottom);
  crease.line(xBase, yFrontWall, xRightWall, yFrontWall);

  // Vertical folds for base and roll-over side walls
  crease.line(xLeftWall, yBackWall, xLeftWall, yBaseBottom);
  crease.line(xLeftRoll, yBackWall, xLeftRoll, yBaseBottom);
  crease.line(xRightWall, yBackWall, xRightWall, yBaseBottom);
  crease.line(xRightRoll, yBackWall, xRightRoll, yBaseBottom);

  // Creases for dust flaps
  crease.line(xBase, yLid, xLeftWall - earW, yLid);
  crease.line(xRightWall, yLid, xRightWall + earW, yLid);

  const dimensions = [
    createDimension('dim-w', xBase, yFrontRoll + 14, xRightWall, yFrontRoll + 14, 'Inside Width', W, 'horizontal'),
    createDimension('dim-l', xTotal + 15, yBackWall, xTotal + 15, yBaseBottom, 'Inside Length', L, 'vertical'),
    createDimension('dim-d', xRightWall, yFrontRoll + 14, xRightRoll, yFrontRoll + 14, 'Inside Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(x0, y0, xTotal, yFrontRoll, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    safeAreaPath: createRectangularSafeArea(xBase, yBackWall, W, L, settings.safeArea || 4),
    dimensions,
    annotations: [
      { x: xBase + W / 2, y: yBackWall + L / 2, text: 'BOTTOM BASE', role: 'panel-label' },
      { x: xBase + W / 2, y: yLidTuck + L / 2, text: 'TOP LID (UNBOXING DISPLAY)', role: 'panel-label' },
      { x: xBase + W / 2, y: yLid + D / 2, text: 'BACK WALL', role: 'spec', fontSize: 8 },
      { x: xBase + W / 2, y: yBaseBottom + D / 2, text: 'FRONT WALL', role: 'spec', fontSize: 8 },
    ],
  };
}

/**
 * FEFCO 0201: Standard Regular Slotted Carton (RSC) Shipping Box
 * The most widely used corrugated shipping box in global logistics
 */
function generateRegularSlottedCarton(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(100, dims.width || 300);
  const L = Math.max(100, dims.height || 400); // Length along horizontal
  const D = Math.max(80, dims.depth || 250); // Height of the assembled carton
  const G = Math.max(25, settings.glueFlapWidth || 35);
  const flapH = W / 2; // In standard RSC, top/bottom flaps meet in the center (W/2)

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Panels horizontally: [Glue: G] [Length: L] [Width: W] [Length: L] [Width: W]
  const x0 = 10;
  const xG = x0 + G;
  const xL1 = xG + L;
  const xW1 = xL1 + W;
  const xL2 = xW1 + L;
  const xTotal = xL2 + W;

  const y0 = 10;
  const yTopFlap = y0;
  const yBodyTop = yTopFlap + flapH;
  const yBodyBottom = yBodyTop + D;
  const yBottomFlap = yBodyBottom + flapH;

  // Outer cut path:
  // Glue flap
  cut.M(xG, yBodyTop).L(x0, yBodyTop + 10).L(x0, yBodyBottom - 10).L(xG, yBodyBottom);

  // Bottom flaps with standard slot cutouts (3-5mm slot width)
  const slot = 3;
  cut.L(xG, yBottomFlap).L(xL1 - slot, yBottomFlap).L(xL1 - slot, yBodyBottom).L(xL1 + slot, yBodyBottom);
  cut.L(xL1 + slot, yBottomFlap).L(xW1 - slot, yBottomFlap).L(xW1 - slot, yBodyBottom).L(xW1 + slot, yBodyBottom);
  cut.L(xW1 + slot, yBottomFlap).L(xL2 - slot, yBottomFlap).L(xL2 - slot, yBodyBottom).L(xL2 + slot, yBodyBottom);
  cut.L(xL2 + slot, yBottomFlap).L(xTotal, yBottomFlap).L(xTotal, yBodyTop);

  // Top flaps with slot cutouts
  cut.L(xL2 + slot, yBodyTop).L(xL2 + slot, yTopFlap).L(xL2 - slot, yTopFlap).L(xL2 - slot, yBodyTop);
  cut.L(xW1 + slot, yBodyTop).L(xW1 + slot, yTopFlap).L(xW1 - slot, yTopFlap).L(xW1 - slot, yBodyTop);
  cut.L(xL1 + slot, yBodyTop).L(xL1 + slot, yTopFlap).L(xL1 - slot, yTopFlap).L(xL1 - slot, yBodyTop);
  cut.L(xG, yTopFlap).L(xG, yBodyTop);

  // CREASES:
  // Horizontal fold lines across body top and bottom
  crease.line(xG, yBodyTop, xTotal, yBodyTop);
  crease.line(xG, yBodyBottom, xTotal, yBodyBottom);

  // Vertical panel creases
  crease.line(xG, yBodyTop, xG, yBodyBottom);
  crease.line(xL1, yBodyTop, xL1, yBodyBottom);
  crease.line(xW1, yBodyTop, xW1, yBodyBottom);
  crease.line(xL2, yBodyTop, xL2, yBodyBottom);

  const dimensions = [
    createDimension('dim-l', xG, yBottomFlap + 14, xL1, yBottomFlap + 14, 'Length (L)', L, 'horizontal'),
    createDimension('dim-w', xL1, yBottomFlap + 14, xW1, yBottomFlap + 14, 'Width (W)', W, 'horizontal'),
    createDimension('dim-d', xTotal + 16, yBodyTop, xTotal + 16, yBodyBottom, 'Height / Depth (H)', D, 'vertical'),
  ];

  return {
    bounds: makeBounds(x0, y0, xTotal, yBottomFlap, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    glueFlapPaths: [`M ${x0} ${yBodyTop + 10} L ${xG} ${yBodyTop} L ${xG} ${yBodyBottom} L ${x0} ${yBodyBottom - 10} Z`],
    dimensions,
    annotations: [
      { x: xG + L / 2, y: yBodyTop + D / 2, text: 'LONG SIDE (FRONT)', role: 'panel-label' },
      { x: xL1 + W / 2, y: yBodyTop + D / 2, text: 'SHORT SIDE', role: 'panel-label' },
      { x: xW1 + L / 2, y: yBodyTop + D / 2, text: 'LONG SIDE (BACK)', role: 'panel-label' },
      { x: xL2 + W / 2, y: yBodyTop + D / 2, text: 'SHORT SIDE', role: 'panel-label' },
      { x: x0 + G / 2, y: yBodyTop + D / 2, text: 'MANUFACTURER JOINT', role: 'spec', fontSize: 8 },
    ],
  };
}

/**
 * FEFCO 0426: Pizza Box style dieline with rollover edges and easy tuck
 */
function generatePizzaBox(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(150, dims.width || 300);
  const L = Math.max(150, dims.height || 300);
  const D = Math.max(25, dims.depth || 40);

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  const x0 = 10;
  const xBase = x0 + D;
  const xRight = xBase + W;
  const xTotal = xRight + D;

  const y0 = 10;
  const yLidTuck = y0 + D * 0.7;
  const yLid = yLidTuck + L;
  const yBack = yLid + D;
  const yBaseBottom = yBack + L;
  const yFront = yBaseBottom + D;

  // Cut contour
  cut.M(xBase + 15, y0).L(xRight - 15, y0).L(xRight, y0 + 10).L(xRight, yLid);
  // Lid side flaps
  cut.L(xTotal, yLid).L(xTotal, yBack).L(xRight, yBack);
  // Base side flaps
  cut.L(xTotal, yBack).L(xTotal, yBaseBottom).L(xRight, yBaseBottom);
  cut.L(xRight, yFront).L(xBase, yFront).L(xBase, yBaseBottom);
  cut.L(x0, yBaseBottom).L(x0, yBack).L(xBase, yBack);
  cut.L(x0, yBack).L(x0, yLid).L(xBase, yLid);
  cut.L(xBase, y0 + 10).Z();

  // Creases
  crease.rect(xBase, yBack, W, L); // Base
  crease.rect(xBase, yLidTuck, W, L); // Lid
  crease.line(xBase, yBack, xRight, yBack);
  crease.line(xBase, yLid, xRight, yLid);
  crease.line(xBase, yBaseBottom, xRight, yBaseBottom);
  crease.line(xBase, yLidTuck, xRight, yLidTuck);

  const dimensions = [
    createDimension('dim-w', xBase, yFront + 14, xRight, yFront + 14, 'Width', W, 'horizontal'),
    createDimension('dim-l', xTotal + 15, yBack, xTotal + 15, yBaseBottom, 'Length', L, 'vertical'),
    createDimension('dim-d', xRight, yFront + 14, xTotal, yFront + 14, 'Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(x0, y0, xTotal, yFront, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: xBase + W / 2, y: yBack + L / 2, text: 'PIZZA BOX BASE', role: 'panel-label' },
      { x: xBase + W / 2, y: yLidTuck + L / 2, text: 'PIZZA BOX LID', role: 'panel-label' },
    ],
  };
}

/**
 * FEFCO 0401: One-Piece Folder (OPF) for flat items, books, and prints
 */
function generateOnePieceFolder(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(100, dims.width || 240);
  const L = Math.max(100, dims.height || 320);
  const D = Math.max(15, dims.depth || 30);
  const flapW = Math.min(W * 0.45, 90);

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  const x0 = 10;
  const x1 = x0 + flapW;
  const x2 = x1 + D;
  const x3 = x2 + W;
  const x4 = x3 + D;
  const xTotal = x4 + flapW;

  const y0 = 10;
  const y1 = y0 + flapW;
  const y2 = y1 + D;
  const y3 = y2 + L;
  const y4 = y3 + D;
  const yTotal = y4 + flapW;

  // Cross shape with 4 folding wings
  cut.M(x2, y0).L(x3, y0).L(x3, y2).L(xTotal, y2).L(xTotal, y3).L(x3, y3);
  cut.L(x3, yTotal).L(x2, yTotal).L(x2, y3).L(x0, y3).L(x0, y2).L(x2, y2).Z();

  // Creases around central product base and double fold depth
  crease.rect(x2, y2, W, L); // base
  crease.line(x2, y1, x3, y1);
  crease.line(x2, y4, x3, y4);
  crease.line(x1, y2, x1, y3);
  crease.line(x4, y2, x4, y3);

  const dimensions = [
    createDimension('dim-w', x2, yTotal + 14, x3, yTotal + 14, 'Inside Width', W, 'horizontal'),
    createDimension('dim-l', xTotal + 15, y2, xTotal + 15, y3, 'Inside Length', L, 'vertical'),
    createDimension('dim-d', x3, yTotal + 14, x4, yTotal + 14, 'Variable Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(x0, y0, xTotal, yTotal, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: x2 + W / 2, y: y2 + L / 2, text: 'ONE PIECE FOLDER BASE', role: 'panel-label' },
    ],
  };
}

function createMailerTemplate(
  id: string,
  name: string,
  desc: string,
  recUse: string,
  code: string,
  diff: 'Basic' | 'Intermediate' | 'Advanced',
  genType: 'rett' | 'rsc' | 'pizza' | 'opf',
  dimDefaults: { w: number; h: number; d: number }
): TemplateDefinition {
  let generator = generateRollEndTuckTop;
  if (genType === 'rsc') generator = generateRegularSlottedCarton;
  else if (genType === 'pizza') generator = generatePizzaBox;
  else if (genType === 'opf') generator = generateOnePieceFolder;

  return {
    id,
    name,
    category: 'mailer-shipping',
    categoryName: 'Mailer & Shipping Boxes',
    industryCode: code,
    description: desc,
    recommendedUse: recUse,
    stockRecommendation: 'E-Flute or B-Flute Single Wall Corrugated Board (1.5mm - 3.0mm caliper).',
    difficulty: diff,
    dimensions: [
      { key: 'width', label: 'Inside Width (W)', defaultVal: dimDefaults.w, minVal: 50, maxVal: 1000, required: true },
      { key: 'height', label: 'Inside Length (L)', defaultVal: dimDefaults.h, minVal: 50, maxVal: 1000, required: true },
      { key: 'depth', label: 'Inside Depth (D)', defaultVal: dimDefaults.d, minVal: 15, maxVal: 600, required: true },
    ],
    generator,
  };
}

export const mailerShippingTemplates: TemplateDefinition[] = [
  createMailerTemplate(
    'roll-end-tuck-top',
    'Standard Mailer Box (Roll End Tuck Top)',
    'The gold-standard e-commerce shipping box. Features roll-over double side walls, dust flaps, and friction cherry locks for a premium unboxing experience.',
    'DTC e-commerce, beauty kits, apparel unboxing, electronics subscription boxes.',
    'FEFCO 0427',
    'Intermediate',
    'rett',
    { w: 220, h: 160, d: 60 }
  ),
  createMailerTemplate(
    'roll-end-mailer',
    'Roll End Mailer Box',
    'Self-locking corrugated mailer with folded double thickness on sides providing high stacking and crush resistance during parcel transit.',
    'Footwear, premium apparel, tech accessories, hardware kits.',
    'FEFCO 0427-B',
    'Intermediate',
    'rett',
    { w: 250, h: 200, d: 70 }
  ),
  createMailerTemplate(
    'self-locking-mailer',
    'Self Locking E-Commerce Mailer',
    'Zero-tape corrugated packaging solution featuring precision die-cut locking tabs that secure shut without external packing tape.',
    'Eco-friendly postal mailings, subscription fulfillment, direct brand delivery.',
    'FEFCO 0427-SL',
    'Intermediate',
    'rett',
    { w: 240, h: 180, d: 55 }
  ),
  createMailerTemplate(
    'postal-mailer',
    'Postal Mailer Box',
    'Streamlined postal box sized specifically to meet carrier dimensional weight guidelines (USPS Priority, Royal Mail Small Parcel, Deutsche Post).',
    'Books, cosmetics, jewelry, small retail goods.',
    'FEFCO 0421',
    'Basic',
    'rett',
    { w: 200, h: 140, d: 45 }
  ),
  createMailerTemplate(
    'regular-slotted-carton',
    'Regular Slotted Carton (RSC Shipping Box)',
    'The most economical and versatile shipping box in global logistics. All top and bottom flaps are equal length and meet precisely at the center for taping.',
    'Master shipping cases, bulk transport, freight cargo, warehouse storage.',
    'FEFCO 0201',
    'Basic',
    'rsc',
    { w: 300, h: 400, d: 250 }
  ),
  createMailerTemplate(
    'shipping-box',
    'Standard Corrugated Shipping Box',
    'Standard heavy-duty shipping container with standard manufacturer glue tab for automated casing and sealing lines.',
    'Electronics, kitchen appliances, wholesale goods, export logistics.',
    'FEFCO 0201-HD',
    'Basic',
    'rsc',
    { w: 350, h: 450, d: 300 }
  ),
  createMailerTemplate(
    'full-overlap-shipping-box',
    'Full Overlap Shipping Box (FOL)',
    'Heavy-duty shipping carton where outer flaps overlap completely across the full width, providing double top and bottom strength for heavy or fragile freight.',
    'Heavy machinery parts, dense hardware, fragile ceramics, long items.',
    'FEFCO 0203',
    'Basic',
    'rsc',
    { w: 280, h: 380, d: 220 }
  ),
  createMailerTemplate(
    'one-piece-mailer',
    'One Piece Folder Mailer (OPF)',
    'Single sheet cross-shaped die-cut folder that wraps tightly around flat rectangular products, creating rigid book-drop corner protection.',
    'Hardcover books, vinyl LP records, framed art prints, laptops.',
    'FEFCO 0401',
    'Basic',
    'opf',
    { w: 230, h: 310, d: 30 }
  ),
  createMailerTemplate(
    'bookfold-mailer',
    'Variable Depth Bookfold Mailer',
    'Corrugated bookfold mailer with multiple scored crease lines allowing variable packing depth depending on book thickness.',
    'Online bookstores, photo albums, document shipping, framed certificates.',
    'FEFCO 0402',
    'Basic',
    'opf',
    { w: 220, h: 280, d: 40 }
  ),
  createMailerTemplate(
    'pizza-box',
    'Corrugated Pizza Box',
    'Classic one-piece steam-vented takeout and postal box with low profile and fast roll-fold setup.',
    'Pizzas, flat pies, board games, apparel tee shirts, calendars.',
    'FEFCO 0426',
    'Basic',
    'pizza',
    { w: 320, h: 320, d: 45 }
  ),
  createMailerTemplate(
    'ecommerce-mailer',
    'E-Commerce Unboxing Mailer',
    'Premium corrugated unboxing box tailored for custom interior artwork printing and influencer unboxing videos.',
    'Luxury fashion brands, curated gift sets, sneaker drops.',
    'FEFCO 0427-PR',
    'Intermediate',
    'rett',
    { w: 280, h: 220, d: 80 }
  ),
  createMailerTemplate(
    'subscription-box',
    'Monthly Subscription Box',
    'Durable mailer box designed to withstand recurring transit while delivering clean presentation inside with interior fold flaps.',
    'Monthly snack clubs, grooming kits, craft boxes, pet treats.',
    'FEFCO 0427-SUB',
    'Intermediate',
    'rett',
    { w: 260, h: 190, d: 75 }
  ),
  createMailerTemplate(
    'small-shipping-box',
    'Small Parcel Shipping Box',
    'Compact corrugated shipping container optimized for single product shipments avoiding oversize shipping penalties.',
    'Mugs, scented candles, watches, glassware, cosmetics.',
    'FEFCO 0201-SM',
    'Basic',
    'rsc',
    { w: 180, h: 240, d: 150 }
  ),
  createMailerTemplate(
    'large-shipping-box',
    'Large Master Shipping Container',
    'High-volume outer shipper designed to pack multiple inner retail folding cartons for consolidated palletization.',
    'Wholesale distribution, retail replenishment, warehouse logistics.',
    'FEFCO 0201-LG',
    'Basic',
    'rsc',
    { w: 400, h: 600, d: 400 }
  ),
  createMailerTemplate(
    'product-mailer',
    'Branded Product Mailer Box',
    'Sleek e-commerce mailer featuring clean roll end edges that hide all corrugated fluting along the front opening rim.',
    'Direct-to-consumer tech gadgets, artisanal kitchenware, jewelry.',
    'FEFCO 0427-CL',
    'Intermediate',
    'rett',
    { w: 210, h: 170, d: 50 }
  ),
  createMailerTemplate(
    'end-loading-mailer',
    'End Loading Corrugated Mailer',
    'Tubular corrugated carton with tuck flap end closures for quick horizontal sliding insertion of long or slim products.',
    'Posters, textiles, keyboards, auto filters, lighting fixtures.',
    'FEFCO 0211',
    'Basic',
    'rsc',
    { w: 120, h: 500, d: 120 }
  ),
];
