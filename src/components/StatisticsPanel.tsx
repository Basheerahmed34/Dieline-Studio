import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Check,
  Copy,
  Gauge,
  Layers,
  Ruler,
  Scale,
  Scissors,
  Sparkles,
} from 'lucide-react';
import { calculateDielineStats } from '../engine/stats';
import {
  DielineGeometry,
  GeometryBounds,
  TechnicalSettings,
  TemplateDefinition,
  Unit,
} from '../types/dieline';

interface StatisticsPanelProps {
  geometry: DielineGeometry;
  settings: TechnicalSettings;
  template: TemplateDefinition;
  unit: Unit;
}

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  geometry,
  settings,
  template,
  unit,
}) => {
  const [customGsm, setCustomGsm] = useState<number | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    return calculateDielineStats(geometry, settings, unit, customGsm);
  }, [geometry, settings, unit, customGsm]);

  const handleCopyStats = () => {
    const summary = `DIELINE STUDIO — STRUCTURAL STATISTICS
Template: ${template.name} (${template.industryCode || 'ECMA/FEFCO'})
Flat Bounding Box: ${stats.flatWidthFormatted} × ${stats.flatHeightFormatted}
Gross Bounding Area: ${stats.grossBoundingAreaCm2.toFixed(1)} cm² (${stats.grossBoundingAreaIn2.toFixed(2)} in²)
Net Surface Area: ${stats.netSurfaceAreaCm2.toFixed(1)} cm² (${stats.netSurfaceAreaIn2.toFixed(2)} in²)
Material Efficiency: ${stats.materialEfficiencyPercent}% (Scrap: ${stats.scrapWastePercent}%)
Cut Rule Perimeter: ${stats.cutRuleLengthM.toFixed(3)} m (${stats.cutRuleLengthIn.toFixed(1)} in)
Crease Rule Length: ${stats.creaseRuleLengthM.toFixed(3)} m (${stats.creaseRuleLengthIn.toFixed(1)} in)
Total Die Rule Length: ${stats.totalRuleLengthM.toFixed(3)} m (${stats.totalRuleLengthIn.toFixed(1)} in)
Estimated Board Weight: ${stats.blankWeightGrams.toFixed(2)} g (@ ${stats.estimatedGsm} gsm)
Yield: ~${stats.blanksPerKilogram} blanks/kg · ~${stats.blanksPerMetricTon.toLocaleString()} blanks/tonne
`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 text-xs select-none">
      {/* Top Banner / Actions */}
      <div className="flex items-center justify-between text-neutral-400 text-[11px]">
        <span>Real-Time Structural Metrics</span>
        <button
          onClick={handleCopyStats}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors font-mono text-[10px] cursor-pointer"
          title="Copy technical metrics to clipboard"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy Specs'}</span>
        </button>
      </div>

      {/* Surface Area & Envelope Card */}
      <div className="bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/80 space-y-2.5">
        <div className="flex items-center gap-1.5 text-neutral-300 font-semibold text-[11px]">
          <Gauge className="w-3.5 h-3.5 text-rose-400" />
          <span>Surface Area & Envelope</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-neutral-900/90 p-2 rounded border border-neutral-800/60">
            <span className="text-neutral-500 text-[10px] block">NET SURFACE AREA</span>
            <span className="text-white font-bold text-sm block">
              {unit === 'in' ? `${stats.netSurfaceAreaIn2.toFixed(1)} in²` : `${stats.netSurfaceAreaCm2.toFixed(1)} cm²`}
            </span>
            <span className="text-[10px] text-neutral-500">
              {stats.netSurfaceAreaM2.toFixed(4)} m²
            </span>
          </div>

          <div className="bg-neutral-900/90 p-2 rounded border border-neutral-800/60">
            <span className="text-neutral-500 text-[10px] block">BOUNDING ENVELOPE</span>
            <span className="text-white font-bold text-sm block">
              {unit === 'in' ? `${stats.grossBoundingAreaIn2.toFixed(1)} in²` : `${stats.grossBoundingAreaCm2.toFixed(1)} cm²`}
            </span>
            <span className="text-[10px] text-neutral-500">
              {stats.flatWidthFormatted} × {stats.flatHeightFormatted}
            </span>
          </div>
        </div>

        {/* Material Efficiency Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-neutral-400">Material Efficiency</span>
            <span className="font-mono text-emerald-400 font-semibold">
              {stats.materialEfficiencyPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-rose-500 transition-all duration-300"
              style={{ width: `${stats.materialEfficiencyPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-500">
            <span>Net Blank: {stats.materialEfficiencyPercent}%</span>
            <span>Trim Scrap: {stats.scrapWastePercent}%</span>
          </div>
        </div>
      </div>

      {/* Steel Rule Die Tooling Lengths (Cut & Crease) */}
      <div className="bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/80 space-y-2.5">
        <div className="flex items-center gap-1.5 text-neutral-300 font-semibold text-[11px]">
          <Scissors className="w-3.5 h-3.5 text-sky-400" />
          <span>Steel Rule Die Tooling</span>
        </div>

        <div className="space-y-2 text-xs font-mono">
          {/* Cut perimeter */}
          <div className="flex items-center justify-between p-2 rounded bg-neutral-900/90 border border-neutral-800/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-neutral-300 text-[11px]">Cut Rule (Perimeter)</span>
            </div>
            <div className="text-right">
              <span className="text-white font-bold block">{stats.cutRuleLengthM.toFixed(2)} m</span>
              <span className="text-[10px] text-neutral-500">{stats.cutRuleLengthIn.toFixed(1)} in</span>
            </div>
          </div>

          {/* Crease score */}
          <div className="flex items-center justify-between p-2 rounded bg-neutral-900/90 border border-neutral-800/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span className="text-neutral-300 text-[11px]">Crease Rule (Scores)</span>
            </div>
            <div className="text-right">
              <span className="text-white font-bold block">{stats.creaseRuleLengthM.toFixed(2)} m</span>
              <span className="text-[10px] text-neutral-500">{stats.creaseRuleLengthIn.toFixed(1)} in</span>
            </div>
          </div>

          {/* Total Rule */}
          <div className="flex items-center justify-between p-2 rounded bg-neutral-900/90 border border-neutral-700/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-white font-semibold text-[11px]">Total Die Steel</span>
            </div>
            <div className="text-right">
              <span className="text-amber-300 font-bold block">{stats.totalRuleLengthM.toFixed(2)} m</span>
              <span className="text-[10px] text-neutral-500">{stats.totalRuleLengthIn.toFixed(1)} in</span>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-neutral-500 leading-tight">
          Total linear steel knife rule required to fabricate a flatbed cutting die tooling board.
        </p>
      </div>

      {/* Material Weight & Yield Calculator */}
      <div className="bg-neutral-950/40 p-3 rounded-lg border border-neutral-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-neutral-300 font-semibold text-[11px]">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span>Weight & Commercial Yield</span>
          </div>
          <span className="font-mono text-neutral-400 text-[10px]">
            {stats.estimatedGsm} g/m²
          </span>
        </div>

        {/* GSM basis weight slider */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>Paperboard Grammage (GSM)</span>
            <span className="font-mono text-white">{stats.estimatedGsm} gsm</span>
          </div>
          <input
            type="range"
            min="150"
            max="600"
            step="10"
            value={stats.estimatedGsm}
            onChange={(e) => setCustomGsm(parseInt(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <div className="flex justify-between text-[9px] font-mono text-neutral-500">
            <span>180 (Light)</span>
            <span>300 (Standard)</span>
            <span>450 (Heavy)</span>
            <span>600 (Corrugated)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
          <div className="bg-neutral-900/90 p-2 rounded border border-neutral-800/60">
            <span className="text-neutral-500 text-[10px] block">SINGLE BLANK WEIGHT</span>
            <span className="text-white font-bold text-sm block">
              {stats.blankWeightGrams.toFixed(1)} g
            </span>
            <span className="text-[10px] text-neutral-500">
              {(stats.blankWeightGrams * 0.035274).toFixed(2)} oz
            </span>
          </div>

          <div className="bg-neutral-900/90 p-2 rounded border border-neutral-800/60">
            <span className="text-neutral-500 text-[10px] block">ESTIMATED YIELD</span>
            <span className="text-white font-bold text-sm block">
              {stats.blanksPerKilogram} pcs/kg
            </span>
            <span className="text-[10px] text-neutral-500">
              ~{stats.blanksPerMetricTon.toLocaleString()} / tonne
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
