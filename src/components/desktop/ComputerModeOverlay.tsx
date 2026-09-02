import React, { useEffect, useState } from 'react';
import { useOS } from '../../context/OSContext';
import { MonitorPlay, Sparkles, X, Activity, Play, Pause } from 'lucide-react';

export const ComputerModeOverlay: React.FC = () => {
  const { isComputerMode, setComputerMode, tasks, agents, activeWindowId } = useOS();
  const [cursorPos, setCursorPos] = useState({ x: 300, y: 250 });
  const [isClicking, setIsClicking] = useState(false);
  const [currentNarrative, setCurrentNarrative] = useState('Autonomous Agent scanning OS windows...');

  // Running tasks
  const runningTask = tasks.find((t) => t.status === 'running');
  const activeAgent = runningTask ? agents.find((a) => a.id === runningTask.agentId || a.name === runningTask.primaryAgent) : null;

  useEffect(() => {
    if (!isComputerMode) return;

    // Simulate autonomous movement and screen actions
    const interval = setInterval(() => {
      const targetX = Math.floor(Math.random() * (window.innerWidth - 300)) + 150;
      const targetY = Math.floor(Math.random() * (window.innerHeight - 250)) + 80;
      setCursorPos({ x: targetX, y: targetY });

      // Action simulation
      setTimeout(() => {
        setIsClicking(true);
        setTimeout(() => setIsClicking(false), 200);
      }, 1200);

      const narratives = [
        `Agent ${activeAgent?.name || 'VCA Command'} analyzing active UI view...`,
        'Executing safe sandbox operation...',
        'Comparing database records against market index...',
        'Parsing DOM elements and structured card schemas...',
        'Inspecting optical centering coordinates and corner metrics...',
        'Syncing task status to persistent memory graph...'
      ];
      setCurrentNarrative(narratives[Math.floor(Math.random() * narratives.length)]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isComputerMode, activeAgent]);

  if (!isComputerMode) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Top Banner indicating Computer Mode */}
      <div className="absolute top-11 left-1/2 -translate-x-1/2 bg-amber-500/20 border border-amber-500/50 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-3 text-amber-300 text-xs shadow-lg pointer-events-auto animate-pulse">
        <MonitorPlay className="w-4 h-4 text-amber-400" />
        <span className="font-semibold">Autonomous Computer Mode Active</span>
        <span className="text-[11px] text-amber-200/80 hidden sm:inline">| {currentNarrative}</span>
        <button
          onClick={() => setComputerMode(false)}
          className="p-1 hover:bg-amber-500/30 rounded-full text-amber-300 hover:text-white transition"
          title="Stop Computer Mode"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Autonomous Virtual Agent Cursor */}
      <div
        style={{
          transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`,
          transition: 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
        className="absolute top-0 left-0 flex items-start gap-1"
      >
        {/* Cursor SVG */}
        <div
          className={`transition-transform duration-100 ${
            isClicking ? 'scale-90 text-cyan-300' : 'scale-100 text-cyan-400'
          }`}
        >
          <svg
            className="w-6 h-6 drop-shadow-md"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="black"
            strokeWidth="1.5"
          >
            <path d="M3 3l7 18 3-7 7-3L3 3z" />
          </svg>
        </div>

        {/* Agent Label Pill */}
        <div className="px-2 py-0.5 bg-cyan-950/90 border border-cyan-500/60 rounded-md text-[10px] text-cyan-300 font-mono flex items-center gap-1 shadow-lg whitespace-nowrap">
          <Sparkles className="w-2.5 h-2.5" />
          <span>{activeAgent?.name || 'AI Operating Agent'}</span>
        </div>
      </div>
    </div>
  );
};
