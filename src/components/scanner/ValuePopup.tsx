import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, TrendingUp } from 'lucide-react';

interface ValuePopupProps {
  value: number | null;
  cardName?: string;
  variant?: string;
  keyTrigger: string | number;
  isVisible: boolean;
}

export const ValuePopup: React.FC<ValuePopupProps> = ({
  value,
  cardName,
  variant,
  keyTrigger,
  isVisible
}) => {
  if (!isVisible || value === null || value === undefined) return null;

  const formattedValue = value >= 1000 
    ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : `$${value.toFixed(2)}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyTrigger}
        initial={{ scale: 0.2, y: 50, opacity: 0, rotate: -6 }}
        animate={{ 
          scale: [0.2, 1.15, 1], 
          y: -35, 
          opacity: 1, 
          rotate: 0,
          transition: {
            duration: 0.55,
            ease: [0.175, 0.885, 0.32, 1.275] // Bouncy die-cut sticker settle
          }
        }}
        exit={{ 
          scale: 0.8, 
          y: -60, 
          opacity: 0,
          transition: { duration: 0.3 } 
        }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none select-none flex flex-col items-center"
      >
        {/* Glow Halo behind pop-up */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/40 via-yellow-400/50 to-amber-600/40 rounded-3xl blur-2xl -z-10 scale-125 animate-pulse" />

        {/* Die-Cut Sticker Style Container */}
        <div className="relative px-6 py-3.5 bg-gradient-to-b from-[#1a1500] via-[#0e0c02] to-[#080800] border-2 border-yellow-400/90 rounded-2xl shadow-[0_12px_40px_rgba(234,179,8,0.45)] backdrop-blur-xl flex flex-col items-center text-center">
          {/* Top subtle badge */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-black tracking-widest text-amber-300 uppercase px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 mb-1">
            <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" />
            <span>ESTIMATED VALUE</span>
          </div>

          {/* Giant Gold Value Digits */}
          <div className="font-['Orbitron',sans-serif] font-black tracking-tight text-4xl sm:text-5xl bg-gradient-to-b from-yellow-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            {formattedValue}
          </div>

          {/* Card Name / Variant subtitle */}
          {cardName && (
            <div className="text-xs font-mono font-bold text-amber-200/90 mt-1 max-w-[220px] truncate">
              {cardName} {variant && <span className="text-amber-400">({variant})</span>}
            </div>
          )}

          {/* Corner golden rivets */}
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 absolute top-1.5 left-1.5 shadow-[0_0_6px_#fde047]" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 absolute top-1.5 right-1.5 shadow-[0_0_6px_#fde047]" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 absolute bottom-1.5 left-1.5 shadow-[0_0_6px_#fde047]" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-300 absolute bottom-1.5 right-1.5 shadow-[0_0_6px_#fde047]" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
