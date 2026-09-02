import React, { useState, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { WallpaperConfig } from '../../types/os';
import { runtimeApi } from '../../lib/runtimeApi';
import {
  Palette,
  Upload,
  Link2,
  Sliders,
  Image as ImageIcon,
  Film,
  Sparkles,
  Check,
  X,
  Play,
  RotateCcw,
  Eye,
  FileVideo,
  Monitor
} from 'lucide-react';

interface WallpaperPreset {
  id: string;
  name: string;
  type: WallpaperConfig['type'];
  url?: string;
  category: 'Live Canvas' | 'Animated GIF' | 'Video Loop' | 'Cyber Gradient';
  preview: string;
  description: string;
}

const PRESET_WALLPAPERS: WallpaperPreset[] = [
  {
    id: 'matrix-rain',
    name: 'Matrix Digital Rain',
    type: 'matrix',
    category: 'Live Canvas',
    preview: 'linear-gradient(180deg, #05140d 0%, #002b18 50%, #020a06 100%)',
    description: 'Real-time interactive Katakana glyph stream with glowing particle heads.'
  },
  {
    id: 'cyber-neon-gif',
    name: 'Cyberpunk Neon Metropolis',
    type: 'gif',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1920&q=80',
    category: 'Animated GIF',
    preview: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=400&q=80',
    description: 'High-energy cyberpunk skyline with pulsing holographic neon lighting.'
  },
  {
    id: 'lofi-night-gif',
    name: 'Lo-Fi Rain & City Lights',
    type: 'gif',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
    category: 'Animated GIF',
    preview: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
    description: 'Atmospheric nocturnal city view with soft raindrops and glowing ambient signs.'
  },
  {
    id: 'deep-space-preset',
    name: 'Deep Nebula Space',
    type: 'preset',
    id_preset: 'deep-space',
    category: 'Cyber Gradient',
    preview: 'linear-gradient(to bottom right, #1e1b4b, #020617, #2e1065)',
    description: 'Ultraviolet cosmic dust cloud with deep void horizon.'
  } as any,
  {
    id: 'cyber-dark-preset',
    name: 'Graphite Cyber Lab',
    type: 'preset',
    id_preset: 'cyber-dark',
    category: 'Cyber Gradient',
    preview: 'linear-gradient(to bottom right, #090d16, #020617, #0b1329)',
    description: 'Precision engineered dark matte background with slate undertones.'
  } as any,
  {
    id: 'electric-cyan-preset',
    name: 'Electric Cyan Grid',
    type: 'preset',
    id_preset: 'electric-cyan',
    category: 'Cyber Gradient',
    preview: 'linear-gradient(to bottom right, #042f2e, #020617, #083344)',
    description: 'Luminescent teal-cyan energy field for focused development.'
  } as any,
  {
    id: 'sci-fi-video-sample',
    name: 'Orbital Gateway (Video Loop)',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    category: 'Video Loop',
    preview: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
    description: 'Looping high-definition ambient motion backdrop.'
  }
];

const SAMPLE_URLS = [
  {
    title: 'Cyberpunk Neon Skyline GIF',
    type: 'gif',
    url: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif'
  },
  {
    title: 'Retro 80s Synthwave Drive GIF',
    type: 'gif',
    url: 'https://media.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.gif'
  },
  {
    title: 'Matrix Rain Terminal GIF',
    type: 'gif',
    url: 'https://media.giphy.com/media/A06UFEx8jxEwU/giphy.gif'
  },
  {
    title: 'Ambient Deep Sea Video Loop',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  }
];

export const WallpaperModal: React.FC = () => {
  const {
    isWallpaperModalOpen,
    setWallpaperModalOpen,
    wallpaperConfig,
    setWallpaperConfig,
    logActivity,
    addNotification
  } = useOS();

  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url' | 'adjust'>('presets');
  
  // URL Tab state
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState<'image' | 'gif' | 'video'>('gif');
  const [urlPreviewError, setUrlPreviewError] = useState(false);

  // Upload Tab state
  const [uploadedPreview, setUploadedPreview] = useState<{
    url: string;
    type: 'image' | 'gif' | 'video';
    name: string;
    size: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Adjustments state (local buffer before applying)
  const [blurVal, setBlurVal] = useState(wallpaperConfig.blur ?? 0);
  const [dimVal, setDimVal] = useState(wallpaperConfig.dim ?? 20);
  const [fitVal, setFitVal] = useState<'cover' | 'contain' | 'repeat'>(wallpaperConfig.fit ?? 'cover');

  if (!isWallpaperModalOpen) return null;

  const handleApplyPreset = (preset: WallpaperPreset) => {
    const newConfig: WallpaperConfig = {
      type: preset.type,
      id: (preset as any).id_preset || preset.id,
      name: preset.name,
      url: preset.url,
      blur: blurVal,
      dim: dimVal,
      fit: fitVal
    };
    setWallpaperConfig(newConfig);
    logActivity('WALLPAPER_CHANGED', `Applied preset "${preset.name}"`);
    addNotification({
      title: 'Wallpaper Updated',
      message: `Switched desktop canvas to ${preset.name}`,
      type: 'success'
    });
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    const isVideo = urlType === 'video' || /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(urlInput);
    const isGif = urlType === 'gif' || /\.gif(\?.*)?$/i.test(urlInput);
    const resolvedType = isVideo ? 'video' : isGif ? 'gif' : 'image';

    const newConfig: WallpaperConfig = {
      type: resolvedType,
      id: `custom-url-${Date.now()}`,
      name: 'Custom Web Wallpaper',
      url: urlInput.trim(),
      blur: blurVal,
      dim: dimVal,
      fit: fitVal
    };
    setWallpaperConfig(newConfig);
    logActivity('WALLPAPER_CHANGED', `Applied custom URL wallpaper (${resolvedType.toUpperCase()})`);
    addNotification({
      title: 'Custom Wallpaper Applied',
      message: `Loaded live ${resolvedType.toUpperCase()} from web URL`,
      type: 'success'
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg)$/i.test(file.name);
      const isGif = file.type === 'image/gif' || file.name.endsWith('.gif');
      const mediaType: 'image' | 'gif' | 'video' = isVideo ? 'video' : isGif ? 'gif' : 'image';

      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        setUploadedPreview({
          url: dataUrl,
          type: mediaType,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        });

        // Also upload to local server storage
        try {
          await runtimeApi.uploadWallpaper(file.name, dataUrl, file.type);
        } catch (err) {
          console.warn('Server wallpaper upload failed, relying on local base64:', err);
        }

        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert(`Failed to load file: ${err.message}`);
      setIsUploading(false);
    }
  };

  const handleApplyUploaded = () => {
    if (!uploadedPreview) return;
    const newConfig: WallpaperConfig = {
      type: uploadedPreview.type,
      id: `uploaded-${Date.now()}`,
      name: uploadedPreview.name,
      url: uploadedPreview.url,
      blur: blurVal,
      dim: dimVal,
      fit: fitVal
    };
    setWallpaperConfig(newConfig);
    logActivity('WALLPAPER_CHANGED', `Applied uploaded file "${uploadedPreview.name}"`);
    addNotification({
      title: 'Uploaded Wallpaper Applied',
      message: `Desktop canvas updated with ${uploadedPreview.name}`,
      type: 'success'
    });
  };

  const handleSaveAdjustments = () => {
    setWallpaperConfig({
      ...wallpaperConfig,
      blur: blurVal,
      dim: dimVal,
      fit: fitVal
    });
    logActivity('WALLPAPER_ADJUSTED', `Adjusted blur: ${blurVal}px, dim: ${dimVal}%`);
  };

  return (
    <div
      onClick={() => setWallpaperModalOpen(false)}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100"
      >
        {/* Modal Header */}
        <div className="h-14 bg-slate-950/80 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Desktop Background & Wallpaper Studio
              </h2>
              <p className="text-[11px] text-slate-400">
                Customize with animated GIFs, looping videos, live matrix canvas, or custom images
              </p>
            </div>
          </div>
          <button
            onClick={() => setWallpaperModalOpen(false)}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="h-11 bg-slate-950/40 border-b border-slate-800/80 px-6 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'presets'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Presets & Live Canvas
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'upload'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Upload File (GIF / Video / Image)
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'url'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" /> Enter Media URL
          </button>

          <button
            onClick={() => setActiveTab('adjust')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'adjust'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Effects & Blur
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Curated Dynamic & Ambient Wallpapers
                </span>
                <span className="text-[11px] text-cyan-400 font-mono">
                  Active: {wallpaperConfig.name || wallpaperConfig.type}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {PRESET_WALLPAPERS.map((preset) => {
                  const isCurrent =
                    (preset.type === 'matrix' && wallpaperConfig.type === 'matrix') ||
                    (preset.url && wallpaperConfig.url === preset.url) ||
                    ((preset as any).id_preset && wallpaperConfig.id === (preset as any).id_preset);

                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`group relative rounded-2xl border p-3 flex flex-col justify-between cursor-pointer transition-all duration-200 overflow-hidden ${
                        isCurrent
                          ? 'border-cyan-400 bg-slate-800/90 shadow-xl ring-2 ring-cyan-500/30'
                          : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {/* Preview Box */}
                      <div className="relative h-28 w-full rounded-xl overflow-hidden mb-2.5 border border-slate-800 flex items-center justify-center">
                        {preset.type === 'matrix' ? (
                          <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center font-mono text-emerald-400 text-[10px] p-2 leading-tight">
                            <span className="animate-pulse">01010101 MATRIX</span>
                            <span className="text-cyan-300">アイウエオカキクケコ</span>
                            <span className="text-emerald-500 text-[9px]">LIVE CANVAS ENGINE</span>
                          </div>
                        ) : preset.preview.startsWith('http') ? (
                          <img
                            src={preset.preview}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{ background: preset.preview }}
                          />
                        )}

                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-950/80 text-cyan-300 border border-slate-700/80 backdrop-blur-md">
                          {preset.category}
                        </span>

                        {isCurrent && (
                          <div className="absolute top-2 right-2 p-1 rounded-full bg-cyan-500 text-slate-950">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                          {preset.name}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                          {preset.description}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyPreset(preset);
                        }}
                        className={`mt-3 w-full py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                          isCurrent
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                            : 'bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300'
                        }`}
                      >
                        {isCurrent ? <Check className="w-3.5 h-3.5" /> : null}
                        {isCurrent ? 'Current Active' : 'Set as Desktop'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-3xl p-8 text-center bg-slate-950/60 transition-colors flex flex-col items-center justify-center gap-3">
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Upload Media for Desktop Background</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    Select any <span className="text-cyan-300 font-semibold">Animated GIF (.gif)</span>,{' '}
                    <span className="text-purple-300 font-semibold">Video (.mp4, .webm, .mov)</span>, or{' '}
                    <span className="text-emerald-300 font-semibold">High-Res Image (.png, .jpg, .webp)</span>.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  {isUploading ? (
                    <span>Processing Media...</span>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" /> Browse Device Files
                    </>
                  )}
                </button>
              </div>

              {/* Uploaded File Preview Card */}
              {uploadedPreview && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden border border-slate-800 bg-black shrink-0 flex items-center justify-center">
                    {uploadedPreview.type === 'video' ? (
                      <video
                        src={uploadedPreview.url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={uploadedPreview.url}
                        alt="Uploaded preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900/90 text-cyan-300 border border-slate-700">
                      {uploadedPreview.type.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 space-y-1.5 w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{uploadedPreview.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {uploadedPreview.size}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Media parsed and ready for background rendering with loop capability.
                    </p>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={handleApplyUploaded}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg transition"
                      >
                        <Check className="w-3.5 h-3.5" /> Apply as Desktop Background
                      </button>
                      <button
                        onClick={() => setUploadedPreview(null)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: URL DIRECT STREAM */}
          {activeTab === 'url' && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Direct Media URL (GIF, MP4/WebM Video, or Image)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        setUrlPreviewError(false);
                      }}
                      placeholder="https://example.com/ambient_cyberpunk_loop.gif"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                    />
                    <button
                      onClick={handleApplyUrl}
                      disabled={!urlInput.trim()}
                      className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl transition shadow"
                    >
                      Apply URL
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-slate-400">Media Type:</span>
                  {(['gif', 'video', 'image'] as const).map((t) => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="radio"
                        name="urlMediaType"
                        checked={urlType === t}
                        onChange={() => setUrlType(t)}
                        className="accent-cyan-400"
                      />
                      <span className="uppercase font-mono text-[11px] font-semibold">{t}</span>
                    </label>
                  ))}
                </div>

                {/* Instant Sample URL Quick-Picks */}
                <div className="pt-2 border-t border-slate-900 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Quick Sample Streams (Click to Test)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SAMPLE_URLS.map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setUrlInput(sample.url);
                          setUrlType(sample.type as any);
                        }}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between text-xs text-slate-300 hover:text-cyan-300 transition"
                      >
                        <div className="truncate pr-2">
                          <span className="font-semibold block">{sample.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono truncate block">{sample.url}</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-mono bg-slate-950 text-cyan-400 border border-slate-800">
                          {sample.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview Box */}
                {urlInput && (
                  <div className="mt-4 p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" /> Live Stream Preview
                    </span>
                    <div className="relative h-44 rounded-lg overflow-hidden bg-black flex items-center justify-center">
                      {urlType === 'video' ? (
                        <video
                          src={urlInput}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={urlInput}
                          alt="URL preview"
                          onError={() => setUrlPreviewError(true)}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {urlPreviewError && (
                        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-rose-400 text-xs p-4 text-center">
                          <span>Failed to load preview from URL. Ensure CORS or direct file access is allowed.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ADJUSTMENTS & EFFECTS */}
          {activeTab === 'adjust' && (
            <div className="space-y-6 bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" /> Canvas Visual Filters & Dimming
              </h3>

              {/* Blur Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Backdrop Blur</span>
                  <span className="text-cyan-400 font-mono">{blurVal}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="1"
                  value={blurVal}
                  onChange={(e) => setBlurVal(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2"
                />
                <p className="text-[11px] text-slate-500">
                  Adds frosted glass Gaussian blur to simplify readability of desktop icons and active windows.
                </p>
              </div>

              {/* Dim / Darkness Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Dark Overlay & Contrast</span>
                  <span className="text-cyan-400 font-mono">{dimVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={dimVal}
                  onChange={(e) => setDimVal(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2"
                />
                <p className="text-[11px] text-slate-500">
                  Dims bright background scenes or GIFs so app windows and desktop text maintain high contrast.
                </p>
              </div>

              {/* Fit Mode */}
              <div className="space-y-2">
                <span className="text-xs text-slate-300 font-semibold block">Aspect Ratio & Fitting</span>
                <div className="grid grid-cols-3 gap-3">
                  {(['cover', 'contain', 'repeat'] as const).map((fit) => (
                    <button
                      key={fit}
                      onClick={() => setFitVal(fit)}
                      className={`p-3 rounded-xl border text-center text-xs font-semibold capitalize transition ${
                        fitVal === fit
                          ? 'border-cyan-400 bg-slate-800 text-white shadow'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {fit === 'cover' ? 'Fill (Cover)' : fit === 'contain' ? 'Fit (Contain)' : 'Tile (Repeat)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveAdjustments}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition"
                >
                  <Check className="w-4 h-4" /> Save Visual Adjustments
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="h-14 bg-slate-950 border-t border-slate-800 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span>Desktop compositor supports video loops, animated GIFs, and WebGL/Canvas canvas.</span>
          </div>

          <button
            onClick={() => setWallpaperModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
