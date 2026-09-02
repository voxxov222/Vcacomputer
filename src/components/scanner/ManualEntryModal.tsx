import React, { useState } from 'react';
import { Search, X, Sparkles, Check, Loader2, AlertCircle } from 'lucide-react';
import { VARIANT_TAXONOMY } from '../../../server_scanner_api';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardFound: (card: any) => void;
  language: 'EN' | 'JP';
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  onCardFound,
  language
}) => {
  const [query, setQuery] = useState('');
  const [variant, setVariant] = useState('Normal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/scanner/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), language, variant })
      });
      const data = await res.json();
      if (data.success && data.card) {
        onCardFound(data.card);
        onClose();
        setQuery('');
      } else {
        setError(data.error || 'No matching card found in TCG registry');
      }
    } catch (err: any) {
      setError(err.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  const presetSuggestions = [
    'Charizard Base Set 4/102',
    'Umbreon VMAX Evolving Skies 215/203',
    'Pikachu Grey Felt Hat 085',
    'Lugia V Silver Tempest 186/195',
    'Mewtwo GX Shining Legends 78/73',
    'Giratina V Lost Origin 186/196',
    'Gengar VMAX Fusion Strike 271/264',
    'Iono Paldea Evolved 269/193'
  ];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#080e1e] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl shadow-cyan-950/80 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">MANUAL RECOGNITION</div>
              <h3 className="text-base font-bold text-white font-mono">SEARCH CARD OR OCR NUMBER</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSearch} className="mt-5 space-y-4">
          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
              Card Name, Set, or Collector Number
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Charizard 4/102 Base Set"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/30 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 font-mono outline-none"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
              Variant Classification
            </label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500/30 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono outline-none"
            >
              {VARIANT_TAXONOMY.map(v => (
                <option key={v} value={v} className="bg-slate-900 text-white">{v}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Preset Buttons */}
          <div>
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">Popular Quick Queries:</div>
            <div className="flex flex-wrap gap-1.5">
              {presetSuggestions.map(s => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setQuery(s)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500/50 text-[10px] font-mono text-slate-300 hover:text-cyan-300 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg shadow-cyan-500/30"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>INDEXING MARKET MATRIX...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>RETRIEVE & ADD CARD</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
