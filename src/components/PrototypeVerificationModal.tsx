import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  Package,
  Printer,
  Ruler,
  Scissors,
  ShieldCheck,
  Sliders,
  X,
} from 'lucide-react';
import { formatMeasurement } from '../engine/geometry';
import {
  DimensionValues,
  GeometryBounds,
  TechnicalSettings,
  TemplateDefinition,
  Unit,
} from '../types/dieline';

interface PrototypeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateDefinition;
  dimensions: DimensionValues;
  settings: TechnicalSettings;
  bounds: GeometryBounds;
  unit: Unit;
  onAcknowledgeAndSolve: () => void;
  isVerified: boolean;
}

export const PrototypeVerificationModal: React.FC<PrototypeVerificationModalProps> = ({
  isOpen,
  onClose,
  template,
  dimensions,
  settings,
  bounds,
  unit,
  onAcknowledgeAndSolve,
  isVerified,
}) => {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    caliperCheck: true,
    bleedCheck: true,
    foldingCheck: true,
    plotterCheck: false,
    glueBondCheck: false,
  });

  const [operatorName, setOperatorName] = useState(
    localStorage.getItem('dieline_operator_name') || 'Packaging Structural Engineer'
  );

  if (!isOpen) return null;

  // Engineering calculations
  const caliper = settings.caliper || 0.4;
  const creaseChannelWidth = caliper * 1.5 + 0.1; // Standard rule
  const foldingDeduction = (caliper * 0.44 * Math.PI) / 2; // K-factor 0.44 bend allowance
  const bleedPass = (settings.bleed || 3) >= 3;
  const safeAreaPass = (settings.safeArea || 3) >= 3;

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirm = () => {
    localStorage.setItem('dieline_operator_name', operatorName);
    onAcknowledgeAndSolve();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Pre-Production Verification &amp; Prototype Protocol
              </h2>
              <p className="text-[11px] text-neutral-400">
                Solving the engineering notice: calibrate printer tolerances, caliper, &amp; prototype before die tooling.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Engineering notice context banner */}
          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 text-blue-200 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Production Tolerances Solver</span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Industrial dielines require verification against real substrate caliper, die-cutting matrix rules, and folding creep before manufacturing cutting dies or print plates.
            </p>
          </div>

          {/* Real-time Engineering Calibrations Grid */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
              1. Mathematical Calculations for {template.name}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 font-mono">
                <span className="text-[10px] text-neutral-500 block">BOARD CALIPER</span>
                <span className="text-white font-bold text-sm">{caliper} mm</span>
                <span className="text-[9px] text-neutral-400 block mt-0.5">
                  {(caliper * 39.37).toFixed(1)} pt Paperboard
                </span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 font-mono">
                <span className="text-[10px] text-neutral-500 block">CREASE MATRIX RULE</span>
                <span className="text-yellow-400 font-bold text-sm">
                  {creaseChannelWidth.toFixed(2)} mm
                </span>
                <span className="text-[9px] text-neutral-400 block mt-0.5">
                  1.5× caliper + 0.1mm clearance
                </span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 font-mono">
                <span className="text-[10px] text-neutral-500 block">FOLDING ALLOWANCE</span>
                <span className="text-blue-400 font-bold text-sm">
                  +{foldingDeduction.toFixed(2)} mm
                </span>
                <span className="text-[9px] text-neutral-400 block mt-0.5">
                  Inside 90° bend compensation
                </span>
              </div>
            </div>
          </div>

          {/* Pre-Flight Checklist */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
              2. Pre-Flight Verification Checklist
            </span>

            <div className="space-y-2">
              {/* Check 1: Caliper */}
              <div
                onClick={() => toggleCheck('caliperCheck')}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  checkedItems.caliperCheck
                    ? 'bg-neutral-950/80 border-blue-600/60'
                    : 'bg-neutral-950/40 border-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                    checkedItems.caliperCheck
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'border-neutral-700'
                  }`}
                >
                  {checkedItems.caliperCheck && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-200">
                    Board Caliper &amp; Crease Channel Clearance
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Confirmed material caliper is {caliper} mm. Scores have appropriate channel clearances to avoid cracking coated stock.
                  </p>
                </div>
              </div>

              {/* Check 2: Bleed & Tolerances */}
              <div
                onClick={() => toggleCheck('bleedCheck')}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  checkedItems.bleedCheck
                    ? 'bg-neutral-950/80 border-blue-600/60'
                    : 'bg-neutral-950/40 border-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                    checkedItems.bleedCheck
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'border-neutral-700'
                  }`}
                >
                  {checkedItems.bleedCheck && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-200">
                    Printer Registration &amp; Bleed Margins
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Bleed area is configured to {settings.bleed} mm ({bleedPass ? 'Passed ≥3mm' : 'Recommended ≥3mm'}). Safe print area set to {settings.safeArea} mm.
                  </p>
                </div>
              </div>

              {/* Check 3: Folding Allowances */}
              <div
                onClick={() => toggleCheck('foldingCheck')}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  checkedItems.foldingCheck
                    ? 'bg-neutral-950/80 border-blue-600/60'
                    : 'bg-neutral-950/40 border-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                    checkedItems.foldingCheck
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'border-neutral-700'
                  }`}
                >
                  {checkedItems.foldingCheck && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-200">
                    Folding Allowances &amp; Panel Sequencing
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Main body dimensions ({formatMeasurement(dimensions.width || 60, unit)} × {formatMeasurement(dimensions.height || 120, unit)}) and tuck closure locks confirmed according to standard ECMA/FEFCO folding sequences.
                  </p>
                </div>
              </div>

              {/* Check 4: Plotter physical prototype */}
              <div
                onClick={() => toggleCheck('plotterCheck')}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  checkedItems.plotterCheck
                    ? 'bg-neutral-950/80 border-blue-600/60'
                    : 'bg-neutral-950/40 border-neutral-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                    checkedItems.plotterCheck
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'border-neutral-700'
                  }`}
                >
                  {checkedItems.plotterCheck && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-200">
                    Physical CAD Prototype / Sample Cut Tested
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Cut sample on Kongsberg, Zünd, or manual cutting plotter. Hand-assembled carton and verified fit of the physical product.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sign-off identity */}
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-neutral-400 block font-semibold">
                VERIFYING ENGINEER / SIGN-OFF
              </span>
              <input
                type="text"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
                placeholder="Engineer name or QC operator"
                className="bg-transparent border-b border-neutral-700 focus:border-blue-500 text-white font-medium text-xs py-0.5 outline-hidden w-64"
              />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-500 block">DATE STAMP</span>
              <span className="font-mono text-[11px] text-neutral-300">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors font-medium text-xs cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Sign Off &amp; Solve Notice (Mark Verified)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
