import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Terminal,
  Play,
  Square,
  RefreshCw,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Settings2,
  Cpu,
  Folder,
  Sliders,
  Send,
  Zap,
  Radio,
  AudioWaveform
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
  audioUrl?: string;
  executedTools?: ExecutedTool[];
}

export const VoiceAgentOverlay: React.FC = () => {
  const {
    isVoiceAgentOpen,
    setVoiceAgentOpen,
    openWindow,
    setActiveScreenIndex,
    setScreenLayout
  } = useOS();

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceName, setVoiceName] = useState<'Zephyr' | 'Kore' | 'Puck' | 'Fenrir' | 'Charon'>('Zephyr');
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your VCA Voice & Autonomous Terminal Agent. Speak to me or tap the microphone to run shell commands, inspect trading cards, launch emulators, and control your OS workspace.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [currentTranscript, setCurrentTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [expandedToolMsgId, setExpandedToolMsgId] = useState<string | null>(null);

  // Audio & Speech References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const isHandsFreeRef = useRef(isHandsFree);

  useEffect(() => {
    isHandsFreeRef.current = isHandsFree;
  }, [isHandsFree]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, currentTranscript, isThinking]);

  // Initialize Web Speech Recognition if available in browser
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        if (transcript) {
          setCurrentTranscript(transcript);
        }

        if (finalTranscript) {
          handleSendTranscript(finalTranscript.trim());
          setCurrentTranscript('');
        }
      };

      recognition.onerror = (err: any) => {
        if (err.error !== 'no-speech') {
          console.warn('Speech recognition event:', err.error);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      stopListening();
    };
  }, []);

  // Visualizer Loop
  const startVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (e) {
      console.warn('Audio visualizer init error:', e);
    }
  };

  const stopVisualizer = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  };

  // Start Mic & Recording
  const startListening = async () => {
    if (isSpeaking) {
      stopSpeaking();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startVisualizer(stream);

      // Start MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(250);
      setIsListening(true);

      // Also start SpeechRecognition if available for instantaneous real-time transcription
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    } catch (err: any) {
      console.error('Failed to get microphone:', err);
      setIsListening(false);
      alert('Microphone access was denied or is unavailable. You can still type commands directly.');
    }
  };

  const stopListening = () => {
    setIsListening(false);
    stopVisualizer();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Speech Output Playback
  const playSpeech = (text: string, audioBase64?: string) => {
    if (isMuted) return;

    // 1. If Gemini TTS audio is returned, play it directly
    if (audioBase64) {
      try {
        if (audioElementRef.current) {
          audioElementRef.current.pause();
        }
        const audioSrc = `data:audio/mp3;base64,${audioBase64}`;
        const audio = new Audio(audioSrc);
        audioElementRef.current = audio;

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          if (isHandsFreeRef.current && isVoiceAgentOpen) {
            startListening();
          }
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          fallbackSpeechSynthesis(text);
        };

        audio.play().catch(() => fallbackSpeechSynthesis(text));
        return;
      } catch {
        fallbackSpeechSynthesis(text);
      }
    } else {
      fallbackSpeechSynthesis(text);
    }
  };

  const fallbackSpeechSynthesis = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code output displayed on terminal.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .slice(0, 500);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    // Pick best available voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.lang.startsWith('en')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (isHandsFreeRef.current && isVoiceAgentOpen) {
        startListening();
      }
    };
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Process User Input (Spoken or Typed)
  const handleSendTranscript = async (inputStr: string) => {
    const textToSend = inputStr.trim();
    if (!textToSend || isThinking) return;

    stopListening();
    stopSpeaking();

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setTextInput('');
    setCurrentTranscript('');
    setIsThinking(true);

    try {
      // Build conversation history for API
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/voice-agent/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToSend,
          history: historyPayload,
          voiceName
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const replyContent = data.response || "I have processed your request.";
      const executedTools: ExecutedTool[] = data.executedTools || [];
      const osActions: any[] = data.osActions || [];

      // Execute OS Actions in the UI if triggered
      for (const act of osActions) {
        if (act.action === 'open_app' && act.appId) {
          openWindow(act.appId);
        } else if (act.action === 'switch_screen' && typeof act.screenIndex === 'number') {
          setActiveScreenIndex(act.screenIndex);
        } else if (act.action === 'set_layout' && act.layout) {
          setScreenLayout(0, act.layout);
        } else if (act.action === 'launch_emulator') {
          openWindow('emulator', act.emulatorConfig);
        }
      }

      const assistantMessage: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        executedTools
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsThinking(false);

      // Speak response out loud
      playSpeech(replyContent, data.audioBase64);
    } catch (err: any) {
      console.error('Failed to converse with voice agent:', err);
      setIsThinking(false);
      const errMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an issue executing your command: ${err.message || 'Network error'}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMessage]);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick Action Chips
  const quickActions = [
    { label: 'Git Status', cmd: 'run git status' },
    { label: 'List Files', cmd: 'list all files in the root folder' },
    { label: 'Check CPU & RAM', cmd: 'inspect system memory and running processes' },
    { label: 'Open Terminal', cmd: 'open terminal app' },
    { label: 'Charizard Price', cmd: 'what is the current market price of 1st edition Charizard?' },
    { label: 'Launch Samsung S26', cmd: 'launch android emulator with Samsung Galaxy S26 Ultra' },
    { label: 'Switch to Screen 2', cmd: 'switch to virtual screen 2' }
  ];

  if (!isVoiceAgentOpen) {
    return (
      <button
        onClick={() => setVoiceAgentOpen(true)}
        className="fixed bottom-14 right-5 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-linear-to-r from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-950/40 hover:shadow-cyan-500/30 border border-cyan-400/40 hover:scale-105 transition-all group backdrop-blur-md"
        title="Open 2-Way Voice Agent & Terminal AI"
      >
        <div className="relative flex items-center justify-center">
          <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <span className="text-xs font-semibold tracking-wide">Voice AI Agent</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-400/30 text-cyan-200">Terminal Ready</span>
      </button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className={`fixed z-50 transition-all duration-300 ${
          isExpanded
            ? 'inset-4 md:inset-10 flex flex-col'
            : 'bottom-16 right-4 sm:right-6 w-[94vw] sm:w-[480px] h-[580px] max-h-[82vh] flex flex-col'
        } rounded-2xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl shadow-cyan-950/80 backdrop-blur-2xl overflow-hidden font-sans text-slate-100`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-900/40 bg-linear-to-r from-slate-900/90 via-slate-950/90 to-cyan-950/30">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-cyan-500 to-blue-600 border border-cyan-300/40 shadow-md shadow-cyan-500/20">
              <Sparkles className="w-4 h-4 text-white" />
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold tracking-wide text-cyan-100">VCA Voice AI Agent</h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 font-mono">
                  Live 2-Way
                </span>
              </div>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-cyan-400 animate-pulse' : isListening ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                {isSpeaking ? 'Agent Speaking...' : isListening ? 'Listening to Microphone...' : isThinking ? 'Executing System Tools...' : 'Ready for Voice Commands'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-1.5 rounded-lg transition-colors ${
                isMuted ? 'text-rose-400 hover:bg-rose-950/40' : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg transition-colors ${
                showSettings ? 'bg-cyan-950/80 text-cyan-300' : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
              }`}
              title="Voice Settings"
            >
              <Settings2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition-colors"
              title={isExpanded ? 'Restore Size' : 'Maximize Window'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                stopListening();
                stopSpeaking();
                setVoiceAgentOpen(false);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional Settings Panel Drawer */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-slate-900/90 border-b border-cyan-900/40 p-3.5 text-xs text-slate-300 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-cyan-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Voice Configuration
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-[11px] text-slate-400">Continuous 2-Way (Hands-Free):</span>
                  <input
                    type="checkbox"
                    checked={isHandsFree}
                    onChange={(e) => setIsHandsFree(e.target.checked)}
                    className="accent-cyan-500 rounded cursor-pointer"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Gemini AI Voice Model:</label>
                  <select
                    value={voiceName}
                    onChange={(e: any) => setVoiceName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-slate-200 focus:border-cyan-400 outline-none"
                  >
                    <option value="Zephyr">Zephyr (Balanced / Futuristic)</option>
                    <option value="Kore">Kore (Warm / Professional)</option>
                    <option value="Puck">Puck (Crisp / Dynamic)</option>
                    <option value="Fenrir">Fenrir (Deep / Authoritative)</option>
                    <option value="Charon">Charon (Technical / Precise)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Speech Speed Rate: ({speechRate}x)</label>
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Voice Waveform & Pulse Visualizer Area */}
        <div className="relative px-4 py-3 bg-linear-to-b from-slate-950 via-cyan-950/20 to-slate-950 border-b border-cyan-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Pulsing Orb Visualizer */}
            <div className="relative flex items-center justify-center">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isSpeaking
                    ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-lg shadow-cyan-500/50'
                    : isListening
                    ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-lg shadow-emerald-500/50'
                    : isThinking
                    ? 'bg-amber-500/20 border-2 border-amber-400 shadow-lg shadow-amber-500/50 animate-spin'
                    : 'bg-slate-800/40 border border-slate-700'
                }`}
                style={{
                  transform: isListening ? `scale(${1 + audioLevel * 0.005})` : isSpeaking ? 'scale(1.08)' : 'scale(1)'
                }}
              >
                {isSpeaking ? (
                  <AudioWaveform className="w-5 h-5 text-cyan-300 animate-pulse" />
                ) : isListening ? (
                  <Mic className="w-5 h-5 text-emerald-300 animate-pulse" />
                ) : isThinking ? (
                  <RefreshCw className="w-5 h-5 text-amber-300" />
                ) : (
                  <Radio className="w-5 h-5 text-slate-400" />
                )}
              </div>

              {/* Orbital Ring Animation when Active */}
              {(isListening || isSpeaking) && (
                <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping" />
              )}
            </div>

            {/* Audio Wave Frequency Bars */}
            <div className="flex items-end gap-1 h-7">
              {[...Array(14)].map((_, i) => {
                const height = isListening
                  ? Math.max(4, Math.min(28, (audioLevel * (0.4 + (i % 5) * 0.15)) * (1.2 - Math.abs(7 - i) * 0.1)))
                  : isSpeaking
                  ? Math.max(4, 8 + Math.sin(Date.now() / 150 + i) * 12)
                  : isThinking
                  ? 4 + (i % 4) * 3
                  : 3;
                return (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      isListening
                        ? 'bg-emerald-400'
                        : isSpeaking
                        ? 'bg-cyan-400'
                        : isThinking
                        ? 'bg-amber-400'
                        : 'bg-slate-700'
                    }`}
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Quick Mic Action Button */}
          <div className="flex items-center gap-2">
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs hover:bg-rose-900/60 transition-colors"
              >
                <Square className="w-3.5 h-3.5 fill-current" /> Stop Audio
              </button>
            )}

            <button
              onClick={toggleListening}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-md ${
                isListening
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/30 animate-pulse'
                  : 'bg-linear-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/20'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" /> Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" /> Speak Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Audio Transcript Preview when user is speaking */}
        {currentTranscript && (
          <div className="px-4 py-2 bg-cyan-950/40 border-b border-cyan-500/20 text-xs text-cyan-200 flex items-center gap-2 animate-pulse">
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-slate-400">Hearing:</span>
            <span className="italic font-medium">"{currentTranscript}"</span>
          </div>
        )}

        {/* Conversation Message List */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                {msg.role === 'user' ? (
                  <>
                    <span>You</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-300 font-medium">VCA Agent</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </>
                )}
              </div>

              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-linear-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/40 rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 shadow-md shadow-slate-950/60 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Executed Tools Drawer (Terminal Commands, Files, etc.) */}
                {msg.executedTools && msg.executedTools.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-cyan-300">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        Executed Real System Tools ({msg.executedTools.length}):
                      </span>
                      <button
                        onClick={() =>
                          setExpandedToolMsgId(expandedToolMsgId === msg.id ? null : msg.id)
                        }
                        className="text-[10px] text-slate-400 hover:text-cyan-200 flex items-center gap-0.5"
                      >
                        {expandedToolMsgId === msg.id ? (
                          <>Hide Details <ChevronUp className="w-3 h-3" /></>
                        ) : (
                          <>View Details <ChevronDown className="w-3 h-3" /></>
                        )}
                      </button>
                    </div>

                    {msg.executedTools.map((tool, tIdx) => (
                      <div
                        key={tIdx}
                        className="rounded-lg bg-slate-950/80 border border-cyan-900/40 p-2 text-[11px] font-mono"
                      >
                        <div className="flex items-center justify-between text-cyan-400">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-[10px] text-cyan-300">
                              {tool.name}
                            </span>
                            {tool.args?.command && (
                              <span className="text-slate-200 truncate max-w-[220px]">
                                $ {tool.args.command}
                              </span>
                            )}
                          </div>
                          {tool.result?.exitCode !== undefined && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded ${
                                tool.result.exitCode === 0
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              exit {tool.result.exitCode}
                            </span>
                          )}
                        </div>

                        {/* Collapsible Tool Output Details */}
                        {(expandedToolMsgId === msg.id || msg.executedTools.length === 1) && (
                          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] space-y-1">
                            {tool.result?.stdout && (
                              <div className="bg-slate-900 p-2 rounded max-h-36 overflow-y-auto text-emerald-300 whitespace-pre-wrap">
                                {tool.result.stdout}
                              </div>
                            )}
                            {tool.result?.stderr && (
                              <div className="bg-rose-950/50 p-2 rounded max-h-36 overflow-y-auto text-rose-300 whitespace-pre-wrap">
                                {tool.result.stderr}
                              </div>
                            )}
                            {tool.name === 'execute_terminal_command' && (
                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      tool.result?.stdout || tool.result?.stderr || '',
                                      `${msg.id}-${tIdx}`
                                    )
                                  }
                                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-200"
                                >
                                  {copiedId === `${msg.id}-${tIdx}` ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" /> Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" /> Copy Output
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => openWindow('terminal')}
                                  className="flex items-center gap-1 text-[10px] text-cyan-400 hover:underline"
                                >
                                  <ExternalLink className="w-3 h-3" /> Open in Terminal
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Voice Replay Button */}
                {msg.role === 'assistant' && (
                  <div className="mt-2 flex items-center justify-end">
                    <button
                      onClick={() => playSpeech(msg.content)}
                      className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-300 transition-colors"
                      title="Replay Voice Audio"
                    >
                      <Volume2 className="w-3 h-3" /> Replay Speech
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Thinking / Running Indicator */}
          {isThinking && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 text-xs text-cyan-300 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Executing terminal tools & generating conversational response...</span>
            </div>
          )}
        </div>

        {/* Quick Action Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider shrink-0 mr-1">
            Quick:
          </span>
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleSendTranscript(action.cmd)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-cyan-200 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Bottom Input Field & Mic Bar */}
        <div className="p-3 bg-slate-900/90 border-t border-cyan-900/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendTranscript(textInput);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={isListening ? "Listening... Speak your command or question" : "Speak into mic or type a command (e.g. 'run git status', 'open terminal')..."}
                disabled={isThinking}
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner"
              />
              {textInput && (
                <button
                  type="button"
                  onClick={() => setTextInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Mic Toggle Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all shadow-md ${
                isListening
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
              }`}
              title={isListening ? "Stop Microphone" : "Start Voice Input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!textInput.trim() || isThinking}
              className="p-2.5 rounded-xl bg-linear-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-cyan-950/40"
              title="Send Command"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
