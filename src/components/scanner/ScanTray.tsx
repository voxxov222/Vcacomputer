import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, ChevronDown, Check, Sparkles, 
  Layers, DollarSign, Database, Loader2, Edit3, ArrowRight, ShieldCheck
} from 'lucide-react';
import { ScannerCardOutput, VARIANT_TAXONOMY } from '../../../server_scanner_api';

interface ScanTrayProps {
  scannedCards: ScannerCardOutput[];
  onVariantChange: (index: number, newVariant: string) => void;
  onRemoveCard: (index: number) => void;
  onAddToVault: () => Promise<void>;
  onOpenManualEntry: () => void;
  isSaving: boolean;
  totalValue: number;
  userEmail?: string | null;
}

export const ScanTray: React.FC<ScanTrayProps> = ({
  scannedCards,
  onVariantChange,
  onRemoveCard,
  onAddToVault,
  onOpenManualEntry,
  isSaving,
  totalValue,
  userEmail
}) => {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  if (scannedCards.length === 0) return null;

  return (
    <div className="w-full bg-[#060a14]/95 border-t border-cyan-500/30 backdrop-blur-xl p-3 sm:p-4 z-40 transition-all shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Left: Scrollable Horizontal Card Tray */}
        <div className="flex-1 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
          <div className="flex items-center gap-3 min-w-max">
            <AnimatePresence>
              {scannedCards.map((card, idx) => (
                <motion.div
                  key={`${card.name}-${card.cardNumber}-${idx}`}
                  initial={{ scale: 0.8, opacity: 0, x: -20 }}
                  animate={{ scale: 1, opacity: 1, x: 0 }}
                  exit={{ scale: 0.8, opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="relative group bg-[#0b1329] border border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-2 flex items-center gap-3 shadow-lg shadow-cyan-950/40"
                >
                  {/* Card Thumbnail */}
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-slate-950 border border-slate-700/80 flex-shrink-0 relative">
                    <img 
                      src={card.imageUrl} 
                      alt={card.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.pokemontcg.io/base1/4_hires.png";
                      }}
                    />
                    <div className="absolute top-0.5 left-0.5 bg-black/80 px-1 rounded text-[8px] font-mono text-cyan-300">
                      {card.language}
                    </div>
                  </div>

                  {/* Card Meta & Variant Picker */}
                  <div className="flex flex-col justify-center min-w-[130px] max-w-[160px]">
                    <div className="text-xs font-bold text-white truncate">{card.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      {card.set} • {card.cardNumber}
                    </div>

                    {/* Variant Selector Button */}
                    <div className="relative mt-1">
                      <button
                        type="button"
                        onClick={() => setActiveDropdown(activeDropdown === idx ? null : idx)}
                        className="w-full px-2 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-cyan-500/60 text-[10px] font-mono font-bold text-cyan-300 flex items-center justify-between gap-1 transition"
                      >
                        <span className="truncate">{card.variant || 'Normal'}</span>
                        <ChevronDown className="w-3 h-3 text-cyan-400 shrink-0" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdown === idx && (
                        <>
                          <div 
                            className="fixed inset-0 z-50" 
                            onClick={() => setActiveDropdown(null)} 
                          />
                          <div className="absolute bottom-full left-0 mb-1 w-48 max-h-56 overflow-y-auto bg-[#080e1e] border border-cyan-500/50 rounded-xl shadow-2xl p-1.5 z-50 space-y-0.5 font-mono text-[11px]">
                            <div className="text-[9px] uppercase font-bold text-slate-400 px-2 py-1 border-b border-slate-800">
                              Select Variant
                            </div>
                            {VARIANT_TAXONOMY.map((v) => (
                              <button
                                key={v}
                                onClick={() => {
                                  onVariantChange(idx, v);
                                  setActiveDropdown(null);
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition ${
                                  card.variant === v 
                                    ? 'bg-cyan-500 text-slate-950 font-bold' 
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                              >
                                <span>{v}</span>
                                {card.variant === v && <Check className="w-3 h-3" />}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Price tag */}
                    <div className="text-xs font-black font-mono text-emerald-400 mt-1">
                      ${card.rawValue.toFixed(2)}
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => onRemoveCard(idx)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                    title="Remove from batch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Running Total Pill & Add To Profile CTA */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          {/* Running Total Pill */}
          <div className="bg-[#0b1329] border border-amber-500/40 px-3.5 py-1.5 rounded-2xl flex items-center gap-2.5 shadow-lg shadow-amber-950/30">
            <div className="text-right font-mono">
              <div className="text-[9px] uppercase font-bold text-amber-400 tracking-wider">
                {scannedCards.length} {scannedCards.length === 1 ? 'Card' : 'Cards'} Total
              </div>
              <div className="text-base sm:text-lg font-black font-['Orbitron',sans-serif] text-yellow-300">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Add to Profile / Firestore Button */}
          <button
            onClick={onAddToVault}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition transform active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SAVING TO VAULT...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>ADD TO PROFILE</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
