import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Download,
  Eye,
  FileCode,
  FileText,
  Filter,
  Layers,
  Lock,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { downloadPdfFile, downloadSvgFile } from '../engine/export';
import { ALL_TEMPLATES, CATEGORIES, searchTemplates } from '../engine/templates';
import { PackagingCategory, TemplateDefinition, Unit } from '../types/dieline';

interface TemplateGalleryProps {
  onSelectTemplate: (template: TemplateDefinition) => void;
  currentTemplateId: string;
  unit: Unit;
  onOpenStudio: () => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  onSelectTemplate,
  currentTemplateId,
  unit,
  onOpenStudio,
}) => {
  const { requireAuth, isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PackagingCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    return searchTemplates(searchQuery, selectedCategory, selectedDifficulty);
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const handleQuickDownloadSvg = (e: React.MouseEvent, tpl: TemplateDefinition) => {
    e.stopPropagation();
    requireAuth(() => {
      try {
        const defaultDims: Record<string, number> = {};
        tpl.dimensions.forEach((d) => {
          defaultDims[d.key] = d.defaultVal;
        });
        const geom = tpl.generator(defaultDims, {
          bleed: 3,
          safeArea: 3,
          caliper: 0.4,
          showGrainDirection: false,
          colorScheme: 'blue-yellow-white',
        });
        downloadSvgFile(tpl, geom, defaultDims, {
          bleed: 3,
          safeArea: 3,
          caliper: 0.4,
          showGrainDirection: false,
          colorScheme: 'blue-yellow-white',
        }, unit, {
          includeDimensions: true,
          includeBleed: true,
          includeSafeArea: true,
          includeGlueArea: true,
          includeAnnotations: true,
        });

        setDownloadSuccessId(`${tpl.id}-svg`);
        setTimeout(() => setDownloadSuccessId(null), 2000);
      } catch (err) {
        console.error('Quick download failed:', err);
      }
    });
  };

  const handleQuickDownloadPdf = (e: React.MouseEvent, tpl: TemplateDefinition) => {
    e.stopPropagation();
    requireAuth(() => {
      try {
        const defaultDims: Record<string, number> = {};
        tpl.dimensions.forEach((d) => {
          defaultDims[d.key] = d.defaultVal;
        });
        const geom = tpl.generator(defaultDims, {
          bleed: 3,
          safeArea: 3,
          caliper: 0.4,
          showGrainDirection: false,
          colorScheme: 'blue-yellow-white',
        });
        downloadPdfFile(tpl, geom, defaultDims, {
          bleed: 3,
          safeArea: 3,
          caliper: 0.4,
          showGrainDirection: false,
          colorScheme: 'blue-yellow-white',
        }, unit, {
          paperSize: 'actual',
          includeDimensions: true,
          includeBleed: true,
          includeSafeArea: true,
          includeGlueArea: true,
          includeAnnotations: true,
        });

        setDownloadSuccessId(`${tpl.id}-pdf`);
        setTimeout(() => setDownloadSuccessId(null), 2000);
      } catch (err) {
        console.error('Quick download failed:', err);
      }
    });
  };

  return (
    <div className="flex-1 h-full w-full overflow-y-auto bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Banner / Hero */}
      <div className="p-6 md:p-8 bg-neutral-900 border-b border-neutral-800 shrink-0">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono tracking-wider uppercase text-blue-400 font-semibold">
                  Parametric Vector Catalog
                </span>
                <span className="text-neutral-500">·</span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {ALL_TEMPLATES.length} Verified Packaging Structures
                </span>
                <span className="text-neutral-500">·</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 font-semibold">
                  Blue, Yellow &amp; White CAD Theme
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Packaging Dieline Template Library
              </h1>
              <p className="text-xs md:text-sm text-neutral-400 max-w-2xl mt-1 leading-relaxed">
                Browse our complete collection of production-accurate packaging structures. All templates feature clearly labeled editable sides, parametric dimensions (W × H × D), verified creasing rules, bleed margins (bless area), and vector SVG &amp; PDF downloads.
              </p>
            </div>

            <button
              onClick={onOpenStudio}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md active:scale-98 self-start md:self-auto cursor-pointer"
            >
              <span>Open 2D CAD Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Precision Color Theme Guarantee Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-neutral-300">
            <span className="flex items-center gap-1.5 text-white font-medium">
              <span className="w-2.5 h-1 rounded-full bg-white shadow-xs" />
              Die Cut (Solid White)
            </span>
            <span className="text-neutral-600">·</span>
            <span className="flex items-center gap-1.5 text-yellow-400 font-medium">
              <span className="w-2.5 h-1 rounded-full bg-yellow-400" />
              Creasing Lines (Dashed Yellow)
            </span>
            <span className="text-neutral-600">·</span>
            <span className="flex items-center gap-1.5 text-blue-400 font-medium">
              <span className="w-2.5 h-1 rounded-full bg-blue-500" />
              Bleed Area / Bless Area (Electric Blue)
            </span>
            <span className="text-neutral-600">·</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Auth Approved Downloads (Google, Email, Facebook)
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="sticky top-0 z-20 p-4 border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by box style, ECMA/FEFCO code, product use (e.g. cosmetics, pizza, bottle)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-neutral-400 mr-1 text-[11px]">Difficulty:</span>
            {['all', 'Basic', 'Intermediate', 'Advanced'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-neutral-800 text-white shadow-xs font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {diff === 'all' ? 'All' : diff}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="max-w-6xl mx-auto mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-800'
            }`}
          >
            All Templates ({ALL_TEMPLATES.length})
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-neutral-800/80 text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates with Editable Sides & Direct Downloads */}
      <div className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
        {filteredTemplates.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-400">
            <Package className="w-10 h-10 mb-2 stroke-1 text-neutral-600" />
            <p className="text-sm font-medium text-neutral-300">No matching templates found</p>
            <p className="text-xs text-neutral-500 mt-1">Try another search keyword or select All categories</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((tpl) => {
              const isCurrent = tpl.id === currentTemplateId;
              return (
                <GalleryCard
                  key={tpl.id}
                  template={tpl}
                  isCurrent={isCurrent}
                  unit={unit}
                  onSelect={() => {
                    onSelectTemplate(tpl);
                    onOpenStudio();
                  }}
                  onDownloadSvg={(e) => handleQuickDownloadSvg(e, tpl)}
                  onDownloadPdf={(e) => handleQuickDownloadPdf(e, tpl)}
                  downloadSuccessId={downloadSuccessId}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

interface GalleryCardProps {
  template: TemplateDefinition;
  isCurrent: boolean;
  unit: Unit;
  onSelect: () => void;
  onDownloadSvg: (e: React.MouseEvent) => void;
  onDownloadPdf: (e: React.MouseEvent) => void;
  downloadSuccessId: string | null;
}

const GalleryCard: React.FC<GalleryCardProps> = ({
  template,
  isCurrent,
  unit,
  onSelect,
  onDownloadSvg,
  onDownloadPdf,
  downloadSuccessId,
}) => {
  // Generate mini thumbnail dieline geometry using default values
  const miniGeometry = useMemo(() => {
    try {
      const defaultDims: Record<string, number> = {};
      template.dimensions.forEach((d) => {
        defaultDims[d.key] = d.defaultVal;
      });
      return template.generator(defaultDims, {
        bleed: 3,
        safeArea: 3,
        caliper: 0.4,
        showGrainDirection: false,
        colorScheme: 'blue-yellow-white',
      });
    } catch {
      return null;
    }
  }, [template]);

  // Determine editable sides based on category and parameters
  const editableSidesDescription = useMemo(() => {
    const keys = template.dimensions.map((d) => d.key);
    if (keys.includes('width') && keys.includes('height') && keys.includes('depth')) {
      return 'Front/Back Panels (W) · Body Tube (H) · Left/Right Sides (D) · Flaps · Bleed';
    }
    if (keys.includes('width') && keys.includes('height') && keys.includes('gusset')) {
      return 'Front/Back Faces (W) · Height (H) · Bottom/Side Gusset · Seal Area';
    }
    if (keys.includes('width') && keys.includes('height')) {
      return 'Face Width (W) · Face Height (H) · Safe Margins · Bleed Perimeter';
    }
    return 'Full Parametric Dimensional Control (W × H × D)';
  }, [template]);

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-neutral-900/80 hover:bg-neutral-900 border rounded-xl p-4 flex flex-col justify-between transition-all cursor-pointer shadow-sm hover:shadow-xl ${
        isCurrent
          ? 'border-blue-500 ring-1 ring-blue-500/50 bg-neutral-900'
          : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      <div>
        {/* Live Vector SVG Thumbnail Canvas with Blue, Yellow, White Theme */}
        <div className="w-full h-44 bg-neutral-950 rounded-lg border border-neutral-800/80 cad-grid-pattern overflow-hidden flex items-center justify-center p-3 relative group-hover:border-neutral-700 transition-colors">
          {miniGeometry ? (
            <svg
              viewBox={`${miniGeometry.bounds.minX - 5} ${miniGeometry.bounds.minY - 5} ${miniGeometry.bounds.width + 10} ${miniGeometry.bounds.height + 10}`}
              className="w-full h-full object-contain pointer-events-none transform group-hover:scale-105 transition-transform duration-200"
            >
              {/* Bleed line (Electric Blue) */}
              {miniGeometry.bleedPath && (
                <path
                  d={miniGeometry.bleedPath}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth={miniGeometry.bounds.width * 0.006}
                  strokeDasharray="2,2"
                  opacity="0.9"
                />
              )}
              {/* Crease lines (Vibrant Yellow) */}
              {miniGeometry.creasePath && (
                <path
                  d={miniGeometry.creasePath}
                  fill="none"
                  stroke="#FACC15"
                  strokeWidth={miniGeometry.bounds.width * 0.007}
                  strokeDasharray="3,2"
                />
              )}
              {/* Cut lines (Crisp Solid White) */}
              {miniGeometry.cutPath && (
                <path
                  d={miniGeometry.cutPath}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={miniGeometry.bounds.width * 0.009}
                />
              )}
            </svg>
          ) : (
            <Package className="w-8 h-8 text-neutral-600" />
          )}

          {/* Badges on top of preview */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-neutral-900/90 border border-neutral-700 font-mono text-[9px] text-neutral-300">
              {template.difficulty}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800 font-mono text-[9px] text-blue-300 font-medium">
              Blue·Yellow·White
            </span>
          </div>

          {isCurrent && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono text-[9px] font-bold">
              ACTIVE IN STUDIO
            </span>
          )}
        </div>

        {/* Title, Category & Industry Code */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span className="text-blue-400 font-medium">{template.categoryName}</span>
            {template.industryCode && (
              <span className="text-neutral-500">{template.industryCode}</span>
            )}
          </div>

          <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
            {template.name}
          </h3>

          <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
            {template.description}
          </p>

          {/* Editable Sides & Downloadable Guarantee Block */}
          <div className="pt-1.5 pb-0.5 space-y-1 bg-neutral-950/70 p-2.5 rounded-lg border border-neutral-800">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-neutral-300 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Editable Sides &amp; Flaps:
              </span>
              <span className="text-blue-400 font-mono font-medium">100% Vector</span>
            </div>
            <p className="text-[10px] text-neutral-300 font-mono leading-tight">
              {editableSidesDescription}
            </p>
            <div className="flex items-center gap-2 pt-1 border-t border-neutral-800/80 text-[9px] font-mono text-neutral-400">
              <span className="text-emerald-400">✓ Downloadable SVG/PDF</span>
              <span>·</span>
              <span className="text-yellow-400">✓ Creasing Rules</span>
              <span>·</span>
              <span className="text-blue-400">✓ Bless Area (Bleed)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Buttons (Direct Download + Edit) */}
      <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {/* Quick Download SVG */}
          <button
            onClick={onDownloadSvg}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors font-mono text-[11px] border border-neutral-700 cursor-pointer"
            title="Instantly download vector SVG dieline (Auth required)"
          >
            {downloadSuccessId === `${template.id}-svg` ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>Download SVG</span>
          </button>

          {/* Quick Download PDF */}
          <button
            onClick={onDownloadPdf}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors font-mono text-[11px] border border-neutral-700 cursor-pointer"
            title="Instantly download vector PDF dieline (Auth required)"
          >
            {downloadSuccessId === `${template.id}-pdf` ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-yellow-400" />
            )}
            <span>Download PDF</span>
          </button>
        </div>

        {/* Primary Edit in Studio button */}
        <button
          onClick={onSelect}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
        >
          <span>Customize Dimensions in Studio</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
