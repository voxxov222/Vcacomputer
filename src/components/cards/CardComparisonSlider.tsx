import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeftRight, ZoomIn, ZoomOut, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';

export interface CardComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  beforeBadge?: string;
  afterBadge?: string;
  className?: string;
  aspectRatio?: string;
  showZoomControls?: boolean;
}

export const CardComparisonSlider: React.FC<CardComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'RAW SPECIMEN',
  afterLabel = 'CANONICAL MASTER',
  beforeBadge = 'Scan Layer',
  afterBadge = 'Master Print',
  className = '',
  aspectRatio = '2.5 / 3.5',
  showZoomControls = true
}) => {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateSlider(e.clientX);
  };

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(Math.round(pos * 10) / 10);
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      updateSlider(e.clientX);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Visual Workspace Frame */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative w-full max-w-[380px] rounded-2xl overflow-hidden bg-slate-950 border border-cyan-500/40 shadow-2xl cursor-ew-resize group"
        style={{ aspectRatio }}
      >
        {/* Layer 1: AFTER / RIGHT / ENHANCED IMAGE */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <img
            src={afterImage}
            alt={afterLabel}
            className="w-full h-full object-contain pointer-events-none p-1"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.pokemontcg.io/swsh12pt5gg/GG18_hires.png';
            }}
          />
          {/* Subtle grid on after layer */}
          <div className="absolute inset-0 bg-cyan-500/5 mix-blend-overlay pointer-events-none" />
        </div>

        {/* Layer 2: BEFORE / LEFT / RAW SPECIMEN (Clipped to sliderPos) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{
            clipPath: `polygon(0% 0%, ${sliderPos}% 0%, ${sliderPos}% 100%, 0% 100%)`,
            transform: `scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="w-full h-full object-contain pointer-events-none p-1"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.pokemontcg.io/base1/4_hires.png';
            }}
          />
        </div>

        {/* Draggable Divider Bar */}
        <div
          className="absolute top-0 bottom-0 z-30 w-1 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)] -translate-x-1/2 flex items-center justify-center pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          {/* Center Handle Puck */}
          <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-xl">
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Top Badges for Left / Right distinction */}
        <div className="absolute top-3 left-3 z-20 pointer-events-none">
          <span className="px-2 py-0.5 rounded-lg bg-slate-950/90 backdrop-blur-md border border-slate-700 text-slate-300 font-mono text-[9px] font-bold shadow-md">
            {beforeLabel}
          </span>
        </div>
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <span className="px-2 py-0.5 rounded-lg bg-cyan-950/90 backdrop-blur-md border border-cyan-500/50 text-cyan-300 font-mono text-[9px] font-bold shadow-md">
            {afterLabel}
          </span>
        </div>

        {/* Bottom Percentage Pill */}
        <div className="absolute bottom-3 inset-x-0 flex justify-center z-20 pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono text-cyan-300 shadow-lg">
            SPLIT: {sliderPos}%
          </span>
        </div>
      </div>

      {/* Synchronized Zoom and Reset Controls */}
      {showZoomControls && (
        <div className="mt-3 flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono">
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-cyan-400 font-bold px-1">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-3.5 bg-slate-800 mx-1" />
          <button
            onClick={() => {
              setZoom(1);
              setSliderPos(50);
            }}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1 text-[10px]"
            title="Reset"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET</span>
          </button>
        </div>
      )}
    </div>
  );
};
