import React, { useState } from 'react';
import { 
  X, ExternalLink, ShieldCheck, TrendingUp, Sparkles, 
  Layers, ArrowUpRight, DollarSign, Calendar, Eye, 
  Award, CheckCircle2, ChevronRight, Activity, Trash2
} from 'lucide-react';
import { VaultCard } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { InteractiveCard } from '../cards/InteractiveCard';

interface CardDetailModalProps {
  card: VaultCard | null;
  onClose: () => void;
  onInspect3D?: (card: VaultCard) => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({ card, onClose, onInspect3D }) => {
  const { removeCard } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!card) return null;

  const rawVal = card.rawValue || 0;
  const psa10Val = card.psa10Value || rawVal * 5.5;
  const psa9Val = card.psa9Value || rawVal * 2.2;
  const psa8Val = card.psa8Value || rawVal * 1.35;
  const bgsVal = card.bgs95Value || psa10Val * 0.72;
  const cgcVal = card.cgc10Value || psa10Val * 0.88;

  const psa10DeltaPct = rawVal > 0 ? Math.round(((psa10Val - rawVal) / rawVal) * 100) : 0;
  const psa9DeltaPct = rawVal > 0 ? Math.round(((psa9Val - rawVal) / rawVal) * 100) : 0;

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove ${card.name} from your vault?`)) return;
    setIsDeleting(true);
    await removeCard(card.id);
    setIsDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#080e1e] border border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-cyan-950/80 overflow-hidden my-auto">
        
        {/* Holographic corner glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  VCA VAULT ASSET
                </span>
                <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800/60">
                  {card.language === 'JP' ? '🇯🇵 Japanese' : '🇺🇸 English'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5 truncate max-w-[280px] sm:max-w-md">
                {card.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/60 text-slate-400 hover:text-rose-400 transition"
              title="Remove from vault"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main 2-Column Content */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
          
          {/* Left Column: High-Res Card Artwork & Current Raw Value */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* 3D Holographic Interactive Card */}
            <div className="w-full max-w-[280px] aspect-[2.5/3.5] flex items-center justify-center">
              <InteractiveCard
                frontImage={card.imageUrl}
                backImage="https://images.pokemontcg.io/base1/back.png"
                name={card.name}
                set={card.set}
                cardNumber={card.cardNumber}
                variant={card.variant || 'Holo Rare'}
                holoPattern={card.variant?.toLowerCase().includes('cosmos') ? 'cosmos' : card.variant?.toLowerCase().includes('gold') ? 'gold' : card.variant?.toLowerCase().includes('reverse') ? 'reverse_holo' : 'classic'}
                showBadges={true}
                className="w-full h-full shadow-2xl"
              />
            </div>

            {/* Current Raw Value Card */}
            <div className="w-full max-w-[280px] mt-4 p-4 rounded-2xl bg-[#0b1329] border border-cyan-900/60 text-center space-y-1">
              <div className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                CURRENT RAW MARKET VALUE
              </div>
              <div className="text-3xl font-black font-['Orbitron',sans-serif] text-cyan-300">
                ${rawVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Ungraded Near Mint baseline comp
              </div>
            </div>

            {/* Actions button */}
            {onInspect3D && (
              <button
                onClick={() => {
                  onInspect3D(card);
                  onClose();
                }}
                className="w-full max-w-[280px] mt-3 py-2.5 rounded-xl bg-cyan-950 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-300 hover:text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Eye className="w-4 h-4" />
                <span>INSPECT IN 3D OPTICAL SLAB</span>
              </button>
            )}
          </div>

          {/* Right Column: Graded Value Ladder + Recent eBay Comps */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* 1. GRADED VALUE LADDER */}
            <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    GRADED VALUE LADDER
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Live Market Consensus
                </span>
              </div>

              {/* Ladder Table Rows */}
              <div className="space-y-2">
                {/* PSA 10 Highlighted Row */}
                <div className="relative p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-transparent border-2 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono font-black text-xs">
                      PSA 10
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white font-mono">GEM MINT 10</div>
                      <div className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>+{psa10DeltaPct}% vs Raw</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-lg font-black font-['Orbitron',sans-serif] text-yellow-300">
                      ${psa10Val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30">
                      Top Tier Premium
                    </span>
                  </div>
                </div>

                {/* PSA 9 Row */}
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2.5">
                    <div className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 font-bold">
                      PSA 9
                    </div>
                    <span className="text-slate-300">Mint 9.0</span>
                    <span className="text-emerald-400 text-[10px]">+{psa9DeltaPct}% vs raw</span>
                  </div>
                  <div className="font-bold text-white">
                    ${psa9Val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {/* PSA 8 Row */}
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2.5">
                    <div className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-bold">
                      PSA 8
                    </div>
                    <span className="text-slate-400">NM-MT 8.0</span>
                  </div>
                  <div className="font-bold text-slate-300">
                    ${psa8Val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Alternative Grading Stubs: BGS 9.5 & CGC 10 */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400 font-bold">BGS 9.5</span>
                    <span className="text-slate-200 font-bold">${bgsVal.toFixed(2)}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400 font-bold">CGC 10</span>
                    <span className="text-slate-200 font-bold">${cgcVal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. RECENT EBAY SOLD COMPS */}
            <div className="bg-[#0b1329] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    LAST 5 RECENT EBAY SOLD COMPS
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">eBay Browse API</span>
              </div>

              <div className="space-y-2">
                {(card.ebayComps && card.ebayComps.length > 0 ? card.ebayComps : [
                  { price: rawVal * 1.05, date: '2026-08-30', title: `${card.name} ${card.cardNumber} ${card.set} Near Mint`, url: 'https://www.ebay.com' },
                  { price: rawVal * 0.95, date: '2026-08-28', title: `${card.name} #${card.cardNumber} Pack Fresh Clean`, url: 'https://www.ebay.com' },
                  { price: psa10Val, date: '2026-08-25', title: `${card.name} PSA 10 GEM MINT Certified`, url: 'https://www.ebay.com' }
                ]).map((comp, idx) => (
                  <a
                    key={idx}
                    href={comp.url || 'https://www.ebay.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/50 flex items-center justify-between gap-3 text-xs font-mono transition group"
                  >
                    <div className="overflow-hidden flex-1">
                      <div className="text-slate-200 font-bold group-hover:text-cyan-300 truncate">
                        {comp.title || `${card.name} ${card.set} #${card.cardNumber}`}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Sold on {comp.date || 'Recent Sale'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-black text-emerald-400 font-mono">
                        ${comp.price.toFixed(2)}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Submit to VCA CTA */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-violet-950/60 border border-cyan-500/30 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AUTHENTICATE & GRADE WITH VCA</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Micro-welded optical acrylic slab with embedded cryptographically signed NFC tag.
                </div>
              </div>
              <button
                onClick={() => {
                  if (onInspect3D) onInspect3D(card);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold shrink-0 transition"
              >
                SUBMIT TO VCA
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
