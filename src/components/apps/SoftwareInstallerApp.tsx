import React, { useState } from 'react';
import {
  DownloadCloud,
  CheckCircle2,
  RefreshCw,
  Box,
  Layers,
  HardDrive,
  Cpu,
  Monitor,
  Terminal,
  ShieldCheck,
  Smartphone,
  FolderArchive,
  Upload,
  Settings,
  Flame,
  Check,
  ChevronRight,
  Trash2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useOS } from '../../context/OSContext';

export interface SoftwarePackage {
  id: string;
  name: string;
  category: 'Android APK' | 'Windows VM' | 'Linux Container' | 'Forensic Tool' | 'AI Model';
  version: string;
  size: string;
  description: string;
  author: string;
  features: string[];
  isInstalled: boolean;
  installProgress?: number;
}

export const SoftwareInstallerApp: React.FC = () => {
  const { openWindow, addNotification, logActivity } = useOS();

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [installingId, setInstallingId] = useState<string | null>(null);

  const [packages, setPackages] = useState<SoftwarePackage[]>([
    {
      id: 'apk-vca-lab',
      name: 'VCA Mobile Inspection Lab (Android APK)',
      category: 'Android APK',
      version: 'v3.4.12',
      size: '48.6 MB',
      description: 'Mobile card recognition, centering measurement, holographic sparkle scanner, and NFC tag reader.',
      author: 'Verified Card Authority',
      features: ['200MP ISOCELL Macro Engine', 'WebNFC Hardware Bridge', 'Gemini Multimodal OCR'],
      isInstalled: true
    },
    {
      id: 'vm-win11-forensics',
      name: 'Windows 11 Pro Forensics Edition VM',
      category: 'Windows VM',
      version: '24H2-Build26100',
      size: '4.8 GB',
      description: 'Pre-configured virtual machine with Direct3D 12 acceleration, Photoshop TCG forensics plugins, and hex inspection tools.',
      author: 'Microsoft / VCA Core',
      features: ['DirectX 12 Ultimate', 'PowerShell 7 Forensics Scripts', 'USB Microscope 100x Driver'],
      isInstalled: true
    },
    {
      id: 'ct-ubuntu-vision',
      name: 'Ubuntu 24.04 LTS Computer Vision Container',
      category: 'Linux Container',
      version: 'v24.04.1',
      size: '1.9 GB',
      description: 'Full headless Linux container with PyTorch 2.4, CUDA 12.4, CollectorVision recognition daemon, and OpenCV 4.10.',
      author: 'Canonical / Open TCG Lab',
      features: ['CUDA 12.4 Acceleration', 'CollectorVision Python Daemon', 'TCGdex Offline Index'],
      isInstalled: false
    },
    {
      id: 'ct-kali-security',
      name: 'Kali Linux Card & RFID Security Lab',
      category: 'Linux Container',
      version: 'v2024.3',
      size: '2.4 GB',
      description: 'Security & cryptographic verification suite for tamper-evident NFC tags, RFID sniffing, and image forensic integrity.',
      author: 'Offensive Security',
      features: ['Proxmark3 RFID Tools', 'Autopsy Digital Forensics', 'GExiv2 EXIF Authenticator'],
      isInstalled: false
    },
    {
      id: 'apk-pokemon-scanner',
      name: 'Pokémon TCG Card Scanner Pro (APK)',
      category: 'Android APK',
      version: 'v2.8.4',
      size: '62.1 MB',
      description: 'Instant card identification, variant resolution (1st Edition, Shadowless, Holo), and market pricing.',
      author: 'TCG Community / VCA',
      features: ['Live Viewfinder OCR', 'PriceCharting Index', 'eBay Sales Aggregator'],
      isInstalled: true
    },
    {
      id: 'tool-tcgdex-sdk',
      name: 'TCGdex Node & Python SDK Core',
      category: 'Forensic Tool',
      version: 'v2.1.0',
      size: '14.2 MB',
      description: 'Complete offline Pokémon cards database with high-resolution image references and multilingual support.',
      author: 'TCGdex Open Source',
      features: ['20,000+ Verified Cards', 'English & Japanese Sets', 'Variant Matrix'],
      isInstalled: true
    },
    {
      id: 'model-gemini-vision-weights',
      name: 'VCA Optical Rosette ONNX Model Weights',
      category: 'AI Model',
      version: 'v4.0.2',
      size: '420 MB',
      description: 'Quantized INT8 deep learning model for microscopic halftone dot pattern and counterfeit texture analysis.',
      author: 'VCA ML Research',
      features: ['99.8% Rosette Accuracy', 'Micro-Print Sharpness', 'Edge Whitening Detector'],
      isInstalled: false
    }
  ]);

  const handleInstall = (pkg: SoftwarePackage) => {
    setInstallingId(pkg.id);
    logActivity('SOFTWARE_INSTALL_START', pkg.name);

    setTimeout(() => {
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, isInstalled: true } : p))
      );
      setInstallingId(null);
      addNotification({
        title: 'Software Installed Successfully',
        message: `${pkg.name} (${pkg.size}) is ready to use.`,
        type: 'success'
      });
      logActivity('SOFTWARE_INSTALL_COMPLETE', pkg.name);
    }, 1500);
  };

  const handleUninstall = (pkg: SoftwarePackage) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === pkg.id ? { ...p, isInstalled: false } : p))
    );
    addNotification({
      title: 'Software Uninstalled',
      message: `${pkg.name} has been removed.`,
      type: 'info'
    });
  };

  const filtered = packages.filter((p) => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (searchQuery.trim() && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Banner */}
      <div className="p-5 bg-gradient-to-r from-cyan-950/50 via-slate-900 to-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              <DownloadCloud className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">
                Software & Platform Installer Hub
              </h1>
              <p className="text-xs text-slate-400">
                1-Click installation for Windows 11 Forensics, Linux Ubuntu/Kali containers, Android APKs and computer vision suites.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openWindow('emulator')}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Smartphone className="w-4 h-4" />
              Open Device Emulator
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['all', 'Android APK', 'Windows VM', 'Linux Container', 'Forensic Tool', 'AI Model'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {cat === 'all' ? 'All Packages' : cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search software, APKs, or OS images..."
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-cyan-500 w-64"
          />
        </div>
      </div>

      {/* Package Grid */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((pkg) => (
            <div
              key={pkg.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-cyan-300">
                    {pkg.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{pkg.size}</span>
                </div>

                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {pkg.name}
                  {pkg.isInstalled && (
                    <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-normal">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Installed
                    </span>
                  )}
                </h3>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pkg.description}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pkg.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] bg-slate-950 border border-slate-800/80 text-slate-300 font-mono"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">Author: {pkg.author}</span>

                <div className="flex items-center gap-2">
                  {pkg.isInstalled ? (
                    <>
                      <button
                        onClick={() => openWindow('emulator')}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        Run in Emulator
                      </button>
                      <button
                        onClick={() => handleUninstall(pkg)}
                        className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                        title="Uninstall"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      disabled={installingId === pkg.id}
                      onClick={() => handleInstall(pkg)}
                      className="px-4 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition flex items-center gap-1.5"
                    >
                      {installingId === pkg.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Installing...
                        </>
                      ) : (
                        <>
                          <DownloadCloud className="w-3.5 h-3.5" />
                          1-Click Install
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
