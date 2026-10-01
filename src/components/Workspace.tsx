import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Compass,
  Eye,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  DielineGeometry,
  DimensionValues,
  LayerVisibility,
  TechnicalSettings,
  Unit,
} from '../types/dieline';
import { formatMeasurement } from '../engine/geometry';
import { Rulers } from './Rulers';

interface WorkspaceProps {
  geometry: DielineGeometry;
  dimensions: DimensionValues;
  settings: TechnicalSettings;
  layers: LayerVisibility;
  unit: Unit;
  theme: 'dark' | 'light';
  onFitRequestRef?: React.MutableRefObject<(() => void) | null>;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  geometry,
  dimensions,
  settings,
  layers,
  unit,
  theme,
  onFitRequestRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number } | null>(null);

  // Resize observer for container
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Fit to screen function
  const fitToScreen = useCallback(() => {
    const { bounds } = geometry;
    const margin = 40;
    const availW = Math.max(100, containerSize.width - margin * 2 - (layers.rulers ? 22 : 0));
    const availH = Math.max(100, containerSize.height - margin * 2 - (layers.rulers ? 22 : 0));

    const scaleX = availW / bounds.width;
    const scaleY = availH / bounds.height;
    const newZoom = Math.min(Math.max(0.1, Math.min(scaleX, scaleY)), 4.0);

    // Center in container
    const rulerOffset = layers.rulers ? 22 : 0;
    const newPanX = (containerSize.width - rulerOffset - bounds.width * newZoom) / 2 - bounds.minX * newZoom + rulerOffset;
    const newPanY = (containerSize.height - rulerOffset - bounds.height * newZoom) / 2 - bounds.minY * newZoom + rulerOffset;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  }, [geometry, containerSize, layers.rulers]);

  // Expose fitToScreen to parent ref
  useEffect(() => {
    if (onFitRequestRef) {
      onFitRequestRef.current = fitToScreen;
    }
  }, [fitToScreen, onFitRequestRef]);

  // Initial fit on mount or when template bounds drastically change
  useEffect(() => {
    fitToScreen();
  }, [geometry.bounds.width, geometry.bounds.height, containerSize.width, containerSize.height]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const nextZoom = Math.min(Math.max(0.08, zoom * zoomFactor), 8.0);

    // Zoom centered at mouse position
    const nextPanX = mouseX - (mouseX - pan.x) * (nextZoom / zoom);
    const nextPanY = mouseY - (mouseY - pan.y) * (nextZoom / zoom);

    setZoom(nextZoom);
    setPan({ x: nextPanX, y: nextPanY });
  };

  // Drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click or middle click
    if (e.button === 0 || e.button === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Drag move
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseCanvasX = (e.clientX - rect.left - pan.x) / zoom;
      const mouseCanvasY = (e.clientY - rect.top - pan.y) / zoom;
      setMouseCoord({ x: mouseCanvasX, y: mouseCanvasY });
    }

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const touchStartRef = useRef<{ dist: number; pan: { x: number; y: number } } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    } else if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      touchStartRef.current = { dist, pan: { ...pan } };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchStartRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const factor = dist / touchStartRef.current.dist;
      setZoom((z) => Math.min(Math.max(0.1, z * (factor > 1 ? 1.03 : 0.97)), 6));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartRef.current = null;
  };

  // Theme-specific colors: Blue, Yellow, and White CAD Theme
  const isDark = theme === 'dark';
  const isBlueYellowWhite = settings.colorScheme === 'blue-yellow-white' || settings.colorScheme === undefined || true;

  // Precision CAD Colors: White (Cut), Yellow (Crease), Blue (Bleed / Bless Area)
  const cutStroke = isBlueYellowWhite
    ? (isDark ? '#FFFFFF' : '#0F172A')
    : (isDark ? '#F43F5E' : '#E11D48'); // Die Cut
  const creaseStroke = isBlueYellowWhite
    ? '#FACC15' // Vibrant Yellow Crease
    : (isDark ? '#38BDF8' : '#0284C7');
  const bleedStroke = isBlueYellowWhite
    ? '#3B82F6' // Electric Blue Bleed ("Bless Area")
    : (isDark ? '#34D399' : '#059669');
  const safeStroke = isBlueYellowWhite
    ? '#60A5FA' // Soft Blue Safe Margin
    : (isDark ? '#64748B' : '#94A3B8');
  const dimStroke = isBlueYellowWhite
    ? (isDark ? '#F1F5F9' : '#0F172A')
    : (isDark ? '#E2E8F0' : '#0F172A');
  const canvasBg = isDark ? 'bg-[#090e1a]' : 'bg-slate-100';

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDragging(false);
        setMouseCoord(null);
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative flex-1 h-full w-full overflow-hidden select-none cursor-grab active:cursor-grabbing ${canvasBg} ${
        layers.grid ? (isDark ? 'cad-grid-pattern' : 'cad-grid-pattern-light') : ''
      }`}
    >
      {/* CAD Rulers */}
      {layers.rulers && (
        <Rulers
          width={containerSize.width}
          height={containerSize.height}
          zoom={zoom}
          panX={pan.x}
          panY={pan.y}
          unit={unit}
        />
      )}

      {/* Main SVG Vector Canvas */}
      <svg
        className="w-full h-full absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          <pattern
            id="workspace-glue-hatch"
            width="8"
            height="8"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke={isDark ? '#CA8A04' : '#EAB308'} strokeWidth="1.2" />
          </pattern>
          <marker
            id="ws-arrow-start"
            viewBox="0 0 10 10"
            refX="2"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 5 L 8 2 L 6 5 L 8 8 z" fill={dimStroke} />
          </marker>
          <marker
            id="ws-arrow-end"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 2 L 8 5 L 0 8 L 2 5 z" fill={dimStroke} />
          </marker>
        </defs>

        {/* 1. Bleed Layer */}
        {layers.bleed && geometry.bleedPath && (
          <path
            d={geometry.bleedPath}
            fill="none"
            stroke={bleedStroke}
            strokeWidth="0.5"
            strokeDasharray="3,3"
            opacity="0.8"
          />
        )}

        {/* 2. Safe Area Layer */}
        {layers.safeArea && geometry.safeAreaPath && (
          <path
            d={geometry.safeAreaPath}
            fill="none"
            stroke={safeStroke}
            strokeWidth="0.4"
            strokeDasharray="2,2"
            opacity="0.7"
          />
        )}

        {/* 3. Glue Flaps */}
        {layers.glue &&
          geometry.glueFlapPaths &&
          geometry.glueFlapPaths.map((p, idx) => (
            <path
              key={`glue-${idx}`}
              d={p}
              fill="url(#workspace-glue-hatch)"
              stroke="#EAB308"
              strokeWidth="0.4"
              opacity="0.7"
            />
          ))}

        {/* 4. Crease Lines Layer (Dashed) */}
        {layers.crease && geometry.creasePath && (
          <path
            d={geometry.creasePath}
            fill="none"
            stroke={creaseStroke}
            strokeWidth="0.6"
            strokeDasharray="4,3"
          />
        )}

        {/* 5. Cut Lines Layer (Solid) */}
        {layers.cut && geometry.cutPath && (
          <path
            d={geometry.cutPath}
            fill="none"
            stroke={cutStroke}
            strokeWidth="0.8"
          />
        )}

        {/* 6. Dimensions Callouts */}
        {layers.dimensions &&
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
                  stroke={dimStroke}
                  strokeWidth="0.4"
                  markerStart="url(#ws-arrow-start)"
                  markerEnd="url(#ws-arrow-end)"
                  opacity="0.85"
                />
                <text
                  x={midX}
                  y={midY}
                  textAnchor="middle"
                  fill={dimStroke}
                  fontSize="4.2"
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight="500"
                  className="select-none"
                >
                  {dim.label}: {formatMeasurement(dim.valueMm, unit)}
                </text>
              </g>
            );
          })}

        {/* 7. Text Annotations & Panel Labels */}
        {layers.annotations &&
          geometry.annotations.map((ann, idx) => (
            <text
              key={idx}
              x={ann.x}
              y={ann.y}
              textAnchor="middle"
              fill={isDark ? '#94A3B8' : '#64748B'}
              fontSize={ann.fontSize || 3.8}
              fontFamily="'Plus Jakarta Sans', sans-serif"
              fontWeight="600"
              letterSpacing="0.05em"
              opacity="0.8"
              className="select-none"
            >
              {ann.text}
            </text>
          ))}
      </svg>

      {/* Precision CAD Color Theme Indicator (White, Yellow, Blue) */}
      <div className="absolute top-4 left-4 hidden sm:flex items-center gap-3 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-300 z-10 shadow-lg">
        <span className="text-neutral-400 font-semibold">Color Theme:</span>
        <span className="flex items-center gap-1.5 text-white">
          <span className="w-2.5 h-1 bg-white rounded-full shadow-xs" /> Cut (White)
        </span>
        <span className="flex items-center gap-1.5 text-yellow-400">
          <span className="w-2.5 h-1 bg-yellow-400 rounded-full" /> Crease (Yellow)
        </span>
        <span className="flex items-center gap-1.5 text-blue-400">
          <span className="w-2.5 h-1 bg-blue-500 rounded-full" /> Bleed (Blue)
        </span>
      </div>

      {/* Floating CAD HUD Controls on bottom-left */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-neutral-900/90 backdrop-blur-md p-1 rounded-lg border border-neutral-800 text-neutral-300 shadow-lg z-10 text-xs">
        <button
          onClick={() => {
            const nextZ = Math.min(zoom * 1.25, 8.0);
            setZoom(nextZ);
          }}
          className="p-1.5 hover:bg-neutral-800 hover:text-white rounded transition-colors"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            const nextZ = Math.max(zoom * 0.8, 0.1);
            setZoom(nextZ);
          }}
          className="p-1.5 hover:bg-neutral-800 hover:text-white rounded transition-colors"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            setZoom(1.0);
          }}
          className="px-2 py-1 hover:bg-neutral-800 hover:text-white rounded font-mono text-[11px] tabular-nums transition-colors"
          title="Actual 1:1 Scale"
        >
          {Math.round(zoom * 100)}%
        </button>

        <div className="w-[1px] h-4 bg-neutral-700 mx-0.5" />

        <button
          onClick={fitToScreen}
          className="p-1.5 hover:bg-neutral-800 hover:text-white rounded transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            setPan({ x: 0, y: 0 });
            setZoom(1.0);
          }}
          className="p-1.5 hover:bg-neutral-800 hover:text-white rounded transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Real-time CAD status bar on bottom-right */}
      <div className="absolute bottom-4 right-4 hidden sm:flex items-center gap-3 bg-neutral-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-800 text-[11px] font-mono text-neutral-400 tabular-nums z-10 shadow-lg">
        {mouseCoord && (
          <div>
            <span>X: </span>
            <span className="text-neutral-200">{formatMeasurement(mouseCoord.x, unit, 0)}</span>
            <span className="ml-2">Y: </span>
            <span className="text-neutral-200">{formatMeasurement(mouseCoord.y, unit, 0)}</span>
          </div>
        )}
        <div className="w-[1px] h-3 bg-neutral-700" />
        <div>
          <span>Flat Area: </span>
          <span className="text-neutral-200">
            {formatMeasurement(geometry.bounds.width, unit, 0)} × {formatMeasurement(geometry.bounds.height, unit, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};
