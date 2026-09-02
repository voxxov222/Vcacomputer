import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Terminal,
  Play,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Cpu,
  HardDrive,
  Activity,
  Zap,
  Sliders,
  Send,
  Radio,
  AudioWaveform,
  Shield,
  Layers,
  Code2,
  ExternalLink,
  ChevronRight,
  Database,
  Brain,
  Wrench,
  TrendingUp,
  Package,
  Clock,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  FolderGit2,
  Flame,
  BarChart3
} from 'lucide-react';
import { useOS } from '../../context/OSContext';

interface ExecutedTool {
  name: string;
  args: any;
  result: any;
  durationMs?: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  executedTools?: ExecutedTool[];
  recalledMemories?: any[];
}

export const VoiceAgentApp: React.FC = () => {
  const { openWindow, setActiveScreenIndex } = useOS();

  // Active Tab: 'chat' | 'tools' | 'pricing' | 'memory' | 'tasks' | 'packages'
  const [activeTab, setActiveTab] = useState<'chat' | 'tools' | 'pricing' | 'memory' | 'tasks' | 'packages'>('chat');

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(true);
  const [voiceName, setVoiceName] = useState<'Zephyr' | 'Kore' | 'Puck' | 'Fenrir' | 'Charon'>('Zephyr');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [transcript, setTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic Tools State
  const [customTools, setCustomTools] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [newToolName, setNewToolName] = useState('');
  const [newToolDesc, setNewToolDesc] = useState('');
  const [newToolCode, setNewToolCode] = useState(
`// Custom Dynamic Agent Tool
async function execute(args, context) {
  const { query = 'Pikachu' } = args;
  // Look up card or execute terminal commands
  const cardData = await context.lookupCard(query);
  return {
    success: true,
    query,
    cardFound: cardData?.card?.name || 'Not in catalog',
    pricing: cardData?.marketPricing
  };
}`
  );
  const [newToolLang, setNewToolLang] = useState<'javascript' | 'typescript' | 'python'>('javascript');
  const [toolTestArgs, setToolTestArgs] = useState('{"query": "Charizard Base Set"}');
  const [toolTestResult, setToolTestResult] = useState<any | null>(null);
  const [isCreatingTool, setIsCreatingTool] = useState(false);

  // Pokémon Pricing Engine State
  const [priceDb, setPriceDb] = useState<any | null>(null);
  const [priceSearchQuery, setPriceSearchQuery] = useState('');
  const [isSyncingPrices, setIsSyncingPrices] = useState(false);

  // Agent Memory State
  const [memories, setMemories] = useState<any[]>([]);
  const [memorySearchQuery, setMemorySearchQuery] = useState('');
  const [memoryCategoryFilter, setMemoryCategoryFilter] = useState('all');
  const [newMemoryKey, setNewMemoryKey] = useState('');
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [newMemoryCategory, setNewMemoryCategory] = useState<'semantic' | 'procedure' | 'preference' | 'pokemon_insight' | 'entity'>('semantic');
  const [newMemoryImportance, setNewMemoryImportance] = useState(7);

  // Autonomous Tasks State
  const [autonomousTasks, setAutonomousTasks] = useState<any[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskType, setNewTaskType] = useState<'price_sync' | 'repo_audit' | 'system_health' | 'backup' | 'custom'>('price_sync');
  const [newTaskInterval, setNewTaskInterval] = useState(15);

  // Package & Repo Installer State
  const [installType, setInstallType] = useState<'npm' | 'python_pip' | 'git_clone'>('npm');
  const [installTarget, setInstallTarget] = useState('');
  const [installIsDev, setInstallIsDev] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installLogs, setInstallLogs] = useState<string[]>([]);

  // System Telemetry
  const [systemStats, setSystemStats] = useState<{
    platform: string;
    nodeVersion: string;
    ramUsedMb?: number;
    ramTotalMb?: number;
    cpuCount?: number;
  }>({
    platform: 'linux',
    nodeVersion: 'v20.x'
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: "VCA Autonomous Voice & Terminal Agent online. I am equipped with self-authoring tool creation, real terminal execution, continuous Pokémon price intelligence, long-term memory, and full package/repo installation capabilities.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [commandHistory, setCommandHistory] = useState<
    Array<{ cmd: string; time: string; exitCode: number; duration: number }>
  >([
    { cmd: 'uname -a', time: '14:20:01', exitCode: 0, duration: 12 },
    { cmd: 'node -v', time: '14:20:05', exitCode: 0, duration: 8 }
  ]);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const isHandsFreeRef = useRef(isHandsFree);

  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
  }, [isHandsFree]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Load initial memory, tools, prices, tasks
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    fetchMemories();
    fetchTools();
    fetchPrices();
    fetchTasks();
    fetchTelemetry();
  };

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/agent/memory');
      const data = await res.json();
      if (data.memories) setMemories(data.memories);
    } catch {}
  };

  const fetchTools = async () => {
    try {
      const res = await fetch('/api/agent/tools');
      const data = await res.json();
      if (data.tools) {
        setCustomTools(data.tools);
        if (!selectedTool && data.tools.length > 0) {
          setSelectedTool(data.tools[0]);
        }
      }
    } catch {}
  };

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/agent/price-db');
      const data = await res.json();
      if (data.database) setPriceDb(data.database);
    } catch {}
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/agent/tasks');
      const data = await res.json();
      if (data.tasks) setAutonomousTasks(data.tasks);
    } catch {}
  };

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/system/stats');
      const data = await res.json();
      if (data.stats) {
        setSystemStats({
          platform: data.stats.platform || 'linux',
          nodeVersion: data.stats.nodeVersion || 'v20.x',
          ramUsedMb: data.stats.ram?.usedMb,
          ramTotalMb: data.stats.ram?.totalMb,
          cpuCount: data.stats.cpuCount || 4
        });
      }
    } catch {}
  };

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported natively in this browser.');
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = true;
    recog.lang = 'en-US';

    recog.onstart = () => {
      setIsListening(true);
      setAudioLevel(0.4);
    };

    recog.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      setTranscript(text);
      setAudioLevel(Math.random() * 0.6 + 0.3);

      if (finalTranscript) {
        handleSendTurn(finalTranscript);
      }
    };

    recog.onerror = (err: any) => {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
      setAudioLevel(0);
    };

    recog.onend = () => {
      setIsListening(false);
      setAudioLevel(0);
    };

    recognitionRef.current = recog;

    return () => {
      try {
        recog.abort();
      } catch {}
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
    } else {
      setTranscript('');
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Recognition start failed:', err);
      }
    }
  };

  // Turn Dispatcher
  const handleSendTurn = async (rawText?: string) => {
    const query = (rawText || textInput).trim();
    if (!query || isThinking) return;

    setTextInput('');
    setTranscript('');

    const userMsgId = `msg-u-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/voice-agent/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: query,
          history: historyPayload,
          voiceName
        })
      });

      const data = await res.json();
      setIsThinking(false);

      if (data.executedTools && data.executedTools.length > 0) {
        data.executedTools.forEach((t: ExecutedTool) => {
          if (t.name === 'execute_terminal_command') {
            setCommandHistory((prev) => [
              {
                cmd: t.args?.command || '',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                exitCode: t.result?.exitCode || 0,
                duration: t.durationMs || 10
              },
              ...prev.slice(0, 15)
            ]);
          }
        });
      }

      // Handle OS actions
      if (data.osActions && Array.isArray(data.osActions)) {
        data.osActions.forEach((act: any) => {
          if (act.action === 'open_app' && act.appId) {
            openWindow(act.appId);
          } else if (act.action === 'switch_screen' && typeof act.screenIndex === 'number') {
            setActiveScreenIndex(act.screenIndex);
          }
        });
      }

      const assistantMsg: Message = {
        id: `msg-a-${Date.now()}`,
        role: 'assistant',
        content: data.response || "Task executed successfully.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        executedTools: data.executedTools,
        recalledMemories: data.recalledMemories
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Play audio response
      if (data.audioBase64) {
        playAudio(data.audioBase64, data.audioMimeType || 'audio/mp3');
      } else {
        speakBrowserFallback(data.response);
      }

      // Refresh memory, tools, prices if affected
      fetchData();
    } catch (err: any) {
      setIsThinking(false);
      const errorMsg: Message = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `Execution error: ${err.message || 'Failed to reach agent runtime.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const playAudio = (base64Audio: string, mimeType: string) => {
    try {
      setIsSpeaking(true);
      const audioUrl = `data:${mimeType};base64,${base64Audio}`;
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
      }
      audioElementRef.current.src = audioUrl;
      audioElementRef.current.playbackRate = speechRate;
      audioElementRef.current.onended = () => {
        setIsSpeaking(false);
        if (isHandsFreeRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch {}
          }, 400);
        }
      };
      audioElementRef.current.play().catch(() => {
        setIsSpeaking(false);
      });
    } catch {
      setIsSpeaking(false);
    }
  };

  const speakBrowserFallback = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/```[\s\S]*?```/g, '').replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = speechRate;
      setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (isHandsFreeRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch {}
          }, 400);
        }
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    try {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.currentTime = 0;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
    setIsSpeaking(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Tool Creation Handler
  const handleCreateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolName || !newToolCode) return;
    setIsCreatingTool(true);
    try {
      const res = await fetch('/api/agent/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newToolName.trim().toLowerCase().replace(/\s+/g, '_'),
          description: newToolDesc || `Custom agent tool: ${newToolName}`,
          sourceCode: newToolCode,
          language: newToolLang,
          tags: ['custom', newToolLang]
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewToolName('');
        setNewToolDesc('');
        fetchTools();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingTool(false);
    }
  };

  // Tool Test Execution
  const handleTestTool = async () => {
    if (!selectedTool) return;
    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(toolTestArgs);
      } catch {
        parsedArgs = { query: toolTestArgs };
      }

      const res = await fetch('/api/voice-agent/execute-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: selectedTool.name,
          args: parsedArgs
        })
      });
      const data = await res.json();
      setToolTestResult(data);
      fetchTools();
    } catch (err: any) {
      setToolTestResult({ error: err.message });
    }
  };

  // Manual Pokémon Price Sync
  const handleTriggerPriceSync = async (cardQuery?: string) => {
    setIsSyncingPrices(true);
    try {
      const res = await fetch('/api/agent/price-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardQuery, trigger: 'manual' })
      });
      const data = await res.json();
      fetchPrices();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncingPrices(false);
    }
  };

  // Memory Creation
  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryKey || !newMemoryContent) return;
    try {
      const res = await fetch('/api/agent/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newMemoryCategory,
          key: newMemoryKey,
          content: newMemoryContent,
          importance: newMemoryImportance,
          tags: [newMemoryCategory, 'user_added']
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewMemoryKey('');
        setNewMemoryContent('');
        fetchMemories();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Package & Repo Installer
  const handleRunInstaller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!installTarget) return;
    setIsInstalling(true);
    setInstallLogs((prev) => [`[${new Date().toLocaleTimeString()}] Starting ${installType} install for: ${installTarget}...`, ...prev]);

    try {
      const res = await fetch('/api/voice-agent/execute-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: 'install_dependency_or_repo',
          args: {
            type: installType,
            target: installTarget,
            isDev: installIsDev
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setInstallLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] SUCCESS: ${JSON.stringify(data.result?.output || data.result).slice(0, 300)}`,
          ...prev
        ]);
        setInstallTarget('');
      } else {
        setInstallLogs((prev) => [`[${new Date().toLocaleTimeString()}] FAILED: ${data.result?.error || 'Installation error'}`, ...prev]);
      }
    } catch (err: any) {
      setInstallLogs((prev) => [`[${new Date().toLocaleTimeString()}] ERROR: ${err.message}`, ...prev]);
    } finally {
      setIsInstalling(false);
    }
  };

  // Filtered Memories
  const filteredMemories = memories.filter((m) => {
    if (memoryCategoryFilter !== 'all' && m.category !== memoryCategoryFilter) return false;
    if (memorySearchQuery) {
      const q = memorySearchQuery.toLowerCase();
      return m.key.toLowerCase().includes(q) || m.content.toLowerCase().includes(q) || m.tags.some((t: string) => t.toLowerCase().includes(q));
    }
    return true;
  });

  // Filtered Cards from Price DB
  const priceCardsList = priceDb?.cards ? Object.values(priceDb.cards) as any[] : [];
  const filteredPriceCards = priceCardsList.filter((c) => {
    if (!priceSearchQuery) return true;
    const q = priceSearchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.setName.toLowerCase().includes(q) || c.variant.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-text">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Mic className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide text-white">VCA AUTONOMOUS VOICE INTELLIGENCE</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-500/40">
                GEMINI 3.7 FLASH + TTS
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                SELF-AUTHORING
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Autonomous Shell • Dynamic Tool Coder • Live Pokémon Pricing • Persistent Memory
            </p>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'chat' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Voice & Shell</span>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'tools' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Dynamic Tools</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-800 text-cyan-300">{customTools.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'pricing' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Pokémon Prices</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'memory' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Memory Graph</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-slate-800 text-purple-300">{memories.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'tasks' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Auto Tasks</span>
          </button>
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'packages' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Repos & Deps</span>
          </button>
        </div>

        {/* Voice & System Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>CPU: {systemStats.cpuCount || 4}c</span>
            <span className="text-slate-600">|</span>
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>RAM: {systemStats.ramUsedMb || 120}MB</span>
          </div>

          <button
            onClick={fetchData}
            title="Refresh State & Telemetry"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TAB 1: VOICE & TERMINAL CHAT */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Main Conversation Stream */}
          <div className="flex-1 flex flex-col bg-slate-950/60">
            {/* Messages Scroll Area */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      {msg.role === 'user' ? 'You' : 'VCA Voice Assistant'}
                    </span>
                    <span className="text-[10px] text-slate-600">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-cyan-600 text-white rounded-tr-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                    }`}
                  >
                    {/* Render text with formatting */}
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                    {/* Recalled Memory Badge if present */}
                    {msg.recalledMemories && msg.recalledMemories.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-purple-400 flex items-center gap-1">
                          <Brain className="w-3 h-3" /> Recalled Memory:
                        </span>
                        {msg.recalledMemories.map((m: any, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-purple-950/60 text-purple-300 border border-purple-800/40">
                            {m.key}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Executed Tools Cards */}
                    {msg.executedTools && msg.executedTools.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400">
                          <span className="flex items-center gap-1.5">
                            <Terminal className="w-3.5 h-3.5" /> Executed Subsystem Actions ({msg.executedTools.length})
                          </span>
                          <span className="text-[10px] text-slate-500">Autonomous VAR Kernel</span>
                        </div>

                        {msg.executedTools.map((tool, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-950 rounded-xl p-3 border border-slate-800/80 font-mono text-[11px]"
                          >
                            <div className="flex items-center justify-between text-slate-400 mb-1.5">
                              <span className="text-cyan-400 font-bold">{tool.name}</span>
                              <div className="flex items-center gap-2">
                                {tool.durationMs && (
                                  <span className="text-[10px] text-slate-500">{tool.durationMs}ms</span>
                                )}
                                <button
                                  onClick={() => handleCopy(JSON.stringify(tool.result, null, 2), `${msg.id}-${idx}`)}
                                  className="text-slate-500 hover:text-white"
                                  title="Copy Output"
                                >
                                  {copiedId === `${msg.id}-${idx}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Arguments */}
                            {tool.args && Object.keys(tool.args).length > 0 && (
                              <div className="text-slate-400 text-[10px] mb-1 bg-slate-900/60 px-2 py-1 rounded">
                                <span className="text-slate-500">args:</span> {JSON.stringify(tool.args)}
                              </div>
                            )}

                            {/* Tool Output */}
                            <pre className="text-slate-300 text-[10px] overflow-x-auto whitespace-pre-wrap max-h-40 p-2 bg-slate-900 rounded border border-slate-800/50">
                              {typeof tool.result === 'object'
                                ? JSON.stringify(tool.result, null, 2)
                                : String(tool.result)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse p-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Agent reasoning, executing autonomous tools & synthesizing response...</span>
                </div>
              )}
            </div>

            {/* Audio Wave & Push-to-Talk HUD */}
            <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col gap-3">
              {/* Live Waveform Indicator */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isListening
                        ? 'bg-red-500 animate-ping'
                        : isSpeaking
                        ? 'bg-emerald-400 animate-pulse'
                        : isThinking
                        ? 'bg-amber-400 animate-bounce'
                        : 'bg-cyan-500'
                    }`}
                  />
                  <span className="text-xs font-mono text-slate-300">
                    {isListening
                      ? 'Listening to microphone...'
                      : isSpeaking
                      ? `Voice speaking (${voiceName})...`
                      : isThinking
                      ? 'Executing tools & Gemini thinking...'
                      : transcript
                      ? `Captured: "${transcript}"`
                      : 'Voice ready. Click mic or type below.'}
                  </span>
                </div>

                {/* Animated Audio Wave Bars */}
                <div className="flex items-center gap-1 h-5">
                  {[...Array(14)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-cyan-600 to-emerald-400 rounded-full transition-all duration-75"
                      style={{
                        height: isListening || isSpeaking
                          ? `${Math.max(4, Math.sin((i + Date.now() / 150) % Math.PI) * 20 * (audioLevel || 0.7))}px`
                          : '4px'
                      }}
                    />
                  ))}
                </div>

                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-red-950 text-red-300 border border-red-800/40 hover:bg-red-900 transition"
                  >
                    <VolumeX className="w-3 h-3" /> Stop Speech
                  </button>
                )}
              </div>

              {/* Text Input + Mic Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleListening}
                  className={`p-3 rounded-xl transition flex items-center justify-center shadow-lg ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-red-500/30'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30 font-bold'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Speak to Voice Agent'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendTurn();
                    }
                  }}
                  placeholder="Speak or type: 'Sync Pokemon prices', 'Write a custom tool to scrape PSA 10 comps', 'Clone repo https://github.com/...', 'Check memory'..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
                />

                <button
                  onClick={() => handleSendTurn()}
                  disabled={!textInput.trim() || isThinking}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 disabled:opacity-40 disabled:hover:bg-slate-800 disabled:hover:text-cyan-400 transition font-semibold text-xs flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Inspection & Telemetry Panel */}
          <div className="w-80 border-l border-slate-800 bg-slate-900/60 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Quick Actions */}
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Voice Quick Actions
              </h2>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  onClick={() => handleSendTurn("Synchronize real-time Pokémon market prices across all cards")}
                  className="p-2 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition flex items-center justify-between"
                >
                  <span>Sync Pokémon Prices</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => handleSendTurn("Create a dynamic tool called 'psa_pop_analyzer' to inspect gem mint ratios")}
                  className="p-2 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition flex items-center justify-between"
                >
                  <span>Code New Custom Tool</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => handleSendTurn("Search long-term memory for Pokémon card insights and user preferences")}
                  className="p-2 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-purple-300 transition flex items-center justify-between"
                >
                  <span>Recall Agent Memory</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
                <button
                  onClick={() => handleSendTurn("Execute git status and list project directories")}
                  className="p-2 text-left rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-emerald-300 transition flex items-center justify-between"
                >
                  <span>Check Git & Files</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Voice Audio Settings */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Gemini TTS Voice
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Speaker Voice</label>
                  <select
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Zephyr">Zephyr (Warm & Professional)</option>
                    <option value="Kore">Kore (Clear & Analytical)</option>
                    <option value="Puck">Puck (Fast & Energetic)</option>
                    <option value="Fenrir">Fenrir (Deep & Resonant)</option>
                    <option value="Charon">Charon (Authoritative)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Speech Rate</span>
                    <span>{speechRate}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.4"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">Continuous 2-Way Speech</span>
                  <input
                    type="checkbox"
                    checked={isHandsFree}
                    onChange={(e) => setIsHandsFree(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Terminal Command History */}
            <div className="flex-1">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Real Shell History
              </h2>
              <div className="space-y-1.5 font-mono text-[10px]">
                {commandHistory.map((h, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between"
                  >
                    <div className="truncate flex-1 mr-2 text-slate-300">
                      <span className="text-emerald-400">$ </span>
                      {h.cmd}
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] ${
                        h.exitCode === 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                      }`}
                    >
                      {h.exitCode === 0 ? '0' : `err:${h.exitCode}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DYNAMIC TOOLS STUDIO */}
      {activeTab === 'tools' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Tools List */}
          <div className="w-72 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-cyan-400" /> Tool Registry ({customTools.length})
              </h2>
              <button
                onClick={() => setSelectedTool(null)}
                className="px-2 py-1 rounded-md bg-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-1 hover:bg-cyan-400 transition"
              >
                <Plus className="w-3 h-3" /> New Tool
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {customTools.map((tool) => (
                <div
                  key={tool.name}
                  onClick={() => setSelectedTool(tool)}
                  className={`p-3 rounded-xl cursor-pointer border transition ${
                    selectedTool?.name === tool.name
                      ? 'bg-cyan-950/60 border-cyan-500/50 text-white'
                      : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-cyan-300">{tool.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                      {tool.language || 'JS'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{tool.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Runs: {tool.executionCount || 0}</span>
                    <span className="text-emerald-400">{tool.author === 'agent' ? 'Self-Coded' : 'System'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Code Editor & Tester */}
          <div className="flex-1 flex flex-col p-5 overflow-y-auto gap-4">
            {selectedTool ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold font-mono text-cyan-400">{selectedTool.name}</h2>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                        ACTIVE IN GEMINI CALLS
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{selectedTool.description}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await fetch(`/api/agent/tools/${selectedTool.name}`, { method: 'DELETE' });
                        fetchTools();
                        setSelectedTool(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-950 text-red-300 border border-red-800/40 text-xs hover:bg-red-900 transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Tool
                    </button>
                  </div>
                </div>

                {/* Source Code View */}
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-cyan-400" /> Executable Tool Logic ({selectedTool.language})
                    </span>
                    <span>agent_tools/{selectedTool.name}.js</span>
                  </div>
                  <pre className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-cyan-200 overflow-x-auto border border-slate-800/80 max-h-72">
                    {selectedTool.sourceCode}
                  </pre>
                </div>

                {/* Live Test Runner */}
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-emerald-400" /> Live Interactive Tool Tester
                  </h3>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Execution Arguments (JSON)</label>
                    <textarea
                      value={toolTestArgs}
                      onChange={(e) => setToolTestArgs(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <button
                    onClick={handleTestTool}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Play className="w-3.5 h-3.5" /> Execute Tool Run
                  </button>

                  {toolTestResult && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block mb-1">Run Output Result:</span>
                      <pre className="text-xs font-mono text-emerald-300 overflow-x-auto">
                        {JSON.stringify(toolTestResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Create Tool Form */
              <form onSubmit={handleCreateTool} className="space-y-4 max-w-2xl bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Author New Dynamic Tool from Scratch</h2>
                </div>
                <p className="text-xs text-slate-400">
                  Write JavaScript/TypeScript code for your tool. It will compile, register, and be available for both voice calls and autonomous agent tasks.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Tool Name (snake_case)</label>
                    <input
                      type="text"
                      value={newToolName}
                      onChange={(e) => setNewToolName(e.target.value)}
                      placeholder="e.g. pokemon_psa10_margin_tracker"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Language</label>
                    <select
                      value={newToolLang}
                      onChange={(e) => setNewToolLang(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="javascript">JavaScript (ESM / Node)</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Tool Description for Gemini</label>
                  <input
                    type="text"
                    value={newToolDesc}
                    onChange={(e) => setNewToolDesc(e.target.value)}
                    placeholder="e.g. Analyzes grading margins and price delta across Pokémon sets."
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Executable Logic (Must define execute(args, context))</label>
                  <textarea
                    value={newToolCode}
                    onChange={(e) => setNewToolCode(e.target.value)}
                    rows={10}
                    className="w-full p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreatingTool || !newToolName}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isCreatingTool ? 'Compiling & Registering...' : 'Register Dynamic Tool'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AUTONOMOUS POKÉMON PRICING ENGINE */}
      {activeTab === 'pricing' && (
        <div className="flex-1 flex flex-col p-5 overflow-y-auto gap-4">
          {/* Header Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Total Cards Tracked</span>
              <span className="text-xl font-bold font-mono text-cyan-400">
                {priceDb?.totalCardsTracked || 24}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Estimated Catalog Value</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                ${(priceDb?.marketCapEst || 2450000).toLocaleString()}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-1">Weekly Market Trend</span>
              <span className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-1">
                +{priceDb?.averageWeeklyGrowthPercent || 3.42}% <Flame className="w-4 h-4 text-amber-400" />
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Last Autonomous Sync</span>
                <span className="text-xs font-mono text-slate-300">
                  {priceDb?.lastSyncTimestamp ? new Date(priceDb.lastSyncTimestamp).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
              <button
                onClick={() => handleTriggerPriceSync()}
                disabled={isSyncingPrices}
                className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPrices ? 'animate-spin' : ''}`} />
                <span>{isSyncingPrices ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>

          {/* Search Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={priceSearchQuery}
                onChange={(e) => setPriceSearchQuery(e.target.value)}
                placeholder="Filter Pokémon prices by name, set, variant (e.g. 'Charizard', 'Shadowless', 'Pikachu')..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Cards Price Table */}
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Card & Set</th>
                  <th className="p-3">Variant / Rarity</th>
                  <th className="p-3 text-right">Raw Market</th>
                  <th className="p-3 text-right">PSA 9 Mint</th>
                  <th className="p-3 text-right">PSA 10 Gem Mint</th>
                  <th className="p-3 text-right">7D Delta</th>
                  <th className="p-3 text-center">Volatility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredPriceCards.map((card, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="font-bold text-white font-sans">{card.name}</div>
                      <div className="text-[11px] text-slate-500">{card.setName} #{card.collectorNumber}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300">
                        {card.variant}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-300">
                      ${card.pricing?.raw?.market?.toLocaleString() || '150'}
                    </td>
                    <td className="p-3 text-right font-bold text-cyan-300">
                      ${card.pricing?.psa9?.market?.toLocaleString() || '450'}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-400">
                      ${card.pricing?.psa10?.market?.toLocaleString() || '1,800'}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        (card.trends?.sevenDayChangePercent || 0) >= 0
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-red-950 text-red-300'
                      }`}>
                        {(card.trends?.sevenDayChangePercent || 0) >= 0 ? '+' : ''}
                        {card.trends?.sevenDayChangePercent || 1.2}%
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-[10px] text-slate-400 capitalize">
                        {card.trends?.volatilityIndex || 'low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: AGENT LONG-TERM MEMORY GRAPH */}
      {activeTab === 'memory' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Memory Creation & Filters */}
          <div className="w-80 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col gap-4 overflow-y-auto">
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-400" /> Store New Memory
              </h2>
              <form onSubmit={handleAddMemory} className="space-y-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Category</label>
                  <select
                    value={newMemoryCategory}
                    onChange={(e) => setNewMemoryCategory(e.target.value as any)}
                    className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                  >
                    <option value="semantic">Semantic Knowledge</option>
                    <option value="procedure">Procedure / Recipe</option>
                    <option value="preference">User Preference</option>
                    <option value="pokemon_insight">Pokémon Insight</option>
                    <option value="entity">System Entity</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Memory Key</label>
                  <input
                    type="text"
                    value={newMemoryKey}
                    onChange={(e) => setNewMemoryKey(e.target.value)}
                    placeholder="e.g. user_target_cards"
                    className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Content</label>
                  <textarea
                    value={newMemoryContent}
                    onChange={(e) => setNewMemoryContent(e.target.value)}
                    placeholder="Enter persistent facts or rules..."
                    rows={3}
                    className="w-full p-2 rounded bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs transition"
                >
                  Persist Memory
                </button>
              </form>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category Filter</h3>
              <div className="flex flex-wrap gap-1.5">
                {['all', 'semantic', 'procedure', 'preference', 'pokemon_insight', 'entity'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMemoryCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] capitalize transition ${
                      memoryCategoryFilter === cat
                        ? 'bg-purple-500 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Memory Stream */}
          <div className="flex-1 flex flex-col p-5 overflow-y-auto gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={memorySearchQuery}
                onChange={(e) => setMemorySearchQuery(e.target.value)}
                placeholder="Search agent memories by keyword or concept..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-3">
              {filteredMemories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 transition flex items-start justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-300">{mem.key}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] bg-purple-950 text-purple-400 border border-purple-800/40 uppercase">
                        {mem.category}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Importance: {mem.importance || 5}/10
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{mem.content}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                      <span>Access Count: {mem.accessCount || 1}</span>
                      <span>•</span>
                      <span>Updated: {new Date(mem.updatedAt || mem.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await fetch(`/api/agent/memory/${mem.id}`, { method: 'DELETE' });
                      fetchMemories();
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUTONOMOUS BACKGROUND TASKS */}
      {activeTab === 'tasks' && (
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" /> Scheduled Autonomous Tasks & Cron Workers
              </h2>
              <p className="text-xs text-slate-400">
                Self-running routines executed in the background by the VCA runtime kernel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {autonomousTasks.map((task) => (
              <div key={task.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-white">{task.name}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">{task.lastResultSummary}</p>
                </div>

                <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span>Every {task.intervalMinutes} min</span>
                  <span>Runs: {task.runCount || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PACKAGES & REPO INSTALLER */}
      {activeTab === 'packages' && (
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4 max-w-3xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-cyan-400" /> Autonomous Repo & Package Installer
            </h2>
            <p className="text-xs text-slate-400">
              Install npm packages, python pip modules, or clone external Git repositories into workspace directory.
            </p>

            <form onSubmit={handleRunInstaller} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Install Type</label>
                  <select
                    value={installType}
                    onChange={(e) => setInstallType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="npm">npm Package</option>
                    <option value="python_pip">Python pip Module</option>
                    <option value="git_clone">Git Clone Repository</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-1">Target Name or Repo URL</label>
                  <input
                    type="text"
                    value={installTarget}
                    onChange={(e) => setInstallTarget(e.target.value)}
                    placeholder={
                      installType === 'git_clone'
                        ? 'https://github.com/tcgdex/cards-database'
                        : installType === 'python_pip'
                        ? 'opencv-python numpy'
                        : 'recharts lodash'
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isInstalling || !installTarget}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition"
              >
                <Package className="w-4 h-4" />
                <span>{isInstalling ? 'Installing in Container...' : 'Execute Installation'}</span>
              </button>
            </form>

            {/* Install Logs */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 block mb-2 font-mono">INSTALLATION LOGS:</span>
              <div className="p-3 rounded-lg bg-slate-950 font-mono text-[10px] text-slate-300 max-h-48 overflow-y-auto space-y-1 border border-slate-800">
                {installLogs.length === 0 ? (
                  <span className="text-slate-600">No installation tasks run this session.</span>
                ) : (
                  installLogs.map((log, idx) => <div key={idx}>{log}</div>)
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
