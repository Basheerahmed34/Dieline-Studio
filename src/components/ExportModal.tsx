import React, { useMemo, useState } from 'react';
import {
  Check,
  Download,
  Eye,
  FileCode,
  FileText,
  Info,
  Layers,
  Lock,
  Maximize2,
  Package,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  downloadPdfFile,
  downloadSvgFile,
  exportProjectJson,
  PAPER_SIZES_MM,
} from '../engine/export';
import { formatMeasurement } from '../engine/geometry';
import {
  DielineGeometry,
  DimensionValues,
  TechnicalSettings,
  TemplateDefinition,
  Unit,
} from '../types/dieline';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateDefinition;
  geometry: DielineGeometry;
  dimensions: DimensionValues;
  settings: TechnicalSettings;
  unit: Unit;
  projectName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  template,
  geometry,
  dimensions,
  settings,
  unit,
  projectName,
}) => {
  const { user, isAuthenticated, requireAuth } = useAuth();
  const [format, setFormat] = useState<'svg' | 'pdf' | 'json'>('svg');
  const [includeDimensions, setIncludeDimensions] = useState(true);
  const [includeBleed, setIncludeBleed] = useState(true);
  const [includeSafeArea, setIncludeSafeArea] = useState(true);
  const [includeGlueArea, setIncludeGlueArea] = useState(true);
  const [includeAnnotations, setIncludeAnnotations] = useState(true);
  const [paperSize, setPaperSize] = useState<'actual' | 'A4' | 'A3' | 'A2' | 'A1' | '12x18'>('actual');

  if (!isOpen) return null;

  const handleDownload = () => {
    const executeExport = () => {
      const options = {
        includeDimensions,
        includeBleed,
        includeSafeArea,
        includeGlueArea,
        includeAnnotations,
        paperSize,
        unit,
      };

      if (format === 'svg') {
        downloadSvgFile(template, geometry, dimensions, settings, unit, options);
      } else if (format === 'pdf') {
        downloadPdfFile(template, geometry, dimensions, settings, unit, options);
      } else if (format === 'json') {
        exportProjectJson(template.id, projectName, dimensions, settings, unit);
      }

      onClose();
    };

    // Authenticate before downloading (Google, Email/Password, Facebook OAuth)
    requireAuth(executeExport);
  };

  const dimParts = Object.entries(dimensions)
    .map(([_, v]) => Math.round(v))
    .join('x');
  const filenamePreview =
    format === 'json'
      ? `${(projectName || template.id).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.dieline.json`
      : `${template.id}_${dimParts}mm.${format}`;

  // Preview ViewBox calculation
  const { bounds } = geometry;
  const margin = 12;
  const minX = bounds.minX - margin;
  const minY = bounds.minY - margin;
  const widthMm = bounds.width + margin * 2;
  const heightMm = bounds.height + margin * 2;

  // Selected paper size dimensions for PDF preview
  const paperDimensions = paperSize !== 'actual' && PAPER_SIZES_MM[paperSize] ? PAPER_SIZES_MM[paperSize] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 overflow-hidden">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Export Packaging Dieline
              </h2>
              <span className="text-[11px] font-mono text-neutral-400">
                ({formatMeasurement(bounds.width, unit, 0)} × {formatMeasurement(bounds.height, unit, 0)})
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Verify vector layer output and technical specifications before downloading.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content - 2 Columns (Preview on Left, Settings on Right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: High-Fidelity Vector Dieline Preview */}
          <div className="lg:col-span-7 bg-neutral-950 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-neutral-800 flex flex-col justify-between select-none">
            <div>
              {/* Preview Header & Layer Legend */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Real-Time Vector Preview</span>
                </div>
                <div className="flex items-center gap-2.5 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-white">
                    <span className="w-2.5 h-1 bg-white rounded-full shadow-xs" /> Cut (White)
                  </span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <span className="w-2.5 h-1 bg-yellow-400 rounded-full" /> Crease (Yellow)
                  </span>
                  {includeBleed && (
                    <span className="flex items-center gap-1 text-blue-400">
                      <span className="w-2.5 h-1 bg-blue-500 rounded-full" /> Bleed (Blue)
                    </span>
                  )}
                  {includeGlueArea && (
                    <span className="flex items-center gap-1 text-amber-300">
                      <span className="w-1.5 h-1.5 bg-yellow-400/80 rounded-xs" /> Glue
                    </span>
                  )}
                </div>
              </div>

              {/* Vector SVG Canvas Container */}
              <div className="w-full h-72 sm:h-84 md:h-96 bg-neutral-950 rounded-lg border border-blue-950/60 cad-grid-pattern overflow-hidden relative flex items-center justify-center p-4">
                <svg
                  viewBox={`${minX} ${minY} ${widthMm} ${heightMm}`}
                  className="w-full h-full object-contain pointer-events-none drop-shadow-md"
                >
                  <defs>
                    <pattern
                      id="export-preview-glue-hatch"
                      width="8"
                      height="8"
                      patternTransform="rotate(45 0 0)"
                      patternUnits="userSpaceOnUse"
                    >
                      <line x1="0" y1="0" x2="0" y2="8" stroke="#FACC15" strokeWidth="1.2" />
                    </pattern>
                    <marker
                      id="exp-arrow-start"
                      viewBox="0 0 10 10"
                      refX="2"
                      refY="5"
                      markerWidth="4"
                      markerHeight="4"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 5 L 8 2 L 6 5 L 8 8 z" fill="#60A5FA" />
                    </marker>
                    <marker
                      id="exp-arrow-end"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="4"
                      markerHeight="4"
                      orient="auto"
                    >
                      <path d="M 0 2 L 8 5 L 0 8 L 2 5 z" fill="#60A5FA" />
                    </marker>
                  </defs>

                  {/* 1. Bleed Layer (Blue) */}
                  {includeBleed && geometry.bleedPath && (
                    <path
                      d={geometry.bleedPath}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="0.6"
                      strokeDasharray="3,2"
                      opacity="0.9"
                    />
                  )}

                  {/* 2. Safe Area Layer (Light Blue) */}
                  {includeSafeArea && geometry.safeAreaPath && (
                    <path
                      d={geometry.safeAreaPath}
                      fill="none"
                      stroke="#60A5FA"
                      strokeWidth="0.4"
                      strokeDasharray="2,2"
                      opacity="0.6"
                    />
                  )}

                  {/* 3. Glue Flaps */}
                  {includeGlueArea &&
                    geometry.glueFlapPaths &&
                    geometry.glueFlapPaths.map((p, idx) => (
                      <path
                        key={`glue-${idx}`}
                        d={p}
                        fill="url(#export-preview-glue-hatch)"
                        stroke="#FACC15"
                        strokeWidth="0.4"
                        opacity="0.8"
                      />
                    ))}

                  {/* 4. Crease Lines (Yellow Dashed) */}
                  {geometry.creasePath && (
                    <path
                      d={geometry.creasePath}
                      fill="none"
                      stroke="#FACC15"
                      strokeWidth="0.7"
                      strokeDasharray="4,2.5"
                    />
                  )}

                  {/* 5. Cut Lines (Pure White Solid) */}
                  {geometry.cutPath && (
                    <path
                      d={geometry.cutPath}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.0"
                    />
                  )}

                  {/* 6. Dimensions Callouts */}
                  {includeDimensions &&
                    geometry.dimensions.map((dim) => {
                      const midX = (dim.x1 + dim.x2) / 2;
                      const midY = (dim.y1 + dim.y2) / 2 - 2;
                      return (
                        <g key={dim.id}>
                          <line
                            x1={dim.x1}
                            y1={dim.y1}
                            x2={dim.x2}
                            y2={dim.y2}
                            stroke="#E2E8F0"
                            strokeWidth="0.4"
                            markerStart="url(#exp-arrow-start)"
                            markerEnd="url(#exp-arrow-end)"
                            opacity="0.85"
                          />
                          <text
                            x={midX}
                            y={midY}
                            textAnchor="middle"
                            fill="#E2E8F0"
                            fontSize="4.2"
                            fontFamily="'JetBrains Mono', monospace"
                            fontWeight="500"
                          >
                            {dim.label}: {formatMeasurement(dim.valueMm, unit)}
                          </text>
                        </g>
                      );
                    })}

                  {/* 7. Annotations */}
                  {includeAnnotations &&
                    geometry.annotations.map((ann, idx) => (
                      <text
                        key={idx}
                        x={ann.x}
                        y={ann.y}
                        textAnchor="middle"
                        fill="#94A3B8"
                        fontSize={ann.fontSize || 3.8}
                        fontFamily="'Plus Jakarta Sans', sans-serif"
                        fontWeight="600"
                        letterSpacing="0.05em"
                        opacity="0.8"
                      >
                        {ann.text}
                      </text>
                    ))}
                </svg>

                {/* Floating Scale / Format Badge */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded bg-neutral-950/85 backdrop-blur-xs border border-neutral-700/80 text-[10px] font-mono text-neutral-300">
                  <span>Vector Geometry · 100% 1:1 Scale</span>
                </div>
              </div>
            </div>

            {/* Bottom Technical Status Bar */}
            <div className="mt-3 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span>
                Envelope: <strong className="text-white font-medium">{formatMeasurement(bounds.width, unit)}</strong> × <strong className="text-white font-medium">{formatMeasurement(bounds.height, unit)}</strong>
              </span>
              <span>
                Layers: <span className="text-white font-semibold">Cut (White)</span> · <span className="text-yellow-400 font-semibold">Crease (Yellow)</span>
                {includeBleed && <span> · <span className="text-blue-400 font-semibold">Bleed (Blue)</span></span>}
                {includeGlueArea && <span> · <span className="text-amber-300 font-semibold">Glue</span></span>}
              </span>
            </div>
          </div>

          {/* Right Column: Settings & Download Configuration */}
          <div className="lg:col-span-5 p-5 space-y-4 bg-neutral-900/60 text-xs">
            {/* Format selection */}
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300 block">Vector File Format</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('svg')}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                    format === 'svg'
                      ? 'border-rose-500 bg-rose-950/20 text-white ring-1 ring-rose-500/50'
                      : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold font-mono text-sm text-rose-400">SVG</span>
                    {format === 'svg' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                  <span className="text-[10px] leading-tight text-neutral-400">
                    Adobe Illustrator & CAD
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('pdf')}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                    format === 'pdf'
                      ? 'border-rose-500 bg-rose-950/20 text-white ring-1 ring-rose-500/50'
                      : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold font-mono text-sm text-sky-400">PDF</span>
                    {format === 'pdf' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                  <span className="text-[10px] leading-tight text-neutral-400">
                    Vector PDF with title block
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                    format === 'json'
                      ? 'border-rose-500 bg-rose-950/20 text-white ring-1 ring-rose-500/50'
                      : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold font-mono text-sm text-emerald-400">JSON</span>
                    {format === 'json' && <Check className="w-3.5 h-3.5 text-rose-400" />}
                  </div>
                  <span className="text-[10px] leading-tight text-neutral-400">
                    Project file to resume
                  </span>
                </button>
              </div>
            </div>

            {/* PDF Sheet Size */}
            {format === 'pdf' && (
              <div className="space-y-1.5 bg-neutral-950/40 p-3 rounded-lg border border-neutral-800">
                <label className="font-semibold text-neutral-300 block">
                  PDF Sheet Document Size
                </label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as any)}
                  className="w-full h-8 bg-neutral-900 border border-neutral-700 rounded px-2 text-white font-mono text-xs focus:outline-hidden focus:border-rose-500"
                >
                  <option value="actual">
                    Actual Size (1:1 Scale · {formatMeasurement(bounds.width, unit, 0)} × {formatMeasurement(bounds.height, unit, 0)})
                  </option>
                  <option value="A4">A4 Sheet (210 × 297 mm)</option>
                  <option value="A3">A3 Sheet (297 × 420 mm)</option>
                  <option value="A2">A2 Sheet (420 × 594 mm)</option>
                  <option value="A1">A1 Sheet (594 × 841 mm)</option>
                  <option value="12x18">Digital Press 12 × 18 in (304.8 × 457.2 mm)</option>
                </select>
                <p className="text-[10px] text-neutral-500 pt-0.5">
                  Actual Size preserves exact physical dimensions without scale distortion.
                </p>
              </div>
            )}

            {/* Layer Options */}
            {format !== 'json' && (
              <div className="space-y-2 bg-neutral-950/40 p-3 rounded-lg border border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-300">Technical Layers</span>
                  <span className="text-[10px] text-neutral-500">Updates Preview in real-time</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDimensions}
                      onChange={(e) => setIncludeDimensions(e.target.checked)}
                      className="rounded border-neutral-700 text-rose-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Dimensions</span>
                  </label>

                  <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeBleed}
                      onChange={(e) => setIncludeBleed(e.target.checked)}
                      className="rounded border-neutral-700 text-rose-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Bleed Layer</span>
                  </label>

                  <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSafeArea}
                      onChange={(e) => setIncludeSafeArea(e.target.checked)}
                      className="rounded border-neutral-700 text-rose-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Safe Area</span>
                  </label>

                  <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeGlueArea}
                      onChange={(e) => setIncludeGlueArea(e.target.checked)}
                      className="rounded border-neutral-700 text-rose-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Glue Flap</span>
                  </label>

                  <label className="flex items-center gap-2 text-neutral-300 cursor-pointer col-span-2">
                    <input
                      type="checkbox"
                      checked={includeAnnotations}
                      onChange={(e) => setIncludeAnnotations(e.target.checked)}
                      className="rounded border-neutral-700 text-rose-600 focus:ring-0 cursor-pointer"
                    />
                    <span>Panel Annotations & Labels</span>
                  </label>
                </div>
              </div>
            )}

            {/* Target Filename Preview */}
            <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-400 space-y-1">
              <span className="text-[10px] text-neutral-500 block">EXPORT FILENAME</span>
              <span className="text-white font-semibold block truncate">{filenamePreview}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors font-medium text-xs cursor-pointer"
            >
              Cancel
            </button>
            {isAuthenticated && user && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-950/80 border border-blue-800 text-[11px] text-blue-300 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Verified: {user.name}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleDownload}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md active:scale-98 cursor-pointer"
          >
            {isAuthenticated ? (
              <>
                <Download className="w-4 h-4" />
                <span>Download {format.toUpperCase()}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-blue-200" />
                <span>Approve &amp; Download {format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
