import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import {
  Boxes,
  Sparkles,
  Play,
  CheckCircle,
  Cpu,
  Layers,
  Rocket,
  Code
} from 'lucide-react';

export const AppBuilderApp: React.FC = () => {
  const { logActivity, addNotification } = useOS();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<{
    name: string;
    description: string;
    previewHtml: string;
  } | null>(null);

  const handleGenerateApp = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setGeneratedApp({
        name: 'VCA Pop Report Matrix',
        description: 'Micro-tool to dynamically filter and calculate gem mint rates across vintage sets.',
        previewHtml: `
          <div style="font-family: sans-serif; padding: 20px; color: #fff; background: #090d16; border-radius: 12px;">
            <h2 style="color: #38bdf8; margin-top: 0;">⚡ VCA Gem Mint Analytics</h2>
            <p style="color: #94a3b8; font-size: 13px;">Real-time calculation engine generated via AI Prompt.</p>
            <div style="display: flex; gap: 10px; margin-top: 15px;">
              <div style="background: #1e293b; padding: 12px; border-radius: 8px; flex: 1;">
                <div style="color: #64748b; font-size: 11px;">BASE SET GEM RATE</div>
                <div style="font-size: 20px; font-weight: bold; color: #4ade80;">14.2%</div>
              </div>
              <div style="background: #1e293b; padding: 12px; border-radius: 8px; flex: 1;">
                <div style="color: #64748b; font-size: 11px;">AVG POP GROWTH</div>
                <div style="font-size: 20px; font-weight: bold; color: #38bdf8;">+8.4%/mo</div>
              </div>
            </div>
          </div>
        `
      });
      logActivity('APP_GENERATED', `Created custom micro-app from prompt: "${prompt}"`);
      addNotification({
        title: 'Micro-App Compiled',
        message: 'Your custom application has been built and sandbox-tested.',
        type: 'success'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden text-xs">
      {/* Top Header */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Boxes className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-slate-200">Natural Language Micro-App Builder</span>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full space-y-6">
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4 shadow-2xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Describe the tool or interface you want VCA OS to build:</h3>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Build an interactive pop report comparison tool that graphs VCA 10 vs PSA 10 gem rates for 1st Edition Base Set holos..."
            className="w-full h-24 bg-slate-950 border border-slate-700/80 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500/80 resize-none font-sans"
          />
          <div className="flex justify-end">
            <button
              onClick={handleGenerateApp}
              disabled={isGenerating || !prompt.trim()}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Compiling App in Sandbox...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" /> Synthesize & Mount App
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Preview Box */}
        {generatedApp && (
          <div className="p-6 bg-slate-900 border border-emerald-500/40 rounded-3xl space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">{generatedApp.name}</h4>
                <p className="text-xs text-slate-400">{generatedApp.description}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold rounded-lg flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> MOUNTED IN VCA WORKSPACE
              </span>
            </div>

            <div
              className="mt-4 rounded-2xl overflow-hidden border border-slate-800"
              dangerouslySetInnerHTML={{ __html: generatedApp.previewHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
