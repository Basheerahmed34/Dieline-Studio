import React, { useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Info,
  Layers,
  RotateCcw,
  Ruler,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  DielineGeometry,
  DimensionValues,
  GeometryBounds,
  LayerVisibility,
  TechnicalSettings,
  TemplateDefinition,
  Unit,
} from '../types/dieline';
import { formatMeasurement, mmToUnit, unitToMm } from '../engine/geometry';
import { PAPER_SIZES_MM } from '../engine/export';
import { StatisticsPanel } from './StatisticsPanel';

interface SidebarProps {
  template: TemplateDefinition;
  geometry: DielineGeometry;
  dimensions: DimensionValues;
  onDimensionChange: (key: string, valMm: number) => void;
  settings: TechnicalSettings;
  onSettingChange: <K extends keyof TechnicalSettings>(key: K, val: TechnicalSettings[K]) => void;
  layers: LayerVisibility;
  onLayerToggle: (layer: keyof LayerVisibility) => void;
  unit: Unit;
  bounds: GeometryBounds;
  onReset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  template,
  geometry,
  dimensions,
  onDimensionChange,
  settings,
  onSettingChange,
  layers,
  onLayerToggle,
  unit,
  bounds,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<'dimensions' | 'settings' | 'stats' | 'layers' | 'sheet'>('dimensions');

  // Input value handler with unit conversion
  const handleInputChange = (key: string, rawVal: string) => {
    const num = parseFloat(rawVal);
    if (!isNaN(num)) {
      const valMm = unitToMm(num, unit);
      onDimensionChange(key, Math.max(1, valMm));
    }
  };

  const handleStep = (key: string, currentMm: number, stepUnit: number, dir: 1 | -1) => {
    const currentInUnit = mmToUnit(currentMm, unit);
    const nextInUnit = Math.max(1, currentInUnit + stepUnit * dir);
    const nextMm = unitToMm(nextInUnit, unit);
    onDimensionChange(key, nextMm);
  };

  return (
    <aside className="w-80 md:w-92 h-full bg-neutral-900 border-l border-neutral-800 flex flex-col shrink-0 text-neutral-200 select-none z-10 text-xs">
      {/* Top Header Card */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-900/80">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[10px] font-mono tracking-wider uppercase text-rose-400 font-semibold">
            {template.categoryName}
          </span>
          {template.industryCode && (
            <span className="text-[10px] font-mono text-neutral-400">
              {template.industryCode}
            </span>
          )}
        </div>
        <h2 className="text-sm font-semibold text-white tracking-tight line-clamp-1">
          {template.name}
        </h2>
        <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
          {template.description}
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="grid grid-cols-5 p-1 bg-neutral-950/60 border-b border-neutral-800 text-[10.5px] font-medium">
        <button
          onClick={() => setActiveTab('dimensions')}
          className={`py-1.5 px-0.5 rounded-md text-center transition-colors truncate ${
            activeTab === 'dimensions'
              ? 'bg-neutral-800 text-white font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="Dimensions"
        >
          Dims
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`py-1.5 px-0.5 rounded-md text-center transition-colors truncate ${
            activeTab === 'settings'
              ? 'bg-neutral-800 text-white font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="Technical Settings"
        >
          Tech
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`py-1.5 px-0.5 rounded-md text-center transition-colors truncate ${
            activeTab === 'stats'
              ? 'bg-neutral-800 text-white font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="Statistics & Material Usage"
        >
          Stats
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`py-1.5 px-0.5 rounded-md text-center transition-colors truncate ${
            activeTab === 'layers'
              ? 'bg-neutral-800 text-white font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="Layers Visibility"
        >
          Layers
        </button>
        <button
          onClick={() => setActiveTab('sheet')}
          className={`py-1.5 px-0.5 rounded-md text-center transition-colors truncate ${
            activeTab === 'sheet'
              ? 'bg-neutral-800 text-white font-semibold shadow-xs'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          title="Sheet Nesting Fit"
        >
          Sheet
        </button>
      </div>

      {/* Tab content area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: DIMENSIONS */}
        {activeTab === 'dimensions' && (
          <div className="space-y-3.5">
            {/* Editable Sides & Structural Breakdown */}
            <div className="bg-blue-950/40 p-2.5 rounded-lg border border-blue-800/60 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-blue-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Editable Sides &amp; Panels
                </span>
                <span className="text-[10px] font-mono text-blue-400">100% Vector</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                <div className="bg-neutral-900/90 p-1.5 rounded border border-neutral-800">
                  <span className="text-neutral-400 block text-[9px]">FRONT / BACK:</span>
                  <span className="text-white font-semibold">
                    {formatMeasurement(dimensions.width || 60, unit, 0)} × {formatMeasurement(dimensions.height || 120, unit, 0)}
                  </span>
                </div>
                <div className="bg-neutral-900/90 p-1.5 rounded border border-neutral-800">
                  <span className="text-neutral-400 block text-[9px]">SIDE PANELS:</span>
                  <span className="text-white font-semibold">
                    {formatMeasurement(dimensions.depth || dimensions.gusset || 40, unit, 0)} × {formatMeasurement(dimensions.height || 120, unit, 0)}
                  </span>
                </div>
                <div className="bg-neutral-900/90 p-1.5 rounded border border-neutral-800">
                  <span className="text-neutral-400 block text-[9px]">CLOSURE FLAPS:</span>
                  <span className="text-yellow-400 font-semibold">
                    {formatMeasurement(dimensions.width || 60, unit, 0)} × {formatMeasurement(dimensions.depth || 40, unit, 0)}
                  </span>
                </div>
                <div className="bg-neutral-900/90 p-1.5 rounded border border-neutral-800">
                  <span className="text-neutral-400 block text-[9px]">GLUE TAB / SEAM:</span>
                  <span className="text-blue-400 font-semibold">
                    {formatMeasurement(settings.glueFlapWidth || 15, unit, 0)} × {formatMeasurement(dimensions.height || 120, unit, 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-neutral-400 text-[11px]">
              <span>Parameter Inputs</span>
              <span className="font-mono">Units: {unit}</span>
            </div>

            {template.dimensions.map((dim) => {
              const currentMm = dimensions[dim.key] ?? dim.defaultVal;
              const currentInUnit = mmToUnit(currentMm, unit);
              const displayVal = unit === 'in' ? currentInUnit.toFixed(2) : currentInUnit.toFixed(1);

              return (
                <div key={dim.key} className="space-y-1.5 bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-neutral-200 text-xs">
                      {dim.label}
                    </label>
                    <span className="font-mono text-neutral-400 text-[11px]">
                      {formatMeasurement(currentMm, unit)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStep(dim.key, currentMm, unit === 'in' ? 0.25 : 5, -1)}
                      className="w-7 h-7 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded flex items-center justify-center font-bold text-sm cursor-pointer"
                      title="Decrease"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step={unit === 'in' ? '0.1' : '1'}
                      value={displayVal}
                      onChange={(e) => handleInputChange(dim.key, e.target.value)}
                      className="flex-1 h-7 bg-neutral-900 border border-neutral-700 rounded px-2 font-mono text-center text-white focus:outline-hidden focus:border-blue-500 text-xs"
                    />
                    <button
                      onClick={() => handleStep(dim.key, currentMm, unit === 'in' ? 0.25 : 5, 1)}
                      className="w-7 h-7 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded flex items-center justify-center font-bold text-sm cursor-pointer"
                      title="Increase"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Quick Presets / Actions */}
            <div className="pt-2">
              <button
                onClick={onReset}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md bg-neutral-800 hover:bg-neutral-700/80 text-neutral-300 hover:text-white transition-colors text-xs font-medium cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Template Defaults</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TECHNICAL SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Color Scheme Picker */}
            <div className="space-y-1.5 bg-blue-950/30 p-2.5 rounded-lg border border-blue-800/60">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-200 text-xs">CAD Color Theme</span>
                <span className="text-[10px] font-mono text-blue-400">Blue·Yellow·White</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => onSettingChange('colorScheme', 'blue-yellow-white')}
                  className={`p-2 rounded text-left border transition-all text-xs font-medium cursor-pointer ${
                    settings.colorScheme === 'blue-yellow-white' || settings.colorScheme === undefined
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-white shadow-xs" />
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                  <span className="text-[11px] block font-semibold">Blue, Yellow, White</span>
                  <span className="text-[9px] text-blue-200 block">Packaging CAD</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSettingChange('colorScheme', 'iso-standard')}
                  className={`p-2 rounded text-left border transition-all text-xs font-medium cursor-pointer ${
                    settings.colorScheme === 'iso-standard'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] block font-semibold">ISO Standard</span>
                  <span className="text-[9px] text-neutral-400 block">Red, Sky, Green</span>
                </button>
              </div>
            </div>

            {/* Bleed Margin */}
            <div className="space-y-1.5 bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-800/80">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-200">Bleed Margin ("Bless Area")</span>
                <span className="font-mono text-neutral-400">{settings.bleed} mm</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[0, 2, 3, 5].map((b) => (
                  <button
                    key={b}
                    onClick={() => onSettingChange('bleed', b)}
                    className={`py-1 rounded text-center font-mono text-xs transition-colors cursor-pointer ${
                      settings.bleed === b
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {b}mm
                  </button>
                ))}
              </div>
            </div>

            {/* Safe Area Margin */}
            <div className="space-y-1.5 bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-800/80">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-200">Safe Area (Inner Guide)</span>
                <span className="font-mono text-neutral-400">{settings.safeArea} mm</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[2, 3, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => onSettingChange('safeArea', s)}
                    className={`py-1 rounded text-center font-mono text-xs transition-colors cursor-pointer ${
                      settings.safeArea === s
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {s}mm
                  </button>
                ))}
              </div>
            </div>

            {/* Board Thickness / Caliper */}
            <div className="space-y-1.5 bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-800/80">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-200">Board Caliper (Thickness)</span>
                <span className="font-mono text-neutral-400">{settings.caliper} mm</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                {[
                  { cal: 0.35, label: '14 pt' },
                  { cal: 0.45, label: '18 pt' },
                  { cal: 1.5, label: 'E-Flute' },
                ].map((item) => (
                  <button
                    key={item.cal}
                    onClick={() => onSettingChange('caliper', item.cal)}
                    className={`py-1 rounded text-center font-mono transition-colors cursor-pointer ${
                      settings.caliper === item.cal
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-neutral-500 pt-1">
                Paperboard score channel widths automatically adjust based on caliper.
              </p>
            </div>

            {/* Glue Flap Width */}
            <div className="space-y-1.5 bg-neutral-950/40 p-2.5 rounded-lg border border-neutral-800/80">
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-200">Side Glue Flap Width</span>
                <span className="font-mono text-neutral-400">{settings.glueFlapWidth || 15} mm</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[12, 15, 20].map((g) => (
                  <button
                    key={g}
                    onClick={() => onSettingChange('glueFlapWidth', g)}
                    className={`py-1 rounded text-center font-mono text-xs transition-colors cursor-pointer ${
                      (settings.glueFlapWidth || 15) === g
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {g}mm
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STATISTICS PANEL */}
        {activeTab === 'stats' && (
          <StatisticsPanel
            geometry={geometry}
            settings={settings}
            template={template}
            unit={unit}
          />
        )}

        {/* TAB 4: LAYERS & VISIBILITY */}
        {activeTab === 'layers' && (
          <div className="space-y-2">
            <span className="text-[11px] text-neutral-400 font-semibold">Technical Vector Layers (CAD Palette)</span>

            {[
              { key: 'cut', label: 'Cut Lines (Die Outer Contour)', color: 'bg-white shadow-xs' },
              { key: 'crease', label: 'Crease Lines (Score Folds)', color: 'bg-yellow-400' },
              { key: 'bleed', label: 'Bleed Boundary ("Bless Area")', color: 'bg-blue-500' },
              { key: 'safeArea', label: 'Safe Area Margins', color: 'bg-blue-300' },
              { key: 'glue', label: 'Glue Flap Hatches', color: 'bg-amber-400' },
              { key: 'dimensions', label: 'Dimension Callouts', color: 'bg-slate-200' },
              { key: 'annotations', label: 'Technical Text & Labels', color: 'bg-neutral-400' },
              { key: 'rulers', label: 'CAD Viewport Rulers', color: 'bg-neutral-500' },
              { key: 'grid', label: 'Engineering Canvas Grid', color: 'bg-neutral-600' },
            ].map((layerItem) => {
              const k = layerItem.key as keyof LayerVisibility;
              const isVisible = layers[k];

              return (
                <div
                  key={layerItem.key}
                  onClick={() => onLayerToggle(k)}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-950/40 border border-neutral-800/80 hover:bg-neutral-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${layerItem.color} shrink-0`} />
                    <span className="font-medium text-neutral-200 text-xs">{layerItem.label}</span>
                  </div>

                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => onLayerToggle(k)}
                    className="rounded border-neutral-700 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 5: SHEET FITTING & MATERIAL SPECS */}
        {activeTab === 'sheet' && (
          <div className="space-y-3.5">
            <div className="bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/80 space-y-2">
              <span className="text-[11px] font-semibold text-neutral-300">
                Unfolded Blank Dimensions
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-neutral-900 p-2 rounded">
                  <span className="text-neutral-500 text-[10px] block">FLAT WIDTH</span>
                  <span className="text-white font-bold">{formatMeasurement(bounds.width, unit)}</span>
                </div>
                <div className="bg-neutral-900 p-2 rounded">
                  <span className="text-neutral-500 text-[10px] block">FLAT HEIGHT</span>
                  <span className="text-white font-bold">{formatMeasurement(bounds.height, unit)}</span>
                </div>
              </div>
            </div>

            {/* Standard Press Sheet Fit Check */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-neutral-300">
                Standard Sheet Fit Analyzer
              </span>

              {Object.entries(PAPER_SIZES_MM).map(([key, sheet]) => {
                const fitsPortrait = bounds.width <= sheet.w && bounds.height <= sheet.h;
                const fitsLandscape = bounds.width <= sheet.h && bounds.height <= sheet.w;
                const fits = fitsPortrait || fitsLandscape;

                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-2 rounded-lg border ${
                      fits
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                        : 'bg-rose-950/20 border-rose-800/30 text-rose-300'
                    }`}
                  >
                    <div>
                      <span className="font-semibold block">{sheet.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">
                        {fits ? 'Dieline fits on single sheet' : 'Exceeds sheet bounds'}
                      </span>
                    </div>

                    {fits ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Recommended Stock */}
            <div className="bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/80 space-y-1.5">
              <span className="text-[11px] font-semibold text-neutral-300">
                Recommended Stock & Grain
              </span>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {template.stockRecommendation}
              </p>
              <p className="text-[10px] text-neutral-500 pt-1">
                Grain direction should run parallel to major crease lines to prevent paper cracking during automatic high-speed folding.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

