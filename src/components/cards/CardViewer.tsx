import React, { useState } from 'react';
import { 
  RotateCw, ZoomIn, ZoomOut, Maximize2, Minimize2, Sparkles, 
  Layers, Eye, ShieldCheck, Crosshair, Grid, Sliders, CheckCircle2,
  Columns, RefreshCw, AlertCircle
} from 'lucide-react';
import { InteractiveCard } from './InteractiveCard';
import { CardComparisonSlider } from './CardComparisonSlider';
import { HoloPatternType, HOLO_PATTERNS } from '../../lib/visualConfig';

export interface CardViewerProps {
  frontImage: string;
  backImage?: string;
  referenceImage?: string;
  name?: string;
  set?: string;
  cardNumber?: string;
  variant?: string;
  grade?: number | string;
  certificationNumber?: string;
  className?: string;
  annotations?: Array<{ id: string; x: number; y: number; type: string; note?: string }>;
  onAddAnnotation?: (x: number, y: number) => void;
}

export type InspectionOverlayMode = 'none' | 'centering' | 'corners' | 'edges' | 'defects';
export type ForensicFilterMode = 'normal' | 'high_contrast' | 'inverted' | 'edge_enhance';

export const CardViewer: React.FC<CardViewerProps> = ({
  frontImage,
  backImage = 'https://images.pokemontcg.io/base1/back.png',
  referenceImage,
  name = 'Card Specimen',
  set = '',
  cardNumber = '',
  variant = 'Holo Rare',
  grade,
  certificationNumber,
  className = '',
  annotations = [],
  onAddAnnotation
}) => {
  // State
  const [isFlipped, setIsFlipped] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [holoPattern, setHoloPattern] = useState<HoloPatternType>('classic');
  const [tiltEnabled, setTiltEnabled] = useState(true);
  const [overlayMode, setOverlayMode] = useState<InspectionOverlayMode>('none');
  const [filterMode, setFilterMode] = useState<ForensicFilterMode>('normal');
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter styles
  const getFilterStyle = () => {
    switch (filterMode) {
      case 'high_contrast':
        return 'contrast(175%) brightness(105%)';
      case 'inverted':
        return 'invert(100%) hue-rotate(180deg)';
      case 'edge_enhance':
        return 'contrast(200%) grayscale(100%)';
      case 'normal':
      default:
        return 'none';
    }
  };

  const handleCardSurfaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (overlayMode === 'defects' && onAddAnnotation) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
      const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
      onAddAnnotation(x, y);
    }
  };

  return (
    <div className={`flex flex-col items-center bg-[#070c18] border border-cyan-900/60 rounded-3xl p-4 sm:p-6 shadow-2xl relative ${isFullscreen ? 'fixed inset-0 z-[99999] rounded-none m-0 overflow-y-auto' : ''} ${className}`}>
      
      {/* Top Controls Toolbar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        
        {/* Card Identification Tag */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider">
                VCA FORENSIC CARD VIEWER
              </span>
              {grade && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-black border border-amber-500/40">
                  GRADE {grade}
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-xs">
              {name}
            </h3>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Flip 180° */}
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition"
          >
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isFlipped ? 'SHOW FRONT' : 'SHOW BACK'}</span>
          </button>

          {/* Comparison Mode Toggle */}
          {referenceImage && (
            <button
              onClick={() => setIsComparisonMode(!isComparisonMode)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                isComparisonMode 
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20' 
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{isComparisonMode ? 'CARD VIEW' : 'OPTICAL DIFF'}</span>
            </button>
          )}

          {/* 3D Tilt Toggle */}
          <button
            onClick={() => setTiltEnabled(!tiltEnabled)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono transition ${
              tiltEnabled 
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title="Toggle 3D Hover Tilt"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mode Sub-Bar: Inspection Overlays & Optical Filters */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 py-3 text-xs font-mono border-b border-slate-800/80">
        
        {/* Inspection Overlays */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">OVERLAY:</span>
          {(['none', 'centering', 'corners', 'edges', 'defects'] as InspectionOverlayMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setOverlayMode(mode)}
              className={`px-2 py-1 rounded-lg uppercase text-[10px] font-bold transition ${
                overlayMode === mode
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Holo Pattern Selector */}
        {!isComparisonMode && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">FOIL:</span>
            <select
              value={holoPattern}
              onChange={(e) => setHoloPattern(e.target.value as HoloPatternType)}
              className="bg-slate-900 border border-slate-700 text-cyan-300 text-[11px] font-mono rounded-lg px-2 py-1 outline-none font-bold"
            >
              {HOLO_PATTERNS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Forensic Filter Modes */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider mr-1">FILTER:</span>
          {(['normal', 'high_contrast', 'inverted'] as ForensicFilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilterMode(f)}
              className={`px-2 py-1 rounded-lg uppercase text-[10px] font-bold transition ${
                filterMode === f
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-8 min-h-[440px] relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {isComparisonMode && referenceImage ? (
          /* COMPARISON SLIDER VIEW */
          <CardComparisonSlider
            beforeImage={frontImage}
            afterImage={referenceImage}
            beforeLabel="SUBMITTED SCAN"
            afterLabel="CANONICAL MASTER"
          />
        ) : (
          /* 3D INTERACTIVE CARD VIEW */
          <div 
            onClick={handleCardSurfaceClick}
            style={{ 
              transform: `scale(${zoomLevel})`, 
              filter: getFilterStyle(),
              transition: 'transform 0.2s ease-out, filter 0.2s ease-out' 
            }}
            className="relative w-72 sm:w-80 aspect-[2.5/3.5] flex items-center justify-center"
          >
            <InteractiveCard
              frontImage={frontImage}
              backImage={backImage}
              name={name}
              set={set}
              cardNumber={cardNumber}
              variant={variant}
              holoPattern={holoPattern}
              isFlipped={isFlipped}
              disabledTilt={!tiltEnabled}
              showBadges={true}
              className="w-full h-full"
            >
              {/* Inspection Overlays */}
              {overlayMode === 'centering' && (
                <div className="absolute inset-0 pointer-events-none z-30 border-2 border-cyan-400/80 grid grid-cols-10 grid-rows-10">
                  <div className="col-span-1 border-r border-cyan-400/50 bg-cyan-500/10" />
                  <div className="col-span-8 border-r border-cyan-400/50" />
                  <div className="col-span-1 bg-cyan-500/10" />
                  <div className="absolute inset-x-0 top-0 h-[10%] bg-cyan-500/10 border-b border-cyan-400/50" />
                  <div className="absolute inset-x-0 bottom-0 h-[10%] bg-cyan-500/10 border-t border-cyan-400/50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="px-2 py-1 rounded bg-slate-950/90 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/60 shadow-lg">
                      FRONT: 54 / 46 (PSA 10 RANGE)
                    </span>
                  </div>
                </div>
              )}

              {overlayMode === 'corners' && (
                <div className="absolute inset-0 pointer-events-none z-30">
                  {/* Four Corner Brackets */}
                  <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <div className="absolute top-3 left-12 text-[9px] font-mono bg-emerald-950/90 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                    C1: 9.8 (NO WHITENING)
                  </div>
                </div>
              )}

              {overlayMode === 'edges' && (
                <div className="absolute inset-0 pointer-events-none z-30 border-2 border-dashed border-cyan-400/70 p-1">
                  <div className="absolute inset-0 bg-cyan-400/5" />
                  <div className="absolute bottom-3 inset-x-0 text-center">
                    <span className="px-2 py-0.5 rounded bg-slate-950/90 border border-cyan-500 text-[9px] font-mono text-cyan-300 font-bold">
                      EDGE PROFILE: CRISP DIE-CUT
                    </span>
                  </div>
                </div>
              )}

              {/* Defect Annotation Pins */}
              {(overlayMode === 'defects' || annotations.length > 0) && (
                <div className="absolute inset-0 z-40 pointer-events-none">
                  {annotations.map((ann, idx) => (
                    <div
                      key={ann.id || idx}
                      style={{ top: `${ann.y}%`, left: `${ann.x}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-auto"
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-rose-400 bg-rose-500/40 flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-lg animate-pulse">
                        {idx + 1}
                      </div>
                      {ann.note && (
                        <span className="hidden group-hover:inline-block px-1.5 py-0.5 rounded bg-slate-950/90 text-rose-300 border border-rose-500/50 text-[9px] font-mono font-bold whitespace-nowrap">
                          {ann.note}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </InteractiveCard>
          </div>
        )}
      </div>

      {/* Bottom Zoom & Forensic Bar */}
      <div className="w-full flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[11px]">ZOOM:</span>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.8, Math.round((z - 0.2) * 10) / 10))}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-cyan-400 font-bold text-[11px] min-w-[40px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(2.5, Math.round((z + 0.2) * 10) / 10))}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-slate-200 border border-slate-800 transition"
          >
            RESET
          </button>
        </div>

        {overlayMode === 'defects' && (
          <div className="text-[11px] text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Click anywhere on card to annotate defect</span>
          </div>
        )}

        <div className="text-[11px] text-slate-400">
          DRAG MOUSE OR TOUCH TO TILT 3D
        </div>
      </div>
    </div>
  );
};
