import React, { useState, useMemo } from 'react';
import { ShieldCheck, Radio, QrCode, RotateCw, Lock, Award, CheckCircle2, Sparkles } from 'lucide-react';
import { useTilt, UseTiltOptions } from '../effects/TiltEffect';
import { CardGlare, CardFoil, CardReflection } from '../effects/HoloEffect';
import { HoloPatternType } from '../../lib/visualConfig';

export interface VCASlabProps {
  cardName: string;
  set?: string;
  cardNumber?: string;
  year?: number | string;
  frontImage: string;
  backImage?: string;
  grade?: number | string;
  gradeLabel?: string;
  subgrades?: {
    centering?: number;
    corners?: number;
    edges?: number;
    surface?: number;
  };
  certificationNumber?: string;
  serialNumber?: string;
  nfcId?: string;
  holoPattern?: HoloPatternType;
  isFlipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  className?: string;
  disabledTilt?: boolean;
}

export const VCASlab: React.FC<VCASlabProps> = ({
  cardName,
  set = 'Standard Set',
  cardNumber = '001/100',
  year = 2026,
  frontImage,
  backImage = 'https://images.pokemontcg.io/base1/back.png',
  grade = 10,
  gradeLabel = 'GEM MINT',
  subgrades = { centering: 10, corners: 9.5, edges: 10, surface: 9.5 },
  certificationNumber = 'VCA-2026-008492',
  serialNumber = 'SN-CRYPTO-948192',
  nfcId = 'NFC-VCA-7701',
  holoPattern = 'classic',
  isFlipped: controlledFlipped,
  onFlip,
  className = '',
  disabledTilt = false
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const flipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const { cardRef, tilt, handlers, config } = useTilt({
    disabled: disabledTilt,
    config: {
      maxAngle: 15,
      tiltFactor: 1.3,
      scaleFactor: 1.03
    }
  });

  const slabTransform = useMemo(() => {
    const scale = tilt.isHovered ? config.scaleFactor : 1;
    const baseRotationY = flipped ? 180 : 0;
    const finalRotY = tilt.rotateY + baseRotationY;
    const finalRotX = tilt.rotateX;

    return `perspective(1200px) rotateX(${finalRotX}deg) rotateY(${finalRotY}deg) scale3d(${scale}, ${scale}, ${scale})`;
  }, [tilt.isHovered, tilt.rotateX, tilt.rotateY, flipped, config.scaleFactor]);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 3D Orbit Canvas */}
      <div
        ref={cardRef}
        {...handlers}
        style={{
          transformStyle: 'preserve-3d',
          transform: slabTransform,
          transition: 'transform 0.15s ease-out'
        }}
        className="relative w-80 sm:w-88 aspect-[3/4.8] cursor-grab active:cursor-grabbing group"
      >
        {/* Dynamic Specular Acrylic Edge Highlight */}
        <div
          className="absolute inset-0 rounded-[28px] pointer-events-none z-40 transition-opacity duration-300"
          style={{
            boxShadow: tilt.isHovered
              ? `${-tilt.rotateY * 1.5}px ${tilt.rotateX * 1.5}px 35px -5px rgba(6, 182, 212, 0.45), 0 25px 60px -15px rgba(0,0,0,0.9), inset 0 0 0 2px rgba(255, 255, 255, 0.4), inset 0 0 16px rgba(255,255,255,0.15)`
              : '0 20px 45px -10px rgba(0,0,0,0.85), inset 0 0 0 1.5px rgba(255, 255, 255, 0.25)',
          }}
        />

        {/* FRONT SLAB FACE */}
        <div
          className="absolute inset-0 w-full h-full rounded-[26px] bg-slate-950/70 border-4 border-slate-300/40 p-3 flex flex-col justify-between backdrop-blur-2xl shadow-2xl backface-hidden overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg) translateZ(2px)',
          }}
        >
          {/* Acrylic Glass Surface Glare */}
          <CardGlare
            pointerX={tilt.pointerX}
            pointerY={tilt.pointerY}
            isHovered={tilt.isHovered}
            maxOpacity={0.45}
            className="z-35"
          />

          {/* Environmental Specular Sweep */}
          <CardReflection
            pointerX={tilt.pointerX}
            pointerY={tilt.pointerY}
            isHovered={tilt.isHovered}
            className="z-30"
          />

          {/* 1. TOP LABEL HEADER (Encapsulated Label) */}
          <div className="relative z-20 rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/50 p-2.5 shadow-inner overflow-hidden">
            {/* Holographic Security Foil Strip */}
            <div 
              className="absolute top-0 inset-x-0 h-1.5 opacity-90"
              style={{
                background: `linear-gradient(90deg, 
                  rgba(255,0,128,0.8) 0%, 
                  rgba(255,215,0,0.8) 25%, 
                  rgba(0,255,255,0.8) 50%, 
                  rgba(128,0,255,0.8) 75%, 
                  rgba(255,0,128,0.8) 100%
                )`,
                backgroundSize: '200% 100%',
                backgroundPosition: `${tilt.pointerX * 100}% 0%`,
                transition: 'background-position 0.1s linear'
              }}
            />

            <div className="flex items-start justify-between gap-2 mt-1">
              <div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] font-black font-mono tracking-widest text-cyan-300">
                    VCA VERIFIED
                  </span>
                  <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    ACRYLIC SLAB
                  </span>
                </div>
                <h4 className="text-xs font-black text-white truncate max-w-[170px] mt-0.5">
                  {cardName}
                </h4>
                <div className="text-[9px] text-slate-400 font-mono truncate">
                  {year} • {set} #{cardNumber}
                </div>
              </div>

              {/* Grade Callout */}
              <div className="text-right flex flex-col items-end shrink-0">
                <div className="text-2xl font-black font-['Orbitron',sans-serif] text-amber-400 leading-none tracking-tight">
                  {grade}
                </div>
                <div className="text-[8px] font-mono font-bold text-cyan-300 tracking-wider">
                  {gradeLabel}
                </div>
                <div className="text-[7.5px] text-slate-500 font-mono mt-0.5">
                  {certificationNumber}
                </div>
              </div>
            </div>
          </div>

          {/* 2. CENTER ENCAPSULATED CARD (Interior Cavity Depth) */}
          <div 
            className="relative z-10 flex-1 my-2 rounded-xl overflow-hidden bg-black border border-slate-800 shadow-[inset_0_0_16px_rgba(0,0,0,0.9)] flex items-center justify-center"
            style={{ transform: 'translateZ(10px)' }}
          >
            {/* Real Card Image */}
            <img
              src={frontImage}
              alt={cardName}
              className="w-full h-full object-contain pointer-events-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.pokemontcg.io/base1/4_hires.png";
              }}
            />

            {/* Encapsulated Holo Sheen on Card Surface */}
            <CardFoil
              pointerX={tilt.pointerX}
              pointerY={tilt.pointerY}
              isHovered={tilt.isHovered}
              pattern={holoPattern}
              intensity={0.65}
            />

            {/* Inner acrylic recess shadow */}
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] border border-white/10 rounded-xl" />
          </div>

          {/* 3. BOTTOM SLAB FOOTER (NFC & QR Chip) */}
          <div className="relative z-20 h-7 rounded-lg bg-slate-900/90 border border-slate-800 px-2.5 flex items-center justify-between text-[9px] font-mono text-slate-400 shadow-inner">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span className="font-bold">NFC: {nfcId}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <QrCode className="w-3 h-3 text-slate-400" />
              <span className="text-[8px] font-mono">{serialNumber.slice(0, 12)}</span>
            </div>
          </div>
        </div>

        {/* BACK SLAB FACE */}
        <div
          className="absolute inset-0 w-full h-full rounded-[26px] bg-slate-950/70 border-4 border-slate-300/40 p-3 flex flex-col justify-between backdrop-blur-2xl shadow-2xl backface-hidden overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(2px)',
          }}
        >
          {/* Acrylic Glass Surface Glare on Back */}
          <CardGlare
            pointerX={tilt.pointerX}
            pointerY={tilt.pointerY}
            isHovered={tilt.isHovered}
            maxOpacity={0.35}
            className="z-35"
          />

          {/* TOP BACK LABEL: Subgrade Breakdown & Cryptographic Audit */}
          <div className="relative z-20 rounded-xl bg-slate-900/95 border border-slate-700 p-2.5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5">
              <span className="text-[10px] font-bold font-mono text-cyan-400 uppercase">
                Official Subgrades
              </span>
              <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/40">
                LEDGER VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1 text-center font-mono">
              <div className="bg-slate-950/80 p-1 rounded border border-slate-800">
                <div className="text-[7.5px] text-slate-400">CENTER</div>
                <div className="text-[11px] font-bold text-cyan-300">{subgrades.centering || 10}</div>
              </div>
              <div className="bg-slate-950/80 p-1 rounded border border-slate-800">
                <div className="text-[7.5px] text-slate-400">CORNERS</div>
                <div className="text-[11px] font-bold text-cyan-300">{subgrades.corners || 9.5}</div>
              </div>
              <div className="bg-slate-950/80 p-1 rounded border border-slate-800">
                <div className="text-[7.5px] text-slate-400">EDGES</div>
                <div className="text-[11px] font-bold text-cyan-300">{subgrades.edges || 10}</div>
              </div>
              <div className="bg-slate-950/80 p-1 rounded border border-slate-800">
                <div className="text-[7.5px] text-slate-400">SURFACE</div>
                <div className="text-[11px] font-bold text-cyan-300">{subgrades.surface || 9.5}</div>
              </div>
            </div>
          </div>

          {/* Real Card Back */}
          <div 
            className="relative z-10 flex-1 my-2 rounded-xl overflow-hidden bg-black border border-slate-800 shadow-[inset_0_0_16px_rgba(0,0,0,0.9)] flex items-center justify-center"
            style={{ transform: 'translateZ(10px)' }}
          >
            <img
              src={backImage}
              alt={`${cardName} Back`}
              className="w-full h-full object-contain pointer-events-none"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://images.pokemontcg.io/base1/back.png";
              }}
            />
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] border border-white/10 rounded-xl" />
          </div>

          {/* BACK FOOTER: Cryptographic Hash & Verification URL */}
          <div className="relative z-20 h-7 rounded-lg bg-slate-900/90 border border-slate-800 px-2 flex items-center justify-between text-[8px] font-mono text-slate-400">
            <span className="truncate max-w-[140px] text-slate-500">
              HASH: 0x7c9a2...4f8b
            </span>
            <span className="text-cyan-400 font-bold">vca.authority/verify</span>
          </div>
        </div>
      </div>

      {/* Slab Flip Control */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => {
            const next = !flipped;
            if (onFlip) onFlip(next);
            else setInternalFlipped(next);
          }}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-white font-mono text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-cyan-950/40"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>FLIP SLAB 180° ({flipped ? 'FRONT' : 'BACK'})</span>
        </button>
      </div>
    </div>
  );
};
