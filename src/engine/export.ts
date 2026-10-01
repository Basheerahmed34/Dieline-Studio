import { jsPDF } from 'jspdf';
import {
  DielineGeometry,
  DimensionValues,
  LayerVisibility,
  TechnicalSettings,
  TemplateDefinition,
  Unit
} from '../types/dieline';
import { formatMeasurement } from './geometry';

export interface ExportOptions {
  includeDimensions: boolean;
  includeBleed: boolean;
  includeSafeArea: boolean;
  includeGlueArea: boolean;
  includeAnnotations: boolean;
  paperSize: 'actual' | 'A4' | 'A3' | 'A2' | 'A1' | '12x18';
  orientation: 'auto' | 'portrait' | 'landscape';
  unit: Unit;
}

export const PAPER_SIZES_MM: Record<string, { w: number; h: number; name: string }> = {
  A4: { w: 210, h: 297, name: 'A4 (210 × 297 mm)' },
  A3: { w: 297, h: 420, name: 'A3 (297 × 420 mm)' },
  A2: { w: 420, h: 594, name: 'A2 (420 × 594 mm)' },
  A1: { w: 594, h: 841, name: 'A1 (594 × 841 mm)' },
  '12x18': { w: 304.8, h: 457.2, name: 'Digital Press (12 × 18 in)' },
};

/**
 * Generates an Illustrator-compatible clean SVG file
 */
export function generateSvgString(
  template: TemplateDefinition,
  geometry: DielineGeometry,
  dims: DimensionValues,
  settings: TechnicalSettings,
  options: Partial<ExportOptions> = {}
): string {
  const { bounds } = geometry;
  const margin = 10;
  const minX = bounds.minX - margin;
  const minY = bounds.minY - margin;
  const widthMm = bounds.width + margin * 2;
  const heightMm = bounds.height + margin * 2;

  const includeDim = options.includeDimensions ?? true;
  const includeBleed = options.includeBleed ?? true;
  const includeSafe = options.includeSafeArea ?? true;
  const includeGlue = options.includeGlueArea ?? true;
  const includeNotes = options.includeAnnotations ?? true;

  // Professional packaging CAD color definitions (Blue, Yellow, and Precision Cut theme)
  const isBlueYellowWhite = settings.colorScheme === 'blue-yellow-white' || settings.colorScheme === undefined || true;

  const cutColor = isBlueYellowWhite ? '#0F172A' : '#E11D48'; // Solid Cut Line (Illustrator / CAD vector)
  const creaseColor = '#EAB308'; // Dashed Yellow (Fold / Crease Score Lines)
  const bleedColor = '#2563EB'; // Royal Blue Bleed Boundary ("Bless Area")
  const safeColor = '#60A5FA'; // Soft Blue Safe Margins
  const glueColor = 'rgba(234, 179, 8, 0.25)'; // Yellow Tint
  const dimColor = '#1E293B'; // Technical Slate

  let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink" 
     version="1.1" 
     width="${widthMm.toFixed(2)}mm" 
     height="${heightMm.toFixed(2)}mm" 
     viewBox="${minX.toFixed(2)} ${minY.toFixed(2)} ${widthMm.toFixed(2)} ${heightMm.toFixed(2)}">
  <desc>Generated with Dieline Studio - ${template.name} (${template.industryCode || 'ECMA/FEFCO'})</desc>
  <defs>
    <pattern id="glue-hatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="6" stroke="#EAB308" stroke-width="1" />
    </pattern>
    <marker id="dim-arrow-start" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 5 L 8 2 L 6 5 L 8 8 z" fill="${dimColor}" />
    </marker>
    <marker id="dim-arrow-end" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 2 L 8 5 L 0 8 L 2 5 z" fill="${dimColor}" />
    </marker>
  </defs>
`;

  // 1. Bleed Layer
  if (includeBleed && geometry.bleedPath) {
    svg += `  <g id="layer-bleed" fill="none" stroke="${bleedColor}" stroke-width="0.3" stroke-dasharray="2,2" opacity="0.8">
    <path d="${geometry.bleedPath}" />
  </g>\n`;
  }

  // 2. Safe Area Layer
  if (includeSafe && geometry.safeAreaPath) {
    svg += `  <g id="layer-safe-area" fill="none" stroke="${safeColor}" stroke-width="0.25" stroke-dasharray="1.5,1.5" opacity="0.6">
    <path d="${geometry.safeAreaPath}" />
  </g>\n`;
  }

  // 3. Glue Flaps Layer
  if (includeGlue && geometry.glueFlapPaths && geometry.glueFlapPaths.length > 0) {
    svg += `  <g id="layer-glue-flaps" fill="url(#glue-hatch)" stroke="#EAB308" stroke-width="0.3">
`;
    for (const p of geometry.glueFlapPaths) {
      svg += `    <path d="${p}" />\n`;
    }
    svg += `  </g>\n`;
  }

  // 4. Crease Lines Layer (Score)
  if (geometry.creasePath) {
    svg += `  <g id="layer-crease" fill="none" stroke="${creaseColor}" stroke-width="0.4" stroke-dasharray="3,2">
    <path d="${geometry.creasePath}" />
  </g>\n`;
  }

  // 5. Cut Lines Layer (Through-cut)
  if (geometry.cutPath) {
    svg += `  <g id="layer-cut" fill="none" stroke="${cutColor}" stroke-width="0.5">
    <path d="${geometry.cutPath}" />
  </g>\n`;
  }

  // 6. Dimensions Layer
  if (includeDim && geometry.dimensions.length > 0) {
    svg += `  <g id="layer-dimensions" font-family="'JetBrains Mono', 'Courier New', monospace" font-size="3.5" fill="${dimColor}" stroke="${dimColor}">\n`;
    for (const d of geometry.dimensions) {
      svg += `    <!-- Dim: ${d.label} -->\n`;
      svg += `    <line x1="${d.x1}" y1="${d.y1}" x2="${d.x2}" y2="${d.y2}" stroke="${dimColor}" stroke-width="0.25" marker-start="url(#dim-arrow-start)" marker-end="url(#dim-arrow-end)" />\n`;
      const midX = (d.x1 + d.x2) / 2;
      const midY = (d.y1 + d.y2) / 2 - 1.5;
      svg += `    <text x="${midX.toFixed(2)}" y="${midY.toFixed(2)}" text-anchor="middle" stroke="none">${d.label}: ${d.valueMm.toFixed(1)}mm</text>\n`;
    }
    svg += `  </g>\n`;
  }

  // 7. Annotations Layer
  if (includeNotes && geometry.annotations.length > 0) {
    svg += `  <g id="layer-annotations" font-family="'Plus Jakarta Sans', sans-serif" font-size="3" fill="#64748B">\n`;
    for (const a of geometry.annotations) {
      const fSize = a.fontSize || 3.2;
      svg += `    <text x="${a.x.toFixed(2)}" y="${a.y.toFixed(2)}" text-anchor="middle" font-size="${fSize}">${a.text}</text>\n`;
    }
    svg += `  </g>\n`;
  }

  svg += `</svg>`;
  return svg;
}

/**
 * Generates and downloads a clean SVG file to the client
 */
export function downloadSvgFile(
  template: TemplateDefinition,
  geometry: DielineGeometry,
  dims: DimensionValues,
  settings: TechnicalSettings,
  unit: Unit,
  options: Partial<ExportOptions> = {}
) {
  const svgData = generateSvgString(template, geometry, dims, settings, options);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const dimParts = Object.entries(dims)
    .map(([_, v]) => Math.round(v))
    .join('x');
  const filename = `${template.id}_${dimParts}mm.svg`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a true vector PDF file using jsPDF
 */
export function downloadPdfFile(
  template: TemplateDefinition,
  geometry: DielineGeometry,
  dims: DimensionValues,
  settings: TechnicalSettings,
  unit: Unit,
  options: Partial<ExportOptions> = {}
) {
  const paper = options.paperSize || 'actual';
  const { bounds } = geometry;
  const padding = 15;

  let pageW = bounds.width + padding * 2;
  let pageH = bounds.height + padding * 2;
  let orientation: 'portrait' | 'landscape' = pageW > pageH ? 'landscape' : 'portrait';

  if (paper !== 'actual' && PAPER_SIZES_MM[paper]) {
    const std = PAPER_SIZES_MM[paper];
    pageW = std.w;
    pageH = std.h;
    if (bounds.width > bounds.height && pageW < pageH) {
      // Rotate paper to landscape if dieline is wider
      pageW = std.h;
      pageH = std.w;
      orientation = 'landscape';
    }
  }

  // Create document in millimeters
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: [pageW, pageH],
  });

  // Calculate placement offset to center dieline on page
  const offsetX = (pageW - bounds.width) / 2 - bounds.minX;
  const offsetY = (pageH - bounds.height) / 2 - bounds.minY;

  // Title Block Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(`DIELINE STUDIO — ${template.name.toUpperCase()}`, 12, 10);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const dimStr = Object.entries(dims)
    .map(([k, v]) => `${k.toUpperCase()}: ${formatMeasurement(v, unit)}`)
    .join('  |  ');
  doc.text(`${template.industryCode || 'ECMA/FEFCO'}  |  ${dimStr}  |  BLEED: ${settings.bleed}mm  |  BOARD: ${settings.caliper}mm`, 12, 14);

  // Technical lines drawing
  // Draw Bleed Boundary ("Bless Area" - Blue)
  if (options.includeBleed !== false && geometry.bleedPath) {
    doc.setDrawColor(37, 99, 235); // Royal Blue
    doc.setLineWidth(0.25);
    doc.setLineDashPattern([2, 2], 0);
    drawSvgPathToJsPdf(doc, geometry.bleedPath, offsetX, offsetY);
  }

  // Draw Crease Lines (Dashed Yellow / Score)
  if (geometry.creasePath) {
    doc.setDrawColor(234, 179, 8); // Vibrant Yellow / Score
    doc.setLineWidth(0.4);
    doc.setLineDashPattern([2.5, 1.5], 0);
    // Draw directly from SVG path commands
    drawSvgPathToJsPdf(doc, geometry.creasePath, offsetX, offsetY);
  }

  // Draw Cut Lines (Solid Die Cut)
  if (geometry.cutPath) {
    doc.setDrawColor(15, 23, 42); // Solid Black / Dark Cut
    doc.setLineWidth(0.5);
    doc.setLineDashPattern([], 0); // Solid
    drawSvgPathToJsPdf(doc, geometry.cutPath, offsetX, offsetY);
  }

  // Dimensions
  if (options.includeDimensions !== false && geometry.dimensions.length > 0) {
    doc.setFont('Courier', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([], 0);

    for (const d of geometry.dimensions) {
      const x1 = d.x1 + offsetX;
      const y1 = d.y1 + offsetY;
      const x2 = d.x2 + offsetX;
      const y2 = d.y2 + offsetY;
      doc.line(x1, y1, x2, y2);
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2 - 1;
      doc.text(`${d.label}: ${formatMeasurement(d.valueMm, unit)}`, mx, my, { align: 'center' });
    }
  }

  // Annotations
  if (options.includeAnnotations !== false && geometry.annotations.length > 0) {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184); // Slate 400
    for (const a of geometry.annotations) {
      doc.text(a.text, a.x + offsetX, a.y + offsetY, { align: 'center' });
    }
  }

  // Engineering Disclaimer Footer
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(5.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'IMPORTANT: Verify dieline against material thickness, folding compensation, and physical mock-up before die-cutting production.',
    pageW / 2,
    pageH - 5,
    { align: 'center' }
  );

  const dimParts = Object.entries(dims)
    .map(([_, v]) => Math.round(v))
    .join('x');
  const filename = `${template.id}_${dimParts}mm.pdf`;
  doc.save(filename);
}

/**
 * Lightweight SVG path interpreter to render SVG path string to jsPDF vector commands
 */
function drawSvgPathToJsPdf(doc: jsPDF, pathStr: string, offsetX: number, offsetY: number) {
  // Regex tokenization for basic SVG commands: M, L, H, V, Z, C, Q
  const tokens = pathStr.match(/[a-df-z]|[\-+]?(?:\d*\.\d+|\d+)/gi);
  if (!tokens) return;

  let cursorX = 0;
  let cursorY = 0;
  let startX = 0;
  let startY = 0;
  let i = 0;

  while (i < tokens.length) {
    const cmd = tokens[i];
    if (cmd === 'M') {
      cursorX = parseFloat(tokens[i + 1]) + offsetX;
      cursorY = parseFloat(tokens[i + 2]) + offsetY;
      startX = cursorX;
      startY = cursorY;
      i += 3;
    } else if (cmd === 'L') {
      const nextX = parseFloat(tokens[i + 1]) + offsetX;
      const nextY = parseFloat(tokens[i + 2]) + offsetY;
      doc.line(cursorX, cursorY, nextX, nextY);
      cursorX = nextX;
      cursorY = nextY;
      i += 3;
    } else if (cmd === 'H') {
      const nextX = parseFloat(tokens[i + 1]) + offsetX;
      doc.line(cursorX, cursorY, nextX, cursorY);
      cursorX = nextX;
      i += 2;
    } else if (cmd === 'V') {
      const nextY = parseFloat(tokens[i + 1]) + offsetY;
      doc.line(cursorX, cursorY, cursorX, nextY);
      cursorY = nextY;
      i += 2;
    } else if (cmd === 'Z' || cmd === 'z') {
      doc.line(cursorX, cursorY, startX, startY);
      cursorX = startX;
      cursorY = startY;
      i += 1;
    } else if (cmd === 'C') {
      // Bezier curve approximation or simple end line in PDF fallback
      const x1 = parseFloat(tokens[i + 1]) + offsetX;
      const y1 = parseFloat(tokens[i + 2]) + offsetY;
      const x2 = parseFloat(tokens[i + 3]) + offsetX;
      const y2 = parseFloat(tokens[i + 4]) + offsetY;
      const endX = parseFloat(tokens[i + 5]) + offsetX;
      const endY = parseFloat(tokens[i + 6]) + offsetY;
      // jsPDF curveTo:
      doc.curveTo(x1, y1, x2, y2, endX, endY);
      cursorX = endX;
      cursorY = endY;
      i += 7;
    } else if (cmd === 'Q') {
      // Quadratic approximation
      const cx = parseFloat(tokens[i + 1]) + offsetX;
      const cy = parseFloat(tokens[i + 2]) + offsetY;
      const endX = parseFloat(tokens[i + 3]) + offsetX;
      const endY = parseFloat(tokens[i + 4]) + offsetY;
      doc.line(cursorX, cursorY, endX, endY);
      cursorX = endX;
      cursorY = endY;
      i += 5;
    } else {
      // If it's a floating coordinate after an active command
      i++;
    }
  }
}

/**
 * Project file export (.dieline.json)
 */
export function exportProjectJson(
  templateId: string,
  projectName: string,
  dims: DimensionValues,
  settings: TechnicalSettings,
  unit: Unit
) {
  const project = {
    version: '1.0.0',
    app: 'Dieline Studio',
    projectName: projectName || 'Untitled Project',
    templateId,
    dimensions: dims,
    settings,
    unit,
    exportedAt: new Date().toISOString(),
  };

  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${(projectName || templateId).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.dieline.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
