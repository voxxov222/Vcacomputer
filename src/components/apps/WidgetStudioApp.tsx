import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { DynamicWidgetConfig } from '../../types/runtime';
import {
  LayoutGrid,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Monitor,
  Activity,
  Radio,
  Globe,
  Video,
  FileCode,
  Terminal,
  Clock,
  CloudSun,
  Eye,
  Check,
  Zap
} from 'lucide-react';

const WIDGET_TEMPLATES: Array<Omit<DynamicWidgetConfig, 'id' | 'createdAt' | 'updatedAt'> & { icon: any; category: string; description: string }> = [
  {
    title: 'Hardware & System Monitor',
    type: 'system_monitor',
    icon: Activity,
    category: 'System',
    description: 'Real-time CPU cores, RAM load, uptime, and kernel load average.',
    size: 'medium',
    position: { x: 30, y: 30 },
    refreshIntervalMs: 2000,
    isPinned: true,
    isLocked: false,
    theme: 'cyber',
    props: { showGraph: true }
  },
  {
    title: 'Live Process & Port Supervisor',
    type: 'process_monitor',
    icon: Radio,
    category: 'Development',
    description: 'Direct watcher of running daemons, child PIDs, and active HTTP ports.',
    size: 'medium',
    position: { x: 380, y: 30 },
    refreshIntervalMs: 3500,
    isPinned: true,
    isLocked: false,
    theme: 'dark',
    props: {}
  },
  {
    title: 'Embedded Live Shell',
    type: 'terminal_live',
    icon: Terminal,
    category: 'Development',
    description: 'Mini quick-action terminal widget directly on the desktop canvas.',
    size: 'wide',
    position: { x: 30, y: 260 },
    refreshIntervalMs: 0,
    isPinned: true,
    isLocked: false,
    theme: 'dark',
    props: { defaultCommand: 'uname -a' }
  },
  {
    title: 'Web Application Frame',
    type: 'website_embed',
    icon: Globe,
    category: 'Media',
    description: 'Embed any web application, dashboard, or external web tool directly.',
    size: 'large',
    position: { x: 380, y: 260 },
    refreshIntervalMs: 0,
    isPinned: true,
    isLocked: false,
    theme: 'glass',
    props: { url: 'https://vca-authority.com', title: 'VCA Web Portal' }
  },
  {
    title: 'Quick Scratchpad & Notes',
    type: 'notes_scratchpad',
    icon: FileCode,
    category: 'Productivity',
    description: 'Persistent Markdown scratchpad with real-time autosave.',
    size: 'small',
    position: { x: 740, y: 30 },
    refreshIntervalMs: 0,
    isPinned: true,
    isLocked: false,
    theme: 'dark',
    props: { initialText: '# Quick Ideas\n- PSA Population comparison\n- Subgrade centering index' }
  }
];

export const WidgetStudioApp: React.FC = () => {
  const { widgets, addWidget, deleteWidget, updateWidget } = useOS();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(WIDGET_TEMPLATES[0]);
  const [customTitle, setCustomTitle] = useState('');
  const [customType, setCustomType] = useState<DynamicWidgetConfig['type']>('system_monitor');
  const [customSize, setCustomSize] = useState<DynamicWidgetConfig['size']>('medium');
  const [customTheme, setCustomTheme] = useState<DynamicWidgetConfig['theme']>('cyber');
  const [activeTab, setActiveTab] = useState<'market' | 'active' | 'builder'>('market');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateFromTemplate = (template: typeof WIDGET_TEMPLATES[0]) => {
    addWidget({
      ...template,
      id: `widget-${Date.now()}`,
      position: { x: 40 + (widgets.length % 3) * 320, y: 40 + Math.floor(widgets.length / 3) * 220 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const handleCreateCustom = () => {
    addWidget({
      id: `widget-custom-${Date.now()}`,
      title: customTitle || 'Custom Widget',
      type: customType,
      size: customSize,
      position: { x: 60, y: 60 },
      refreshIntervalMs: 3000,
      isPinned: true,
      isLocked: false,
      theme: customTheme,
      props: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setCustomTitle('');
    setActiveTab('active');
  };

  const handleAiGenerateWidget = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: `Create a dynamic desktop widget based on this request: ${aiPrompt}`,
          agentName: 'Widget Studio Agent'
        })
      });
      const data = await res.json();

      // Create new smart widget
      addWidget({
        id: `widget-${Date.now()}`,
        title: aiPrompt.slice(0, 30),
        type: aiPrompt.toLowerCase().includes('web') ? 'website_embed' : aiPrompt.toLowerCase().includes('terminal') ? 'terminal_live' : 'system_monitor',
        size: 'medium',
        position: { x: 100, y: 100 },
        refreshIntervalMs: 3000,
        isPinned: true,
        isLocked: false,
        theme: 'cyber',
        props: { aiGoal: aiPrompt, insights: data.plan?.keyInsights || [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setAiPrompt('');
      setActiveTab('active');
    } catch {
      // fallback
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200 font-sans text-xs select-none overflow-hidden">
      {/* Header Bar */}
      <div className="h-11 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <LayoutGrid className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-100 text-sm">Dynamic Widget Studio & Market</span>
        </div>

        <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('market')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'market' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Widget Market ({WIDGET_TEMPLATES.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'active' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Desktop ({widgets.length})
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'builder' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Widget Builder
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'market' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Pre-Configured System Widgets</h3>
                <p className="text-slate-400 text-xs mt-0.5">One-click add live interactive widgets directly to your OS desktop workspace.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {WIDGET_TEMPLATES.map((tmpl, idx) => {
                const Icon = tmpl.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{tmpl.title}</h4>
                            <span className="text-[10px] text-slate-500 font-mono uppercase">{tmpl.category} • {tmpl.size}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-400 text-xs mt-2.5 leading-relaxed">{tmpl.description}</p>
                    </div>

                    <button
                      onClick={() => handleCreateFromTemplate(tmpl)}
                      className="mt-4 w-full py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add to Desktop
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'active' && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-100 text-sm">Active Desktop Widgets ({widgets.length})</h3>
            {widgets.length === 0 ? (
              <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-slate-500">
                No active widgets on desktop. Pick one from the Widget Market!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {widgets.map((w) => (
                  <div
                    key={w.id}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                        <LayoutGrid className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-200 block">{w.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Type: {w.type} | Size: {w.size} | Theme: {w.theme || 'dark'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateWidget(w.id, { isPinned: !w.isPinned })}
                        className={`px-2.5 py-1 rounded text-xs border ${
                          w.isPinned ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {w.isPinned ? 'Pinned' : 'Unpinned'}
                      </button>
                      <button
                        onClick={() => deleteWidget(w.id)}
                        className="p-1.5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'builder' && (
          <div className="max-w-xl mx-auto space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-slate-100">AI Conversational Widget Builder</h4>
              </div>
              <p className="text-slate-400 text-xs">
                Describe the widget you want (e.g., "Build a PSA population tracker widget for Charizard", "Create a real-time disk & memory graph widget", or "Embed a live video player").
              </p>

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="What kind of widget would you like to construct?"
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
              />

              <button
                onClick={handleAiGenerateWidget}
                disabled={isGenerating || !aiPrompt.trim()}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-md shadow-cyan-950/40 disabled:opacity-50"
              >
                {isGenerating ? <Zap className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate & Deploy Widget
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
