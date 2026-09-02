import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { runtimeApi } from '../../lib/runtimeApi';
import { Terminal as TermIcon, Play, Trash2, ShieldCheck, CornerDownLeft, Sparkles, Folder, Activity, Zap } from 'lucide-react';

interface TerminalHistoryEntry {
  command: string;
  cwd: string;
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
  timestamp: string;
}

export const TerminalApp: React.FC = () => {
  const { logActivity } = useOS();
  const [history, setHistory] = useState<TerminalHistoryEntry[]>([
    {
      command: 'uname -a && node -v',
      cwd: '/workspace',
      stdout: 'Linux vca-os-runtime 5.15.0-x86_64\nNode.js runtime active.',
      stderr: '',
      exitCode: 0,
      durationMs: 14,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState<string>('.');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isExecuting]);

  const handleCommandSubmit = async (cmdToRun?: string) => {
    const command = (cmdToRun || input).trim();
    if (!command) return;

    // Handle internal 'clear' command
    if (command === 'clear' || command === 'cls') {
      setHistory([]);
      setInput('');
      return;
    }

    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);
    setInput('');
    setIsExecuting(true);

    try {
      const result = await runtimeApi.executeCommand({
        command,
        cwd
      });

      // Update CWD if 'cd' was executed
      if (result.cwd) {
        setCwd(result.cwd);
      }

      setHistory((prev) => [...prev, result]);
      logActivity('TERMINAL_EXEC', `Executed: ${command.slice(0, 40)}`);
    } catch (err: any) {
      setHistory((prev) => [
        ...prev,
        {
          command,
          cwd,
          stdout: '',
          stderr: `Execution error: ${err.message || 'Host execution failed'}`,
          exitCode: 1,
          durationMs: 0,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommandSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIndex = historyIndex + 1;
        if (nextIndex < commandHistory.length) {
          setHistoryIndex(nextIndex);
          setInput(commandHistory[nextIndex]);
        } else {
          setHistoryIndex(-1);
          setInput('');
        }
      }
    }
  };

  const quickCommands = [
    { label: 'System Info', cmd: 'uname -a && free -m' },
    { label: 'Git Status', cmd: 'git status -s' },
    { label: 'Node & NPM', cmd: 'node -v && npm -v' },
    { label: 'List Files', cmd: 'ls -la' },
    { label: 'Processes', cmd: 'ps aux | head -n 10' }
  ];

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="h-full flex flex-col bg-slate-950 text-slate-200 font-mono text-xs select-text overflow-hidden"
    >
      {/* Top Header */}
      <div className="h-9 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2">
          <TermIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-300">bash — vca@local-daemon: {cwd}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 text-[10px] font-sans font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> REAL HOST EXECUTION
          </span>
          <button
            onClick={() => setHistory([])}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Action Ribbon */}
      <div className="h-7 bg-slate-900/60 border-b border-slate-800/60 px-3 flex items-center gap-1.5 shrink-0 select-none overflow-x-auto">
        <span className="text-[10px] text-slate-500 font-sans uppercase font-bold">Quick:</span>
        {quickCommands.map((q) => (
          <button
            key={q.label}
            onClick={() => handleCommandSubmit(q.cmd)}
            className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] transition-all font-sans whitespace-nowrap"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Console Output Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 font-mono text-[11px] leading-relaxed">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            {/* Command Prompt Line */}
            <div className="flex items-center gap-2 text-cyan-400 select-none">
              <span className="text-emerald-400 font-bold">vca@host:</span>
              <span className="text-slate-400">{item.cwd || '~'}$</span>
              <span className="text-slate-100 font-semibold select-text">{item.command}</span>
              <span className="text-[10px] text-slate-500 ml-auto font-sans">
                {item.durationMs}ms {item.exitCode === 0 ? '✓' : `[exit: ${item.exitCode}]`}
              </span>
            </div>

            {/* Standard Output */}
            {item.stdout && (
              <pre className="text-slate-300 whitespace-pre-wrap pl-3 border-l-2 border-slate-800 bg-slate-900/30 p-1.5 rounded-r">
                {item.stdout}
              </pre>
            )}

            {/* Standard Error */}
            {item.stderr && (
              <pre className="text-rose-400 whitespace-pre-wrap pl-3 border-l-2 border-rose-800 bg-rose-950/20 p-1.5 rounded-r">
                {item.stderr}
              </pre>
            )}
          </div>
        ))}

        {isExecuting && (
          <div className="flex items-center gap-2 text-cyan-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Executing command on host daemon...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Prompt */}
      <div className="h-10 bg-slate-900 border-t border-slate-800 px-3 flex items-center gap-2 shrink-0">
        <span className="text-emerald-400 font-bold">vca@host:</span>
        <span className="text-slate-400">{cwd}$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isExecuting}
          placeholder="Enter host command (e.g. ls, node, git, npm, python)..."
          className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none font-mono text-xs"
          autoFocus
        />
        <button
          onClick={() => handleCommandSubmit()}
          disabled={isExecuting || !input.trim()}
          className="p-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 disabled:opacity-30"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
