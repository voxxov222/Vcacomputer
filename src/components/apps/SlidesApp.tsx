import React, { useState } from 'react';
import {
  Presentation,
  Plus,
  Play,
  Download,
  Share2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layout,
  Type,
  Image as ImageIcon,
  CheckCircle2,
  Copy,
  Trash2
} from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  bullets: string[];
  notes: string;
  theme: 'dark' | 'cyan' | 'purple' | 'emerald';
}

export const SlidesApp: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 'slide-1',
      title: 'VCA OS Local Runtime Expansion',
      subtitle: 'Autonomous AI Software Engineering & Hardware Forensics',
      bullets: [
        'Real host Linux execution via direct IPC bridge',
        'Multi-agent software engineering & autonomous debugging',
        'Physical NFC & slab certification hardware integration',
        'Zero-trust sandboxed isolated workspaces'
      ],
      notes: 'Introduce high-level operating system architecture.',
      theme: 'cyan'
    },
    {
      id: 'slide-2',
      title: 'Coding Agents Swarm Architecture',
      subtitle: 'Autonomous Pipeline: Discovery → Synthesis → Execution',
      bullets: [
        'Real-time dependency auditing & packaging',
        'Automatic port conflict detection & process supervisor',
        'Human-in-the-loop critical action approval gates',
        'Instant live preview and telemetry streaming'
      ],
      notes: 'Explain multi-agent coordination principles.',
      theme: 'purple'
    },
    {
      id: 'slide-3',
      title: 'Collectible Authentication & Grading AI',
      subtitle: 'Verified Card Authority (VCA) Computer Vision Engine',
      bullets: [
        'Centering, corners, edges, and surface optical subgrades',
        'Cryptographic NFC chip binding & tamper detection',
        'Historical market intelligence & auction analytics',
        'Decentralized immutable grading certificate generation'
      ],
      notes: 'Highlight sub-millimeter forensic grading precision.',
      theme: 'emerald'
    }
  ]);

  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');

  const currentSlide = slides[activeSlideIdx] || slides[0];

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: 'New Slide Title',
      subtitle: 'Slide Subtitle or Objective',
      bullets: ['Key takeaway point 1', 'Key takeaway point 2', 'Key takeaway point 3'],
      notes: 'Presenter notes...',
      theme: 'dark'
    };
    setSlides([...slides, newSlide]);
    setActiveSlideIdx(slides.length);
  };

  const handleDeleteSlide = (idx: number) => {
    if (slides.length <= 1) return;
    const next = slides.filter((_, i) => i !== idx);
    setSlides(next);
    setActiveSlideIdx(Math.max(0, idx - 1));
  };

  const handleGenerateAISlides = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const generated: Slide = {
        id: `slide-gen-${Date.now()}`,
        title: prompt.charAt(0).toUpperCase() + prompt.slice(1),
        subtitle: 'AI-Generated Executive Summary',
        bullets: [
          'Strategic milestone assessment and system throughput',
          'Automated error recovery and fault-tolerant architecture',
          'Continuous benchmarking and production performance telemetry'
        ],
        notes: `Generated from prompt: "${prompt}"`,
        theme: 'cyan'
      };
      setSlides([...slides, generated]);
      setActiveSlideIdx(slides.length);
      setPrompt('');
      setIsGenerating(false);
    }, 900);
  };

  const getThemeBg = (t: Slide['theme']) => {
    switch (t) {
      case 'cyan':
        return 'from-slate-950 via-cyan-950/40 to-slate-900 border-cyan-500/40';
      case 'purple':
        return 'from-slate-950 via-purple-950/40 to-slate-900 border-purple-500/40';
      case 'emerald':
        return 'from-slate-950 via-emerald-950/40 to-slate-900 border-emerald-500/40';
      default:
        return 'from-slate-950 via-slate-900 to-slate-950 border-slate-700/60';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans select-text">
      {/* Header Bar */}
      <div className="h-11 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Presentation className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white flex items-center gap-2">
              VCA AI Slides & Decks
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                {slides.length} Slides
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPresenting(!isPresenting)}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              isPresenting
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
            }`}
          >
            <Play className="w-3 h-3" />
            <span>{isPresenting ? 'Exit Presentation' : 'Present Deck'}</span>
          </button>
          <button
            onClick={handleAddSlide}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 border border-slate-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Slide</span>
          </button>
        </div>
      </div>

      {/* AI Slide Generator Bar */}
      <div className="p-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 shrink-0">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerateAISlides()}
          placeholder="Generate new slide with AI (e.g., 'Q3 Architecture Roadmap and Milestones')..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleGenerateAISlides}
          disabled={isGenerating || !prompt.trim()}
          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition shrink-0"
        >
          {isGenerating ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>Generate Slide</span>
        </button>
      </div>

      {/* Main Slide Editor / Viewer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Thumbnail Strip (Left) */}
        {!isPresenting && (
          <div className="w-56 border-r border-slate-800/80 bg-slate-950/60 p-3 space-y-2.5 overflow-y-auto shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
              Deck Navigation
            </span>
            {slides.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => setActiveSlideIdx(idx)}
                className={`p-2.5 rounded-xl border transition cursor-pointer text-left relative group ${
                  activeSlideIdx === idx
                    ? 'border-cyan-500 bg-cyan-950/30 text-white shadow-md'
                    : 'border-slate-800/80 bg-slate-900/40 hover:bg-slate-900 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-cyan-400">#{idx + 1}</span>
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlide(idx);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-rose-400 transition"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="font-semibold text-xs truncate">{s.title}</div>
                <div className="text-[10px] text-slate-500 truncate">{s.subtitle}</div>
              </div>
            ))}
          </div>
        )}

        {/* Active Slide Canvas (Center) */}
        <div className="flex-1 flex flex-col p-6 items-center justify-center overflow-y-auto bg-slate-950/80 relative">
          <div
            className={`w-full max-w-3xl aspect-[16/9] rounded-2xl border bg-gradient-to-br ${getThemeBg(
              currentSlide.theme
            )} p-8 shadow-2xl flex flex-col justify-between transition-all`}
          >
            {/* Slide Header */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 mb-2">
                <span>VCA OS EXECUTIVE BRIEFING</span>
                <span>
                  SLIDE {activeSlideIdx + 1} / {slides.length}
                </span>
              </div>
              <input
                type="text"
                value={currentSlide.title}
                onChange={(e) => {
                  const val = e.target.value;
                  setSlides(slides.map((s, i) => (i === activeSlideIdx ? { ...s, title: val } : s)));
                }}
                className="text-2xl md:text-3xl font-extrabold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-500 focus:outline-none w-full tracking-tight mb-2"
              />
              <input
                type="text"
                value={currentSlide.subtitle}
                onChange={(e) => {
                  const val = e.target.value;
                  setSlides(slides.map((s, i) => (i === activeSlideIdx ? { ...s, subtitle: val } : s)));
                }}
                className="text-sm text-slate-300 bg-transparent border-b border-transparent hover:border-slate-700 focus:border-cyan-500 focus:outline-none w-full"
              />
            </div>

            {/* Slide Bullets */}
            <div className="my-6 space-y-2.5">
              {currentSlide.bullets.map((b, bIdx) => (
                <div key={bIdx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2 shrink-0 shadow-sm shadow-cyan-400/50" />
                  <input
                    type="text"
                    value={b}
                    onChange={(e) => {
                      const val = e.target.value;
                      const nextBullets = [...currentSlide.bullets];
                      nextBullets[bIdx] = val;
                      setSlides(
                        slides.map((s, i) => (i === activeSlideIdx ? { ...s, bullets: nextBullets } : s))
                      );
                    }}
                    className="flex-1 text-sm text-slate-200 bg-transparent border-b border-transparent hover:border-slate-800 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Slide Footer */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-3">
              <span>CONFIDENTIAL & PROPRIETARY — VCA OS</span>
              <div className="flex items-center gap-1.5">
                {['dark', 'cyan', 'purple', 'emerald'].map((thm) => (
                  <button
                    key={thm}
                    onClick={() =>
                      setSlides(
                        slides.map((s, i) => (i === activeSlideIdx ? { ...s, theme: thm as any } : s))
                      )
                    }
                    className={`w-3 h-3 rounded-full border ${
                      currentSlide.theme === thm ? 'ring-2 ring-white' : ''
                    } ${
                      thm === 'cyan'
                        ? 'bg-cyan-500'
                        : thm === 'purple'
                        ? 'bg-purple-500'
                        : thm === 'emerald'
                        ? 'bg-emerald-500'
                        : 'bg-slate-700'
                    }`}
                    title={`Theme: ${thm}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Slide Navigation Controls */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setActiveSlideIdx(Math.max(0, activeSlideIdx - 1))}
              disabled={activeSlideIdx === 0}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-slate-300 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400">
              Slide {activeSlideIdx + 1} of {slides.length}
            </span>
            <button
              onClick={() => setActiveSlideIdx(Math.min(slides.length - 1, activeSlideIdx + 1))}
              disabled={activeSlideIdx === slides.length - 1}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-slate-300 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
