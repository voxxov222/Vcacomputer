import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, X, Flashlight, Settings, Sparkles, RefreshCw, 
  Upload, CheckCircle2, AlertCircle, Scan, Maximize, RotateCcw, 
  Layers, ChevronRight, HelpCircle, Edit3, ShieldCheck
} from 'lucide-react';
import { ValuePopup } from './ValuePopup';
import { ScanTray } from './ScanTray';
import { ManualEntryModal } from './ManualEntryModal';
import { ScannerCardOutput, VARIANT_TAXONOMY } from '../../../server_scanner_api';
import { useAuth } from '../../context/AuthContext';

interface LiveCameraScannerProps {
  onClose: () => void;
  onOpenVault?: () => void;
  isOpen?: boolean;
  onCardAddedToVault?: (card: any) => void;
}

// Curated high-resolution demo cards for desktop/virtual testing
const DEMO_PRESET_CARDS = [
  {
    name: 'Charizard',
    set: 'Base Set',
    cardNumber: '4/102',
    imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
    variant: 'Holo',
    language: 'EN'
  },
  {
    name: 'Umbreon VMAX',
    set: 'Evolving Skies',
    cardNumber: '215/203',
    imageUrl: 'https://images.pokemontcg.io/swsh7/215_hires.png',
    variant: 'Alt Art',
    language: 'EN'
  },
  {
    name: 'Pikachu with Grey Felt Hat',
    set: 'SVP Black Star Promos',
    cardNumber: '085',
    imageUrl: 'https://images.pokemontcg.io/smp/SM85_hires.png',
    variant: 'Promo',
    language: 'EN'
  },
  {
    name: 'Lugia V',
    set: 'Silver Tempest',
    cardNumber: '186/195',
    imageUrl: 'https://images.pokemontcg.io/swsh12/186_hires.png',
    variant: 'Alt Art',
    language: 'EN'
  },
  {
    name: 'Giratina V',
    set: 'Lost Origin',
    cardNumber: '186/196',
    imageUrl: 'https://images.pokemontcg.io/swsh11/186_hires.png',
    variant: 'Alt Art',
    language: 'EN'
  }
];

export const LiveCameraScanner: React.FC<LiveCameraScannerProps> = ({ 
  onClose, 
  onOpenVault, 
  isOpen, 
  onCardAddedToVault 
}) => {
  const { addBatch, addCard, user, openAuthModal } = useAuth();

  // Mode states
  const [scanMode, setScanMode] = useState<'single' | 'multiple'>('single');
  const [language, setLanguage] = useState<'EN' | 'JP'>('EN');
  const [torchOn, setTorchOn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Scanner capture & recognition states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scannedBatch, setScannedBatch] = useState<ScannerCardOutput[]>([]);
  const [latestRecognized, setLatestRecognized] = useState<ScannerCardOutput | null>(null);
  const [popupKey, setPopupKey] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isSavingToVault, setIsSavingToVault] = useState(false);
  const [selectedDemoIdx, setSelectedDemoIdx] = useState(0);
  const [scanSuccessFeedback, setScanSuccessFeedback] = useState<string | null>(null);

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access error (virtual mode fallback available):', err);
      setCameraError('Camera access unavailable or blocked. You can use sample card presets or upload card photos directly.');
      setCameraActive(false);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  // Toggle Torch/Flash if available on mobile
  const toggleTorch = async () => {
    if (!streamRef.current) {
      setTorchOn(!torchOn);
      return;
    }
    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? (track.getCapabilities() as any) : {};
      if (capabilities.torch) {
        await (track as any).applyConstraints({
          advanced: [{ torch: !torchOn }]
        });
      }
      setTorchOn(!torchOn);
    } catch (err) {
      setTorchOn(!torchOn);
    }
  };

  // Perform card recognition from image base64
  const processImageRecognition = async (imageBase64: string, cardHint?: string) => {
    setIsAnalyzing(true);
    setScanSuccessFeedback(null);
    try {
      const res = await fetch('/api/scanner/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          language,
          cardHint,
          targetVariant: scanMode === 'single' ? undefined : undefined
        })
      });

      const data = await res.json();
      if (data.success && data.card) {
        const card: ScannerCardOutput = data.card;
        setLatestRecognized(card);
        setPopupKey(prev => prev + 1);
        setShowPopup(true);

        if (scanMode === 'single') {
          setScannedBatch([card]);
        } else {
          // Multiple mode: append to running batch
          setScannedBatch(prev => [card, ...prev]);
        }

        setScanSuccessFeedback(`Identified ${card.name} (${card.set}) - $${card.rawValue.toFixed(2)}`);
        setTimeout(() => setScanSuccessFeedback(null), 3000);
      } else {
        setCameraError(data.error || 'Could not recognize Pokémon card. Please align clearly within the green frame.');
        setTimeout(() => setCameraError(null), 4000);
      }
    } catch (err: any) {
      setCameraError(err.message || 'Recognition request failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Capture frame from live video feed
  const handleCaptureFrame = () => {
    if (!videoRef.current || !canvasRef.current) {
      // If camera is not active, run against current demo preset
      handleScanPreset(DEMO_PRESET_CARDS[selectedDemoIdx]);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.88);
    processImageRecognition(base64);
  };

  // Handle preset card scan
  const handleScanPreset = async (preset: typeof DEMO_PRESET_CARDS[0]) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/scanner/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `${preset.name} ${preset.set} ${preset.cardNumber}`,
          language: preset.language,
          variant: preset.variant
        })
      });
      const data = await res.json();
      if (data.success && data.card) {
        const card: ScannerCardOutput = data.card;
        setLatestRecognized(card);
        setPopupKey(prev => prev + 1);
        setShowPopup(true);

        if (scanMode === 'single') {
          setScannedBatch([card]);
        } else {
          setScannedBatch(prev => [card, ...prev]);
        }
      }
    } catch (e: any) {
      console.warn('Preset lookup error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle manual file upload from user's filesystem
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        processImageRecognition(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Change variant of a specific card in the batch
  const handleVariantChange = async (index: number, newVariant: string) => {
    const card = scannedBatch[index];
    if (!card) return;

    try {
      const res = await fetch('/api/scanner/price-variant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: card.name,
          set: card.set,
          cardNumber: card.cardNumber,
          variant: newVariant,
          language: card.language
        })
      });
      const data = await res.json();
      if (data.success && data.pricing) {
        const updatedPricing = data.pricing;
        setScannedBatch(prev => {
          const copy = [...prev];
          copy[index] = {
            ...copy[index],
            ...updatedPricing,
            variant: newVariant
          };
          return copy;
        });

        // Trigger value popup with the newly priced variant
        setLatestRecognized({
          ...card,
          ...updatedPricing,
          variant: newVariant
        });
        setPopupKey(prev => prev + 1);
        setShowPopup(true);
      }
    } catch (err) {
      console.error('Variant recalculation error:', err);
    }
  };

  // Remove card from batch
  const handleRemoveCard = (index: number) => {
    setScannedBatch(prev => prev.filter((_, i) => i !== index));
    if (scannedBatch.length <= 1) {
      setShowPopup(false);
    }
  };

  // Persist batch to Firestore User Vault
  const handleSaveToVault = async () => {
    if (scannedBatch.length === 0) return;

    setIsSavingToVault(true);
    try {
      const cardsToSave = scannedBatch.map(c => ({
        name: c.name,
        set: c.set,
        setSymbol: c.setSymbol,
        cardNumber: c.cardNumber,
        language: c.language,
        variant: c.variant,
        rawValue: c.rawValue,
        psa10Value: c.psa10Value,
        psa9Value: c.psa9Value,
        psa8Value: c.psa8Value,
        bgs95Value: c.bgs95Value,
        cgc10Value: c.cgc10Value,
        ebayComps: c.ebayComps || [],
        imageUrl: c.imageUrl,
        scannedAt: new Date().toISOString(),
        lastPriceRefresh: new Date().toISOString(),
        confidence: c.confidence,
        rarity: c.rarity
      }));

      await addBatch(cardsToSave);

      // Trigger callback if provided
      if (cardsToSave.length > 0) {
        onCardAddedToVault?.(cardsToSave[0]);
      }

      // Clear batch and navigate to vault
      setScannedBatch([]);
      setShowPopup(false);
      if (onOpenVault) {
        onOpenVault();
      } else {
        onClose();
      }
    } catch (err: any) {
      setCameraError(err.message || 'Failed to save cards to Firestore vault');
    } finally {
      setIsSavingToVault(false);
    }
  };

  const totalBatchValue = scannedBatch.reduce((acc, c) => acc + (c.rawValue || 0), 0);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 1. TOP BAR HUD */}
      <div className="relative z-30 w-full px-4 pt-4 pb-2 bg-gradient-to-b from-[#060a14]/95 via-[#060a14]/70 to-transparent backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Top-Left: Close X & Recording Indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-cyan-500 text-slate-300 hover:text-white transition shadow-lg"
              title="Close Scanner"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 backdrop-blur">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-300 uppercase">
                VCA HUD LIVE
              </span>
            </div>
          </div>

          {/* Top Center: Single / Multiple Pill Toggle */}
          <div className="bg-slate-950/90 border border-cyan-500/40 p-1 rounded-2xl flex items-center shadow-lg shadow-cyan-950/50">
            <button
              onClick={() => setScanMode('single')}
              className={`px-3.5 py-1 rounded-xl text-xs font-mono font-bold tracking-wider transition ${
                scanMode === 'single'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SINGLE
            </button>
            <button
              onClick={() => setScanMode('multiple')}
              className={`px-3.5 py-1 rounded-xl text-xs font-mono font-bold tracking-wider transition flex items-center gap-1.5 ${
                scanMode === 'multiple'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>MULTIPLE</span>
              {scannedBatch.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-slate-950 text-cyan-300 text-[10px] flex items-center justify-center font-bold">
                  {scannedBatch.length}
                </span>
              )}
            </button>
          </div>

          {/* Top-Right: Torch / Flashlight & Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTorch}
              className={`p-2.5 rounded-2xl border transition shadow-lg ${
                torchOn
                  ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-yellow-500/30'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500'
              }`}
              title="Toggle Flash / Torch"
            >
              <Flashlight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (user && !user.isAnonymous) {
                  onOpenVault();
                } else {
                  openAuthModal();
                }
              }}
              className="px-3 py-2 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition"
            >
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">VAULT</span>
            </button>
          </div>

        </div>

        {/* Sub-bar: Language Pill Toggle (EN / JP) */}
        <div className="max-w-7xl mx-auto mt-2 flex items-center justify-center">
          <div className="bg-slate-950/80 border border-slate-800 px-1 py-0.5 rounded-xl flex items-center gap-1 text-[11px] font-mono">
            <span className="text-slate-500 px-1.5 text-[9px] uppercase font-bold">Card Language:</span>
            <button
              onClick={() => setLanguage('EN')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                language === 'EN'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇺🇸 EN</span>
            </button>
            <button
              onClick={() => setLanguage('JP')}
              className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                language === 'JP'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇯🇵 JP</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN VIEWFINDER & OPTICAL BOUNDING BOX */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        
        {/* Live Video Feed */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-20'}`}
        />

        {/* Ambient Dark Holographic Scanline Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,10,20,0.85)_100%)] pointer-events-none" />

        {/* Green Bounding Box with Corner Grid Lines */}
        <div className="relative z-20 w-[270px] sm:w-[320px] md:w-[360px] aspect-[2.5/3.5] flex items-center justify-center pointer-events-none">
          
          {/* Glowing Green Edge Outline */}
          <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/80 shadow-[0_0_25px_rgba(52,211,153,0.3)] transition-all" />

          {/* Animated Laser Scan Line */}
          <div className="absolute left-1 right-1 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-[bounce_3s_infinite]" />

          {/* Precision Corner Grid Lines */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-300 rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-300 rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-300 rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-300 rounded-br-lg" />

          {/* Alignment Crosshairs & Center Reticle */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="w-12 h-12 border border-emerald-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
            </div>
          </div>

          {/* Target Alignment Guide Tag */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase">
            ALIGN CARD IN FRAME
          </div>

          {/* Giant Animated Gold Value Pop-Up (Rendered above bounding box) */}
          <ValuePopup
            value={latestRecognized?.rawValue || null}
            cardName={latestRecognized?.name}
            variant={latestRecognized?.variant}
            keyTrigger={popupKey}
            isVisible={showPopup}
          />
        </div>

        {/* Scan Status Feedback Indicator */}
        {scanSuccessFeedback && (
          <div className="absolute bottom-28 z-30 px-4 py-2 rounded-2xl bg-emerald-950/90 border border-emerald-400/60 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{scanSuccessFeedback}</span>
          </div>
        )}

        {/* If Camera is not active / Desktop testing helper */}
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 pointer-events-auto bg-[#060a14]/90">
            <div className="max-w-md w-full text-center space-y-4 bg-[#080e1e] border border-cyan-500/30 p-6 rounded-3xl shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-mono">OPTICAL CAMERA FEED READY</h3>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                Click below to simulate real-time card capture from high-precision references or upload any card photograph.
              </p>

              {/* Preset card selector for testing */}
              <div className="space-y-2 text-left">
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Select Test Target:</div>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_PRESET_CARDS.map((preset, idx) => (
                    <button
                      key={preset.name}
                      onClick={() => {
                        setSelectedDemoIdx(idx);
                        handleScanPreset(preset);
                      }}
                      className={`p-2 rounded-xl text-left border text-xs font-mono transition truncate ${
                        selectedDemoIdx === idx
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold truncate">{preset.name}</div>
                      <div className="text-[10px] opacity-75">{preset.set}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-mono text-xs font-bold flex items-center gap-2 hover:bg-cyan-400 transition">
                  <Upload className="w-4 h-4" />
                  <span>UPLOAD CARD PHOTO</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Center Trigger Capture Button (When camera is live) */}
        {cameraActive && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6">
            {/* Upload image button */}
            <label className="p-3 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 cursor-pointer transition shadow-xl">
              <Upload className="w-5 h-5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>

            {/* Shutter / OCR trigger button */}
            <button
              onClick={handleCaptureFrame}
              disabled={isAnalyzing}
              className="w-18 h-18 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 p-1 shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 transition transform flex items-center justify-center group"
            >
              <div className="w-full h-full rounded-full bg-slate-950 group-hover:bg-slate-900 flex items-center justify-center border-2 border-white/80">
                {isAnalyzing ? (
                  <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-emerald-300 group-hover:scale-110 transition" />
                )}
              </div>
            </button>

            {/* Manual OCR / Query Button */}
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="p-3 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 transition shadow-xl"
              title="Manual Search / OCR"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Floating Manual Search Button on bottom-right */}
        {!cameraActive && (
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="absolute bottom-6 right-6 z-30 p-3.5 rounded-full bg-cyan-950 border border-cyan-500/60 text-cyan-300 hover:text-white hover:scale-110 shadow-2xl transition flex items-center gap-2 font-mono text-xs font-bold"
            title="Manual Search"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">TYPE / SEARCH</span>
          </button>
        )}

      </div>

      {/* 3. BOTTOM SCAN TRAY & RUNNING BATCH PERSISTENCE */}
      <ScanTray
        scannedCards={scannedBatch}
        onVariantChange={handleVariantChange}
        onRemoveCard={handleRemoveCard}
        onAddToVault={handleSaveToVault}
        onOpenManualEntry={() => setIsManualModalOpen(true)}
        isSaving={isSavingToVault}
        totalValue={totalBatchValue}
        userEmail={user?.email}
      />

      {/* Manual Entry / OCR Modal */}
      <ManualEntryModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onCardFound={(card) => {
          setLatestRecognized(card);
          setPopupKey(prev => prev + 1);
          setShowPopup(true);
          if (scanMode === 'single') {
            setScannedBatch([card]);
          } else {
            setScannedBatch(prev => [card, ...prev]);
          }
        }}
        language={language}
      />

    </div>
  );
};
