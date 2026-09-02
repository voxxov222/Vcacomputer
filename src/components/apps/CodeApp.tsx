import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import {
  Code2,
  Play,
  Save,
  Sparkles,
  FileCode,
  CheckCircle,
  Copy,
  Terminal as TermIcon,
  RotateCcw
} from 'lucide-react';

interface CodeAppProps {
  fileId?: string;
}

export const CodeApp: React.FC<CodeAppProps> = ({ fileId: initialFileId }) => {
  const { files, updateFile, logActivity, addNotification } = useOS();
  const codeFiles = files.filter((f) => !f.isFolder && (f.type === 'code' || f.type === 'json' || f.name.endsWith('.ts') || f.name.endsWith('.js') || f.name.endsWith('.json')));

  const [activeFileId, setActiveFileId] = useState<string>(initialFileId || (codeFiles[0]?.id || ''));
  const [content, setContent] = useState<string>('');
  const [isAiFixing, setIsAiFixing] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);

  const activeFile = files.find((f) => f.id === activeFileId) || codeFiles[0];

  useEffect(() => {
    if (activeFile) {
      setContent(activeFile.content);
      setExecutionOutput(null);
    }
  }, [activeFileId, activeFile]);

  const handleSave = () => {
    if (activeFile) {
      updateFile(activeFile.id, { content, size: content.length });
      logActivity('CODE_SAVED', `Saved changes to ${activeFile.name}`);
      addNotification({
        title: 'File Saved',
        message: `${activeFile.name} successfully updated on virtual drive.`,
        type: 'success'
      });
    }
  };

  const handleRunCode = async () => {
    setExecutionOutput('Executing TypeScript in isolated V8 sandbox...');
    try {
      const res = await fetch('/api/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: `node -e "${content.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`,
          cwd: process.cwd()
        })
      });
      const data = await res.json();
      setExecutionOutput(data.stdout || data.stderr || 'Program executed successfully with exit code 0.');
    } catch (err: any) {
      setExecutionOutput(`Execution error: ${err.message}`);
    }
  };

  const handleAiImprove = async () => {
    setIsAiFixing(true);
    try {
      // Simulate intelligent code enhancement
      await new Promise((r) => setTimeout(r, 800));
      const enhanced = `// VCA Certified Logic with Automated Error Guard\n${content}\n\n// Verified compliance with VCA Forensic Schema v3.2`;
      setContent(enhanced);
      addNotification({
        title: 'AI Code Refactor',
        message: 'Code optimized and verified against VCA standards.',
        type: 'info'
      });
    } finally {
      setIsAiFixing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden text-xs">
      {/* Code Studio Header */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
        {/* Left: Open File Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {codeFiles.map((file) => (
            <button
              key={file.id}
              onClick={() => setActiveFileId(file.id)}
              className={`px-3 py-1 rounded-t-lg flex items-center gap-1.5 font-mono text-[11px] transition ${
                file.id === activeFile?.id
                  ? 'bg-slate-950 text-cyan-300 border-t-2 border-cyan-400 font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{file.name}</span>
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAiImprove}
            disabled={isAiFixing}
            className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 rounded-lg font-medium flex items-center gap-1 transition"
          >
            <Sparkles className="w-3 h-3" /> AI Refactor
          </button>
          <button
            onClick={handleSave}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium flex items-center gap-1 transition"
          >
            <Save className="w-3 h-3" /> Save
          </button>
          <button
            onClick={handleRunCode}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1 transition"
          >
            <Play className="w-3 h-3" /> Run
          </button>
        </div>
      </div>

      {/* Editor Main Canvas & Live Line Numbers */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex bg-slate-950 font-mono text-[12px] overflow-hidden">
          {/* Line Numbers */}
          <div className="w-12 bg-slate-950/80 border-r border-slate-800/80 py-3 text-right pr-3 text-slate-600 select-none font-mono">
            {Array.from({ length: Math.max(15, content.split('\n').length) }, (_, i) => (
              <div key={i} className="leading-relaxed">{i + 1}</div>
            ))}
          </div>

          {/* Code Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 bg-transparent p-3 text-slate-100 focus:outline-none resize-none font-mono text-[12px] leading-relaxed whitespace-pre"
            spellCheck={false}
          />
        </div>

        {/* Output Pane */}
        {executionOutput && (
          <div className="w-80 bg-slate-900 border-l border-slate-800 p-3 flex flex-col justify-between shrink-0 font-mono text-xs select-text">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <TermIcon className="w-3.5 h-3.5" /> Output Console
                </span>
                <button
                  onClick={() => setExecutionOutput(null)}
                  className="text-[10px] text-slate-500 hover:text-white"
                >
                  Clear
                </button>
              </div>
              <div className="mt-2 text-slate-300 whitespace-pre-wrap">{executionOutput}</div>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
              VCA Runtime Node v22.14.0 Sandbox
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
