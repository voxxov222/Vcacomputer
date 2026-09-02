import React, { useEffect, useState } from 'react';
import { ShieldCheck, Check, Search, BarChart3, Radio, Hexagon, Maximize2, Sparkles, TrendingUp, Cpu } from 'lucide-react';

export const NFCDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data via NFC verification API
    setTimeout(() => {
      setLoading(false);
    }, 1200);
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-cyan-500 gap-4 font-mono">
        <Radio className="w-12 h-12 animate-pulse" />
        <div className="text-xl tracking-[0.2em] animate-pulse">ESTABLISHING NFC HANDSHAKE...</div>
        <div className="text-xs text-cyan-800">UID: 1D:93:48:A9:1C:10:80</div>
      </div>
    );
  }

  // hardcoded for VCA-000-0001
  return (
    <div className="w-screen min-h-screen bg-slate-950 text-slate-200 font-sans p-4 sm:p-8 overflow-y-auto relative">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 p-6 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-cyan-950 border-2 border-cyan-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                VCA VERIFIED
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </h1>
              <div className="font-mono text-cyan-500 font-bold tracking-widest text-sm">CERT: VCA-000-0001</div>
            </div>
          </div>
          <div className="text-right">
             <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Cryptographic NFC Anchor</div>
             <div className="font-mono text-emerald-400 text-sm flex items-center justify-end gap-1.5 mt-1">
                <Radio className="w-3.5 h-3.5" /> 1D:93:48:A9:1C:10:80
             </div>
             <div className="text-[10px] text-emerald-500/70 mt-0.5">Signature Validated • NXP Mifare</div>
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Image & Identity */}
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-2 relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
                <img 
                  src="https://images.pokemontcg.io/sm10/217_hires.png" 
                  alt="Reshiram & Charizard GX" 
                  className="w-full rounded-2xl aspect-[3/4.2] object-contain bg-slate-950 p-2 border border-slate-700/50 shadow-2xl"
                />
             </div>
             
             <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-4">
                <div>
                   <h2 className="text-xl font-bold text-white leading-tight">Reshiram & Charizard GX</h2>
                   <div className="text-sm font-medium text-slate-400 mt-1">Unbroken Bonds <span className="font-mono text-cyan-400 ml-1">#217/214</span></div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                   <span className="px-2.5 py-1 bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-bold rounded-lg tracking-wide uppercase">Secret Rare</span>
                   <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg tracking-wide uppercase">Rainbow</span>
                   <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg tracking-wide uppercase">English</span>
                </div>
             </div>
          </div>
          
          {/* Right Column: Grade, Pricing, Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Final Grade Banner */}
            <div className="bg-gradient-to-r from-emerald-950/60 to-cyan-950/60 border border-emerald-900/40 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex-1">
                  <h3 className="text-emerald-500 text-xs font-bold tracking-widest uppercase mb-1">VCA Final Grade</h3>
                  <div className="text-5xl font-black text-white tabular-nums tracking-tighter">
                    10<span className="text-3xl text-slate-400 ml-1 font-bold">.0</span>
                  </div>
                  <div className="text-emerald-400 font-medium mt-1 uppercase tracking-widest text-sm">Pristine</div>
               </div>
               
               <div className="w-full sm:w-auto grid grid-cols-2 gap-3">
                 <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center min-w-[80px]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Centering</div>
                    <div className="text-lg font-bold text-white">10.0</div>
                 </div>
                 <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center min-w-[80px]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Corners</div>
                    <div className="text-lg font-bold text-white">10.0</div>
                 </div>
                 <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center min-w-[80px]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Edges</div>
                    <div className="text-lg font-bold text-white">9.5</div>
                 </div>
                 <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-center min-w-[80px]">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Surface</div>
                    <div className="text-lg font-bold text-white">10.0</div>
                 </div>
               </div>
            </div>

            {/* Price Intelligence */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold flex items-center gap-2">
                     <TrendingUp className="w-5 h-5 text-cyan-400" />
                     Live Market Valuation
                  </h3>
                  <span className="px-2 py-1 bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold uppercase tracking-widest rounded">Updated: Just Now</span>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                     <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">RAW (Ungraded)</div>
                     <div className="text-xl font-bold text-white font-mono">$215.50</div>
                     <div className="text-xs text-emerald-500 font-medium mt-1">+2.4% <span className="text-slate-500">30d</span></div>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between ring-1 ring-cyan-500/40 relative overflow-hidden">
                     <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">YOUR GRADE</div>
                     <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">PSA 10 / VCA 10</div>
                     <div className="text-xl font-bold text-white font-mono">$1,850.00</div>
                     <div className="text-xs text-emerald-500 font-medium mt-1">+5.1% <span className="text-slate-500">30d</span></div>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                     <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">PSA 9</div>
                     <div className="text-xl font-bold text-white font-mono">$450.00</div>
                     <div className="text-xs text-emerald-500 font-medium mt-1">+1.2% <span className="text-slate-500">30d</span></div>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                     <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">PSA 8</div>
                     <div className="text-xl font-bold text-white font-mono">$265.00</div>
                     <div className="text-xs text-slate-500 font-medium mt-1">0.0% <span className="text-slate-500">30d</span></div>
                  </div>
               </div>
            </div>

            {/* Forensic Proofs & Verification */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
               <h3 className="text-white font-bold flex items-center gap-2 mb-6">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  Forensic Authentication Ledger
               </h3>
               
               <div className="space-y-4">
                  <div className="flex items-start gap-4">
                     <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                     </div>
                     <div>
                        <div className="text-sm font-bold text-white">Visual & Geometric Verification</div>
                        <div className="text-xs text-slate-400 mt-1 leading-relaxed">Holographic pattern, centering, and print registration strictly match canonical Unbroken Bonds references. Multi-signal analysis confirmed 99.2% alignment.</div>
                     </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                     <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                     </div>
                     <div>
                        <div className="text-sm font-bold text-white">Immutable Binding</div>
                        <div className="text-xs text-slate-400 mt-1 leading-relaxed">This physical slab is cryptographically bound to NFC UID 1D:93:48:A9:1C:10:80. The internal NXP chip signature has been verified as authentic and untampered.</div>
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
