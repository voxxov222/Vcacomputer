import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { Brain, Sparkles, Plus, Search, Tag, Database, Trash2, CheckCircle } from 'lucide-react';

export const MemoryApp: React.FC = () => {
  const { memories, addMemory, deleteMemory, logActivity, addNotification } = useOS();
  const [search, setSearch] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<'preference' | 'fact' | 'instruction' | 'context'>('instruction');
  const [isAdding, setIsAdding] = useState(false);

  const filtered = memories.filter((m) => {
    const keyStr = (m.key || m.content || '').toLowerCase();
    const valStr = (m.value || m.content || '').toLowerCase();
    const tagStr = (m.tags || []).join(' ').toLowerCase();
    const q = search.toLowerCase();
    return keyStr.includes(q) || valStr.includes(q) || tagStr.includes(q);
  });

  const handleSaveMemory = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    addMemory(newCategory, `${newKey.trim()}: ${newValue.trim()}`);
    setNewKey('');
    setNewValue('');
    setIsAdding(false);
    logActivity('MEMORY_ADDED', `Stored agent knowledge: ${newKey}`);
    addNotification({
      title: 'Memory Stored',
      message: `Agent knowledge graph updated with "${newKey}".`,
      type: 'success'
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden text-xs">
      {/* Top Header */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-pink-400" />
          <span className="font-bold text-slate-200">Autonomous Agent Memory & Knowledge Graph</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search knowledge graph..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-7 pr-2 py-0.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Knowledge
          </button>
        </div>
      </div>

      {/* Main Memory List */}
      <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full space-y-4">
        {isAdding && (
          <div className="p-4 bg-slate-900 border border-cyan-500/60 rounded-2xl space-y-3 shadow-xl">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Storing Persistent Fact
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="Key / Concept (e.g. grading_standard_centering)"
                className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
              >
                <option value="instruction">Instruction</option>
                <option value="fact">Fact</option>
                <option value="preference">Preference</option>
                <option value="context">Context</option>
              </select>
            </div>
            <textarea
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              rows={2}
              placeholder="Value / Knowledge (e.g. Centering standard for VCA 10 must not exceed 55/45 front)"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMemory}
                className="px-4 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold"
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2.5">
          {filtered.map((mem) => (
            <div
              key={mem.id}
              className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-start justify-between gap-4 shadow-sm hover:border-slate-700 transition"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">{mem.key || mem.category}</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-cyan-400 font-mono text-[10px] rounded">
                    {mem.category}
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{mem.value || mem.content}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono pt-1">
                  <Tag className="w-3 h-3 text-slate-600" />
                  <span>{(mem.tags || ['vca', mem.category]).join(', ')}</span>
                  <span className="ml-2">• {new Date(mem.updatedAt || mem.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => deleteMemory(mem.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition"
                title="Delete memory"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
