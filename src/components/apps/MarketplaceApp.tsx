import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import {
  ShoppingBag,
  Sparkles,
  Search,
  Download,
  CheckCircle2,
  Star,
  ExternalLink,
  ShieldCheck,
  Bot,
  Zap,
  Tag,
  Code,
  Terminal,
  Grid
} from 'lucide-react';

interface PluginItem {
  id: string;
  name: string;
  category: 'agent' | 'tool' | 'forensics' | 'theme';
  author: string;
  description: string;
  rating: number;
  downloads: string;
  installed: boolean;
  tags: string[];
  icon: string;
}

export const MarketplaceApp: React.FC = () => {
  const { addNotification, openWindow } = useOS();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [items, setItems] = useState<PluginItem[]>([
    {
      id: 'pkg-pokemon-eval',
      name: 'Pokemon Card TCG Price Sentinel',
      category: 'forensics',
      author: 'VCA Core Labs',
      description: 'Real-time eBay and TCGPlayer price aggregator with subgrade historical volatility charts.',
      rating: 4.9,
      downloads: '14.2k',
      installed: true,
      tags: ['tcg', 'pricing', 'pokemon', 'forensics'],
      icon: 'ShieldCheck'
    },
    {
      id: 'pkg-debugger-agent',
      name: 'Stack Trace Autonomous Debugger',
      category: 'agent',
      author: 'DeepMind Engineer Swarm',
      description: 'Reads backend runtime stderr logs, identifies missing npm packages, and automatically repairs broken code.',
      rating: 5.0,
      downloads: '32.8k',
      installed: true,
      tags: ['debugger', 'coding', 'agent'],
      icon: 'Bot'
    },
    {
      id: 'pkg-nfc-writer',
      name: 'NTAG215 Cryptographic NFC Writer',
      category: 'tool',
      author: 'VCA Hardware Engineering',
      description: 'Low-level NDEF payload compiler with AES-128 cryptographic signature verification.',
      rating: 4.8,
      downloads: '8.4k',
      installed: false,
      tags: ['nfc', 'hardware', 'security'],
      icon: 'Zap'
    },
    {
      id: 'pkg-spanner-sync',
      name: 'Google Cloud Spanner Syncer',
      category: 'tool',
      author: 'Cloud Systems Team',
      description: 'Bi-directional relational database sync for distributed enterprise authentication registries.',
      rating: 4.7,
      downloads: '6.1k',
      installed: false,
      tags: ['sql', 'database', 'gcp'],
      icon: 'Code'
    },
    {
      id: 'pkg-cyber-theme',
      name: 'Matrix Emerald Cyber Theme',
      category: 'theme',
      author: 'VCA Design Guild',
      description: 'High-contrast emerald neon aesthetic with scanline effects and low-latency rendering.',
      rating: 4.9,
      downloads: '19.3k',
      installed: false,
      tags: ['theme', 'ui', 'emerald'],
      icon: 'Grid'
    },
    {
      id: 'pkg-auction-crawler',
      name: 'PSA & BGS Auction Cert Cross-Checker',
      category: 'forensics',
      author: 'Forensics Consortium',
      description: 'Checks card serial numbers against theft databases and active auction listings across Heritage and Goldin.',
      rating: 4.9,
      downloads: '11.5k',
      installed: false,
      tags: ['fraud-prevention', 'psa', 'bgs'],
      icon: 'ShieldCheck'
    }
  ]);

  const handleInstallToggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.installed;
          addNotification({
            title: nextState ? 'Package Installed' : 'Package Removed',
            message: `${item.name} has been ${nextState ? 'installed into your VCA OS workspace' : 'uninstalled'}.`,
            type: nextState ? 'success' : 'info',
            read: false
          });
          return { ...item, installed: nextState };
        }
        return item;
      })
    );
  };

  const filtered = items.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans select-text">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              VCA OS Extension & Agent Marketplace
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                Verified Registry
              </span>
            </h1>
            <p className="text-xs text-slate-400">Discover and install AI agents, forensic grading modules, and hardware tools.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openWindow('coding_agents')}
            className="px-3 py-1.5 rounded-lg bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coding Agents</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'all', label: 'All Packages' },
            { id: 'agent', label: 'AI Agents' },
            { id: 'forensics', label: 'Grading Forensics' },
            { id: 'tool', label: 'Hardware Tools' },
            { id: 'theme', label: 'Themes' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                activeCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search packages or tags..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Grid of Packages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((pkg) => (
            <div
              key={pkg.id}
              className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-white leading-tight">{pkg.name}</h3>
                      <span className="text-[10px] text-slate-400">by {pkg.author}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    <span>{pkg.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{pkg.description}</p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {pkg.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 font-mono">{pkg.downloads} installs</span>
                <button
                  onClick={() => handleInstallToggle(pkg.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    pkg.installed
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                  }`}
                >
                  {pkg.installed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Installed</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Install</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
