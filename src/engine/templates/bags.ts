import { DielineGeometry, DimensionValues, TechnicalSettings, TemplateDefinition } from '../../types/dieline';
import {
  createDimension,
  makeBounds,
  PathBuilder
} from '../geometry';

/**
 * Standard Luxury Euro-Tote Paper Shopping Bag
 * Features reinforced top turnover fold (with 4 punch holes for rope handles), side gussets, bottom glue flap
 */
function generateShoppingBag(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(120, dims.width || 240);
  const H = Math.max(150, dims.height || 300);
  const D = Math.max(60, (dims.depth as number) || 100);
  const topFold = Math.max(25, (dims.topFold as number) || 40); // turnover top fold
  const bottomFold = Math.max(35, (dims.bottomFold as number) || D * 0.7); // bottom envelope fold
  const sideGlue = Math.max(15, settings.glueFlapWidth || 20);

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  // Panels horizontally: [Side Glue: sideGlue] [Front: W] [Side Gusset 1: D] [Back: W] [Side Gusset 2: D]
  const x0 = 10;
  const xG = x0 + sideGlue;
  const xW1 = xG + W;
  const xD1 = xW1 + D;
  const xW2 = xD1 + W;
  const xTotal = xW2 + D;

  const y0 = 10;
  const yTopEdge = y0;
  const yTopCrease = yTopEdge + topFold;
  const yBottomCrease = yTopCrease + H;
  const yBottomEdge = yBottomCrease + bottomFold;

  // Outer cut rectangle
  cut.rect(xG, yTopEdge, xTotal - xG, yBottomEdge - yTopEdge);

  // Side glue tab
  cut.M(xG, yTopCrease).L(x0, yTopCrease + 10).L(x0, yBottomCrease - 10).L(xG, yBottomCrease);

  // 4 handle punch holes on Front and Back turnover top
  const holeR = 3;
  const holeY = yTopCrease - topFold * 0.45;
  const holeOffset = W * 0.25;

  const hole1 = new PathBuilder().circle(xG + holeOffset, holeY, holeR);
  const hole2 = new PathBuilder().circle(xW1 - holeOffset, holeY, holeR);
  const hole3 = new PathBuilder().circle(xD1 + holeOffset, holeY, holeR);
  const hole4 = new PathBuilder().circle(xW2 - holeOffset, holeY, holeR);
  cut.parts.push(hole1.toString(), hole2.toString(), hole3.toString(), hole4.toString());

  // CREASES:
  // Horizontal folds (top turnover fold & bottom fold)
  crease.line(xG, yTopCrease, xTotal, yTopCrease);
  crease.line(xG, yBottomCrease, xTotal, yBottomCrease);

  // Vertical panel creases
  crease.line(xG, yTopEdge, xG, yBottomEdge);
  crease.line(xW1, yTopEdge, xW1, yBottomEdge);
  crease.line(xD1, yTopEdge, xD1, yBottomEdge);
  crease.line(xW2, yTopEdge, xW2, yBottomEdge);

  // Side gusset central V-creases
  crease.line(xW1 + D / 2, yTopCrease, xW1 + D / 2, yBottomCrease);
  crease.line(xW2 + D / 2, yTopCrease, xW2 + D / 2, yBottomCrease);

  // Bottom triangular envelope diagonal creases
  crease.line(xW1, yBottomCrease, xW1 + D / 2, yBottomEdge);
  crease.line(xD1, yBottomCrease, xW1 + D / 2, yBottomEdge);
  crease.line(xW2, yBottomCrease, xW2 + D / 2, yBottomEdge);
  crease.line(xTotal, yBottomCrease, xW2 + D / 2, yBottomEdge);

  const dimensions = [
    createDimension('dim-w', xG, yBottomEdge + 14, xW1, yBottomEdge + 14, 'Face Width', W, 'horizontal'),
    createDimension('dim-h', xTotal + 14, yTopCrease, xTotal + 14, yBottomCrease, 'Bag Height', H, 'vertical'),
    createDimension('dim-d', xW1, yBottomEdge + 14, xD1, yBottomEdge + 14, 'Side Gusset Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(x0, yTopEdge, xTotal, yBottomEdge, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    glueFlapPaths: [`M ${x0} ${yTopCrease + 10} L ${xG} ${yTopCrease} L ${xG} ${yBottomCrease} L ${x0} ${yBottomCrease - 10} Z`],
    dimensions,
    annotations: [
      { x: xG + W / 2, y: yTopCrease + H / 2, text: 'BAG FRONT PANEL', role: 'panel-label' },
      { x: xD1 + W / 2, y: yTopCrease + H / 2, text: 'BAG BACK PANEL', role: 'panel-label' },
      { x: xW1 + D / 2, y: yTopCrease + H / 2, text: 'SIDE GUSSET', role: 'spec', fontSize: 8 },
      { x: xG + W / 2, y: yTopEdge + topFold / 2, text: 'TURNOVER TOP REINFORCEMENT', role: 'spec', fontSize: 7 },
    ],
  };
}

/**
 * SOS Grocery Bag (Self-Opening Square Bottom)
 */
function generateSOSBag(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(100, dims.width || 200);
  const H = Math.max(150, dims.height || 280);
  const D = Math.max(50, (dims.depth as number) || 90);
  const G = 15;
  const bottomFold = D * 0.8;

  const cut = new PathBuilder();
  const crease = new PathBuilder();

  const x0 = 10;
  const xG = x0 + G;
  const xW1 = xG + W;
  const xD1 = xW1 + D;
  const xW2 = xD1 + W;
  const xTotal = xW2 + D;

  const y0 = 10;
  const yTop = y0;
  const yBottomCrease = yTop + H;
  const yBottom = yBottomCrease + bottomFold;

  // Serrated thumb lip on top
  cut.rect(xG, yTop, xTotal - xG, yBottom - yTop);
  cut.M(xG, yTop).L(x0, yTop + 10).L(x0, yBottomCrease - 10).L(xG, yBottomCrease);

  // Creases:
  crease.line(xG, yBottomCrease, xTotal, yBottomCrease);
  crease.line(xG, yTop, xG, yBottom);
  crease.line(xW1, yTop, xW1, yBottom);
  crease.line(xD1, yTop, xD1, yBottom);
  crease.line(xW2, yTop, xW2, yBottom);

  // Center gusset fold
  crease.line(xW1 + D / 2, yTop, xW1 + D / 2, yBottomCrease);
  crease.line(xW2 + D / 2, yTop, xW2 + D / 2, yBottomCrease);

  // Bottom envelope score lines
  crease.line(xW1, yBottomCrease, xW1 + D / 2, yBottom);
  crease.line(xD1, yBottomCrease, xW1 + D / 2, yBottom);

  const dimensions = [
    createDimension('dim-w', xG, yBottom + 14, xW1, yBottom + 14, 'Width', W, 'horizontal'),
    createDimension('dim-h', xTotal + 14, yTop, xTotal + 14, yBottomCrease, 'Height', H, 'vertical'),
    createDimension('dim-d', xW1, yBottom + 14, xD1, yBottom + 14, 'Depth', D, 'horizontal'),
  ];

  return {
    bounds: makeBounds(x0, yTop, xTotal, yBottom, 15),
    cutPath: cut.toString(),
    creasePath: crease.toString(),
    dimensions,
    annotations: [
      { x: xG + W / 2, y: yTop + H / 2, text: 'SOS KRAFT BAG FRONT', role: 'panel-label' },
    ],
  };
}

/**
 * Wine Bottle Carrier Bag (Tall single bottle with reinforced turnover)
 */
function generateWineBag(dims: DimensionValues, settings: TechnicalSettings): DielineGeometry {
  const W = Math.max(80, dims.width || 110);
  const H = Math.max(250, dims.height || 360);
  const D = Math.max(70, (dims.depth as number) || 100);
  return generateShoppingBag({ ...dims, width: W, height: H, depth: D }, settings);
}

function createBagTemplate(
  id: string,
  name: string,
  desc: string,
  recUse: string,
  diff: 'Basic' | 'Intermediate' | 'Advanced',
  genType: 'euro' | 'sos' | 'wine',
  dimDefaults: { w: number; h: number; d: number }
): TemplateDefinition {
  let generator = generateShoppingBag;
  if (genType === 'sos') generator = generateSOSBag;
  else if (genType === 'wine') generator = generateWineBag;

  return {
    id,
    name,
    category: 'bags',
    categoryName: 'Bags',
    industryCode: 'RETAIL PAPER BAG STANDARDS',
    description: desc,
    recommendedUse: recUse,
    stockRecommendation: 'White or Brown Kraft Paper (120 - 200 gsm) or Art Paper with gloss/matte lamination.',
    difficulty: diff,
    dimensions: [
      { key: 'width', label: 'Face Width (W)', defaultVal: dimDefaults.w, minVal: 80, maxVal: 600, required: true },
      { key: 'height', label: 'Height (H)', defaultVal: dimDefaults.h, minVal: 100, maxVal: 800, required: true },
      { key: 'depth', label: 'Side Gusset Depth (D)', defaultVal: dimDefaults.d, minVal: 40, maxVal: 300, required: true },
    ],
    generator,
  };
}

export const bagTemplates: TemplateDefinition[] = [
  createBagTemplate(
    'paper-shopping-bag',
    'Luxury Euro-Tote Paper Shopping Bag',
    'Handmade luxury retail carrier bag with turnover top reinforcement, 4 eyelet holes for cotton rope handles, and side gussets.',
    'Boutique apparel, jewelry packaging, luxury footwear, gift retail.',
    'Intermediate',
    'euro',
    { w: 250, h: 320, d: 110 }
  ),
  createBagTemplate(
    'flat-paper-bag',
    'Flat Paper Merchandise Bag',
    'Simple pinch-bottom retail merchandise bag without side gussets, ideal for flat lightweight counter items.',
    'Greeting cards, postcards, cookies, stickers, pharmacy prescriptions.',
    'Basic',
    'sos',
    { w: 180, h: 250, d: 40 }
  ),
  createBagTemplate(
    'handle-shopping-bag',
    'Twisted Paper Handle Kraft Bag',
    'Machine-made automated retail shopping bag with interior patch glue plates for twisted paper cords.',
    'Department stores, supermarket takeout, bookshops, fashion chains.',
    'Basic',
    'sos',
    { w: 260, h: 350, d: 120 }
  ),
  createBagTemplate(
    'rope-handle-bag',
    'Rope Handle Boutique Bag',
    'Premium carrier bag with reinforced base cardboard insert and knotted satin rope handle drill holes.',
    'High-end designer fashion, perfume stores, gala gifts.',
    'Intermediate',
    'euro',
    { w: 300, h: 250, d: 100 }
  ),
  createBagTemplate(
    'folded-paper-bag',
    'Folded SOS Paper Grocery Bag',
    'Self-opening square bottom Kraft bag engineered with sharp rectangular base that stands upright unaided for rapid packing.',
    'Grocery markets, organic bulk food stores, bakeries.',
    'Basic',
    'sos',
    { w: 220, h: 320, d: 110 }
  ),
  createBagTemplate(
    'takeaway-paper-bag',
    'Food Delivery Takeaway Paper Bag',
    'Extra-wide base carrier bag designed to lay flat food container trays without tilting or spilling soup.',
    'Restaurant food delivery, catering trays, bakery boxes.',
    'Basic',
    'sos',
    { w: 280, h: 280, d: 160 }
  ),
  createBagTemplate(
    'gift-bag',
    'Premium Presentation Gift Bag',
    'Laminated artboard gift bag with die-cut ribbon slot on turnover top for decorative bow closure.',
    'Weddings, corporate promotions, anniversaries, jewelry sets.',
    'Intermediate',
    'euro',
    { w: 200, h: 260, d: 90 }
  ),
  createBagTemplate(
    'wine-bag',
    'Single Wine Bottle Carrier Bag',
    'Slender upright tote bag tailored for 750ml wine and champagne bottles with reinforced structural base card.',
    'Wineries, liquor stores, corporate holiday wine gifts.',
    'Basic',
    'wine',
    { w: 110, h: 360, d: 100 }
  ),
  createBagTemplate(
    'double-wine-bag',
    'Double Wine Bottle Carrier Bag',
    'Two-bottle wine carrier bag with interior dividing crease to prevent glass bottles from clinking during transport.',
    'Premium vintages, wine clubs, tasting room merchandise.',
    'Intermediate',
    'wine',
    { w: 200, h: 360, d: 100 }
  ),
  createBagTemplate(
    'small-retail-bag',
    'Small Counter Merchandise Bag',
    'Petite Kraft paper bag for point-of-sale impulse purchases and small boutique goods.',
    'Cosmetics, sunglasses, artisan chocolates, stationery.',
    'Basic',
    'sos',
    { w: 150, h: 200, d: 70 }
  ),
  createBagTemplate(
    'large-retail-bag',
    'Large Heavy-Duty Shopping Tote',
    'Spacious shopping bag engineered with heavyweight 230gsm art paper and cross-woven cord handles for winter coats.',
    'Winter jackets, denim jeans, homeware goods, electronics boxes.',
    'Intermediate',
    'euro',
    { w: 420, h: 380, d: 150 }
  ),
];
