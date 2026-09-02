import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, ArrowUpDown, ShieldCheck, Sparkles, 
  Layers, Plus, TrendingUp, DollarSign, Award, Grid, List, 
  LogIn, LogOut, User, RefreshCw, Eye, ArrowUpRight
} from 'lucide-react';
import { VaultCard } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { VARIANT_TAXONOMY } from '../../../server_scanner_api';
import { CardDetailModal } from './CardDetailModal';

interface VaultGridProps {
  onOpenScanner: () => void;
  onInspect3D?: (card: VaultCard) => void;
  onInspectSlab?: (card: VaultCard) => void;
}

export const VaultGrid: React.FC<VaultGridProps> = ({ onOpenScanner, onInspect3D, onInspectSlab }) => {
  const { user, vault, openAuthModal, logout, authInitialized, isOnline } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'value_desc' | 'value_asc' | 'recent' | 'name'>('value_desc');
  const [selectedCard, setSelectedCard] = useState<VaultCard | null>(null);

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    return vault
      .filter((card) => {
        const matchesSearch = 
          card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.set.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.cardNumber.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesVariant = selectedVariant === 'all' || card.variant === selectedVariant;
        const matchesLang = selectedLanguage === 'all' || card.language === selectedLanguage;

        return matchesSearch && matchesVariant && matchesLang;
      })
      .sort((a, b) => {
        if (sortBy === 'value_desc') return (b.rawValue || 0) - (a.rawValue || 0);
        if (sortBy === 'value_asc') return (a.rawValue || 0) - (b.rawValue || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.scannedAt || 0).getTime() - new Date(a.scannedAt || 0).getTime();
      });
  }, [vault, searchQuery, selectedVariant, selectedLanguage, sortBy]);

  // Total Portfolio Metrics
  const totalValue = useMemo(() => vault.reduce((acc, c) => acc + (c.rawValue || 0), 0), [vault]);
  const totalPsa10Potential = useMemo(() => vault.reduce((acc, c) => acc + (c.psa10Value || (c.rawValue || 0) * 5.5), 0), [vault]);
  const potentialDelta = totalValue > 0 ? Math.round(((totalPsa10Potential - totalValue) / totalValue) * 100) : 0;
  
  const topAsset = useMemo(() => {
    if (vault.length === 0) return null;
    return [...vault].sort((a, b) => (b.rawValue || 0) - (a.rawValue || 0))[0];
  }, [vault]);

  return (
    <div className="w-full min-h-screen bg-[#040711] text-slate-100 font-sans pb-20">
      
      {/* Top Banner / Account Header */}
      <div className="border-b border-cyan-950/80 bg-[#060a14]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* App Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black font-mono tracking-wider text-white">
                  VCA VAULT & SCANNER
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold">
                  FIRESTORE SYNC
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Verified Card Authority Portfolio Intelligence
              </p>
            </div>
          </div>

          {/* User Profile & Scanner CTA Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenScanner}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition transform hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>LIVE SCANNER</span>
            </button>

            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs font-mono">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-200 truncate max-w-[120px] font-bold">
                  {user.displayName || user.email?.split('@')[0] || 'Collector'}
                </span>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-400 transition ml-1"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-white font-mono text-xs font-bold flex items-center gap-1.5 transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>SIGN IN / SYNC</span>
              </button>
            )}
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* 1. PORTFOLIO METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Value */}
          <div className="p-5 rounded-3xl bg-[#080e1e] border border-cyan-500/30 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:scale-125 transition" />
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
              <span>TOTAL PORTFOLIO VALUE</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-['Orbitron',sans-serif] text-cyan-300 mt-2">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              {vault.length} tracked items in vault
            </div>
          </div>

          {/* PSA 10 Potential Value */}
          <div className="p-5 rounded-3xl bg-[#080e1e] border border-amber-500/30 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:scale-125 transition" />
            <div className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>PSA 10 POTENTIAL CEILING</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-['Orbitron',sans-serif] text-yellow-300 mt-2">
              ${totalPsa10Potential.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-1 font-bold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{potentialDelta}% if graded PSA 10</span>
            </div>
          </div>

          {/* Top Valued Asset */}
          <div className="p-5 rounded-3xl bg-[#080e1e] border border-violet-500/30 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-xl group-hover:scale-125 transition" />
            <div className="text-[10px] font-mono uppercase font-bold text-violet-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>TOP VALUED CARD</span>
            </div>
            <div className="text-lg font-black text-white mt-2 truncate">
              {topAsset ? topAsset.name : 'No Cards Yet'}
            </div>
            <div className="text-[11px] font-mono text-violet-300 font-bold mt-1">
              {topAsset ? `$${topAsset.rawValue.toFixed(2)} (${topAsset.variant})` : '$0.00'}
            </div>
          </div>

          {/* Vault Security & Sync Status */}
          <div className="p-5 rounded-3xl bg-[#080e1e] border border-emerald-500/30 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-125 transition" />
            <div className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>STORAGE & CLOUD PERSISTENCE</span>
            </div>
            <div className="text-lg font-black text-white mt-2 font-mono flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{user && !user.isAnonymous ? 'CLOUD ACTIVE' : 'LOCAL GUEST'}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">
              {user && !user.isAnonymous ? 'Persistent cross-device sync' : 'Saved locally in browser storage'}
            </div>
          </div>

        </div>

        {/* 2. SEARCH & FILTER CONTROLS */}
        <div className="bg-[#080e1e] border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by card name, set, or collector number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 font-mono outline-none transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {/* Variant Filter */}
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              className="bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-300 rounded-xl px-3 py-2 outline-none font-bold"
            >
              <option value="all">All Variants</option>
              {VARIANT_TAXONOMY.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            {/* Language Filter */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-950 border border-slate-800 focus:border-cyan-500 text-slate-300 rounded-xl px-3 py-2 outline-none font-bold"
            >
              <option value="all">All Languages</option>
              <option value="EN">🇺🇸 English</option>
              <option value="JP">🇯🇵 Japanese</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 focus:border-cyan-500 text-cyan-300 rounded-xl px-3 py-2 outline-none font-bold"
            >
              <option value="value_desc">Highest Value ($)</option>
              <option value="value_asc">Lowest Value ($)</option>
              <option value="recent">Recently Added</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

        </div>

        {/* 3. CARD GRID DISPLAY */}
        {filteredCards.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#080e1e]/60 border border-dashed border-slate-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
              <Layers className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white font-mono">NO CARDS MATCHING FILTER</h3>
            <p className="text-xs text-slate-400 font-mono max-w-sm mx-auto">
              Scan trading cards using your camera or reset search filters to view your vault portfolio.
            </p>
            <button
              onClick={onOpenScanner}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>OPEN LIVE SCANNER</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className="group cursor-pointer bg-[#080e1e] hover:bg-[#0c142b] border border-cyan-950 hover:border-cyan-400/80 rounded-2xl p-2.5 transition duration-300 shadow-xl flex flex-col justify-between"
              >
                {/* Artwork Frame */}
                <div className="aspect-[2.5/3.5] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition">
                  <img
                    src={card.imageUrl}
                    alt={card.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.pokemontcg.io/base1/4_hires.png";
                    }}
                  />

                  {/* Language Chip */}
                  <div className="absolute top-1.5 left-1.5 bg-black/80 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-cyan-300 border border-slate-700">
                    {card.language || 'EN'}
                  </div>

                  {/* Variant Chip */}
                  <div className="absolute top-1.5 right-1.5 bg-slate-950/90 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-amber-300 border border-amber-500/40">
                    {card.variant || 'Normal'}
                  </div>
                </div>

                {/* Card Meta & Valuation */}
                <div className="mt-2.5 space-y-1">
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition truncate">
                    {card.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    {card.set} • {card.cardNumber}
                  </div>

                  {/* Pricing row */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-900 font-mono">
                    <span className="text-[10px] text-slate-500 uppercase">Raw Value</span>
                    <span className="text-xs font-black text-emerald-400">
                      ${card.rawValue.toFixed(2)}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* Card Detail Pop-up Modal */}
      <CardDetailModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        onInspect3D={onInspectSlab || onInspect3D}
      />

    </div>
  );
};
