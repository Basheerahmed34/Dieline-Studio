import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Filter,
  Package,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  ALL_TEMPLATES,
  CATEGORIES,
  searchTemplates,
} from '../engine/templates';
import { PackagingCategory, TemplateDefinition } from '../types/dieline';

interface TemplateCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateDefinition) => void;
  currentTemplateId: string;
}

export const TemplateCatalogModal: React.FC<TemplateCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentTemplateId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PackagingCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredTemplates = useMemo(() => {
    return searchTemplates(searchQuery, selectedCategory, selectedDifficulty);
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6 overflow-hidden">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between gap-4 shrink-0 bg-neutral-900/90">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Packaging Template Library
              </h2>
              <span className="text-xs font-mono text-neutral-400">
                ({ALL_TEMPLATES.length} Structural Dielines)
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select an industry-standard packaging structure to begin parametric vector design.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-950/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by box style, industry code (ECMA/FEFCO), or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-neutral-900 border border-neutral-700/80 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Difficulty Segmented Control */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-neutral-400 mr-1 text-[11px]">Difficulty:</span>
            {['all', 'Basic', 'Intermediate', 'Advanced'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-neutral-800 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {diff === 'all' ? 'All' : diff}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="px-4 py-2 border-b border-neutral-800/80 bg-neutral-900 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white font-semibold'
                : 'bg-neutral-800/70 text-neutral-300 hover:text-white hover:bg-neutral-800'
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
                  : 'bg-neutral-800/70 text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        {/* Templates Grid Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredTemplates.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-neutral-400">
              <Package className="w-10 h-10 mb-2 stroke-1 text-neutral-600" />
              <p className="text-sm font-medium text-neutral-300">No packaging structures found</p>
              <p className="text-xs text-neutral-500 mt-1">Try another keyword or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTemplates.map((tpl) => {
                const isCurrent = tpl.id === currentTemplateId;
                return (
                  <TemplateCard
                    key={tpl.id}
                    template={tpl}
                    isCurrent={isCurrent}
                    onSelect={() => {
                      onSelectTemplate(tpl);
                      onClose();
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TemplateCardProps {
  template: TemplateDefinition;
  isCurrent: boolean;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, isCurrent, onSelect }) => {
  // Generate mini thumbnail dieline geometry using default values
  const miniGeometry = useMemo(() => {
    try {
      const defaultDims: Record<string, number> = {};
      template.dimensions.forEach((d) => {
        defaultDims[d.key] = d.defaultVal;
      });
      return template.generator(defaultDims, {
        bleed: 0,
        safeArea: 0,
        caliper: 0.4,
        showGrainDirection: false,
        colorScheme: 'blue-yellow-white',
      });
    } catch {
      return null;
    }
  }, [template]);

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-neutral-950/40 hover:bg-neutral-800/40 border rounded-xl p-3 flex flex-col justify-between transition-all cursor-pointer ${
        isCurrent
          ? 'border-blue-500 ring-1 ring-blue-500/50 bg-neutral-900/60'
          : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      <div>
        {/* Live Vector SVG Thumbnail */}
        <div className="w-full h-36 bg-neutral-950 rounded-lg border border-neutral-800/80 overflow-hidden flex items-center justify-center p-3 relative group-hover:border-neutral-700 transition-colors">
          {miniGeometry ? (
            <svg
              viewBox={`${miniGeometry.bounds.minX} ${miniGeometry.bounds.minY} ${miniGeometry.bounds.width} ${miniGeometry.bounds.height}`}
              className="w-full h-full object-contain pointer-events-none transform group-hover:scale-105 transition-transform duration-200"
            >
              {/* Crease lines (Yellow) */}
              {miniGeometry.creasePath && (
                <path
                  d={miniGeometry.creasePath}
                  fill="none"
                  stroke="#FACC15"
                  strokeWidth={miniGeometry.bounds.width * 0.007}
                  strokeDasharray="3,2"
                />
              )}
              {/* Cut lines (White) */}
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

          {/* Current Active Indicator */}
          {isCurrent && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono text-[9px] font-bold">
              ACTIVE
            </span>
          )}
        </div>

        {/* Metadata info */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
            <span className="text-blue-400">{template.categoryName}</span>
            {template.industryCode && (
              <>
                <span aria-hidden="true">·</span>
                <span>{template.industryCode}</span>
              </>
            )}
          </div>

          <h3 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
            {template.name}
          </h3>

          <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between">
        <span className="text-[10px] font-mono text-neutral-400">
          {template.dimensions.map((d) => d.label.split(' ')[0]).join(' × ')}
        </span>

        <button className="flex items-center gap-1 text-[11px] font-medium text-blue-400 group-hover:text-blue-300 transition-colors cursor-pointer">
          <span>Use Template</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
