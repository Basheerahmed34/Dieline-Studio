import React from 'react';
import { Unit } from '../types/dieline';
import { mmToUnit } from '../engine/geometry';

interface RulersProps {
  width: number;
  height: number;
  zoom: number;
  panX: number;
  panY: number;
  unit: Unit;
}

export const Rulers: React.FC<RulersProps> = ({
  width,
  height,
  zoom,
  panX,
  panY,
  unit,
}) => {
  const rulerThickness = 22; // px

  // Calculate step interval in mm based on zoom level
  let stepMm = 10;
  if (zoom < 0.3) stepMm = 100;
  else if (zoom < 0.8) stepMm = 50;
  else if (zoom < 2.0) stepMm = 20;
  else if (zoom < 5.0) stepMm = 10;
  else stepMm = 5;

  const stepPx = stepMm * zoom;

  // Horizontal ticks
  const startXmm = Math.floor(-panX / zoom / stepMm) * stepMm;
  const endXmm = Math.ceil((width - panX) / zoom / stepMm) * stepMm;
  const hTicks: { x: number; val: number }[] = [];
  for (let mm = startXmm; mm <= endXmm; mm += stepMm) {
    const screenX = panX + mm * zoom;
    if (screenX >= rulerThickness && screenX <= width) {
      hTicks.push({ x: screenX, val: mm });
    }
  }

  // Vertical ticks
  const startYmm = Math.floor(-panY / zoom / stepMm) * stepMm;
  const endYmm = Math.ceil((height - panY) / zoom / stepMm) * stepMm;
  const vTicks: { y: number; val: number }[] = [];
  for (let mm = startYmm; mm <= endYmm; mm += stepMm) {
    const screenY = panY + mm * zoom;
    if (screenY >= rulerThickness && screenY <= height) {
      vTicks.push({ y: screenY, val: mm });
    }
  }

  const formatTickLabel = (valMm: number) => {
    const val = mmToUnit(valMm, unit);
    if (unit === 'in') return val.toFixed(1);
    if (unit === 'cm') return val.toFixed(0);
    return Math.round(val).toString();
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 font-mono text-[9px] text-neutral-400">
      {/* Corner origin square */}
      <div
        className="absolute top-0 left-0 bg-neutral-900 border-r border-b border-neutral-700/80 flex items-center justify-center font-semibold text-neutral-400"
        style={{ width: rulerThickness, height: rulerThickness }}
      >
        {unit}
      </div>

      {/* Top horizontal ruler */}
      <div
        className="absolute top-0 left-0 right-0 bg-neutral-900/90 backdrop-blur-xs border-b border-neutral-700/80 overflow-hidden"
        style={{ height: rulerThickness, marginLeft: rulerThickness }}
      >
        {hTicks.map((t, idx) => (
          <div
            key={idx}
            className="absolute top-0 bottom-0 flex flex-col justify-end"
            style={{ left: t.x - rulerThickness }}
          >
            <span className="leading-none px-1 text-[8px] tabular-nums text-neutral-400 font-medium">
              {formatTickLabel(t.val)}
            </span>
            <div className="w-[1px] h-[6px] bg-neutral-600" />
          </div>
        ))}
      </div>

      {/* Left vertical ruler */}
      <div
        className="absolute top-0 bottom-0 left-0 bg-neutral-900/90 backdrop-blur-xs border-r border-neutral-700/80 overflow-hidden"
        style={{ width: rulerThickness, marginTop: rulerThickness }}
      >
        {vTicks.map((t, idx) => (
          <div
            key={idx}
            className="absolute left-0 right-0 flex items-center justify-end"
            style={{ top: t.y - rulerThickness }}
          >
            <span className="leading-none pr-1 text-[8px] tabular-nums text-neutral-400 font-medium transform -rotate-90 origin-right">
              {formatTickLabel(t.val)}
            </span>
            <div className="h-[1px] w-[6px] bg-neutral-600" />
          </div>
        ))}
      </div>
    </div>
  );
};
