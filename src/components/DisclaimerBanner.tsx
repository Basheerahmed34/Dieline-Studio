import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronRight, FileCheck, ShieldCheck, X } from 'lucide-react';

interface DisclaimerBannerProps {
  onOpenVerification: () => void;
  isVerified: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  onOpenVerification,
  isVerified,
}) => {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem('dieline_engineering_notice_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('dieline_engineering_notice_dismissed', 'true');
    } catch {}
  };

  if (dismissed && !isVerified) return null;

  if (isVerified) {
    return (
      <div className="bg-emerald-950/70 border-b border-emerald-800/50 text-emerald-200 px-4 py-1.5 text-xs flex items-center justify-between gap-3 shrink-0 animate-in fade-in duration-150">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="font-semibold text-emerald-300">Engineering Notice Solved:</strong> Physical prototype, printer tolerances, board caliper, and folding allowances are verified and calibrated.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVerification}
            className="px-2.5 py-0.5 rounded bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-700/60 text-emerald-200 font-medium text-[11px] transition-colors cursor-pointer"
          >
            Review Verification
          </button>
          <button
            onClick={handleDismiss}
            className="text-emerald-400/80 hover:text-emerald-200 transition-colors p-1"
            title="Dismiss verified banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-950/70 border-b border-amber-800/50 text-amber-200 px-4 py-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="leading-snug">
          <strong className="font-semibold text-amber-300">Packaging Engineering Notice:</strong> Generated dielines are structural parametric vector models. Before commercial production or die tooling, verify against printer tolerances, board caliper, folding allowances, and produce a physical prototype.
        </span>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <button
          onClick={onOpenVerification}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors shadow-xs cursor-pointer active:scale-98"
        >
          <span>Solve &amp; Verify Prototype</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleDismiss}
          className="text-amber-400 hover:text-amber-200 transition-colors p-1 rounded hover:bg-amber-900/50 cursor-pointer"
          title="Dismiss notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
