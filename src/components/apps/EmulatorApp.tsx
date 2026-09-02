import React, { useState, useRef, useEffect } from 'react';
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Cpu,
  HardDrive,
  Sliders,
  DownloadCloud,
  Layers,
  RotateCw,
  Power,
  Volume2,
  Volume1,
  Wifi,
  Battery,
  ShieldCheck,
  Radio,
  Camera,
  CheckCircle2,
  Play,
  Pause,
  RefreshCw,
  Terminal,
  Settings,
  Folder,
  Globe,
  Upload,
  Zap,
  Eye,
  Microscope,
  Sparkles,
  Maximize2,
  ChevronRight,
  Plus,
  Trash2,
  Share2,
  FileCode,
  Box,
  Key,
  Flame,
  Gauge
} from 'lucide-react';
import { useOS } from '../../context/OSContext';

export type DeviceType = 'phone' | 'tablet' | 'laptop' | 'desktop';

export interface DevicePreset {
  id: string;
  name: string;
  brand: string;
  type: DeviceType;
  osName: string;
  osType: 'android' | 'windows' | 'linux' | 'ios' | 'macos';
  storage: string;
  ram: string;
  cpu: string;
  gpu: string;
  resolution: string;
  refreshRate: string;
  cameraSpecs: string;
  nfcSupported: boolean;
  imageThumbnail: string;
  bezelStyle: 'samsung-s26' | 'pixel-fold' | 'iphone-pro' | 'tab-s10' | 'ipad-m4' | 'surface-pro' | 'thinkpad' | 'macbook' | 'workstation';
}

export const DEVICE_PRESETS: DevicePreset[] = [
  {
    id: 'samsung-s26-ultra',
    name: 'Samsung Galaxy S26 Ultra',
    brand: 'Samsung',
    type: 'phone',
    osName: 'Android 16 • One UI 8.0',
    osType: 'android',
    storage: '512 GB UFS 4.1',
    ram: '16 GB LPDDR5X',
    cpu: 'Snapdragon 8 Gen 5 (3nm, 8-Core)',
    gpu: 'Adreno 850 Ray Tracing',
    resolution: '3120 × 1440 (Dynamic AMOLED 2X)',
    refreshRate: '144Hz LTPO Adaptive',
    cameraSpecs: '200 MP ISOCELL HP3 + 50 MP Periscope (100x Optical Macro)',
    nfcSupported: true,
    imageThumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&q=80',
    bezelStyle: 'samsung-s26'
  },
  {
    id: 'pixel-9-pro-fold',
    name: 'Google Pixel 9 Pro Fold',
    brand: 'Google',
    type: 'phone',
    osName: 'Android 16 (Pixel Experience)',
    osType: 'android',
    storage: '512 GB UFS 4.0',
    ram: '16 GB LPDDR5X',
    cpu: 'Google Tensor G4 AI Engine',
    gpu: 'Mali-G715 Immortalis',
    resolution: '2152 × 2076 (Dual Super Actua)',
    refreshRate: '120Hz LTPO',
    cameraSpecs: '48 MP Quad PD Macro + Ultra-wide',
    nfcSupported: true,
    imageThumbnail: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80',
    bezelStyle: 'pixel-fold'
  },
  {
    id: 'iphone-16-pro-max',
    name: 'iPhone 16 Pro Max',
    brand: 'Apple',
    type: 'phone',
    osName: 'iOS 19.4 Forensics Mode',
    osType: 'ios',
    storage: '512 GB NVMe',
    ram: '8 GB Unified Memory',
    cpu: 'Apple A18 Pro (3nm Gen 2)',
    gpu: '6-Core Apple GPU Metal 3',
    resolution: '2868 × 1320 (Super Retina XDR)',
    refreshRate: '120Hz ProMotion',
    cameraSpecs: '48 MP Fusion + 5x Tetraprism Macro',
    nfcSupported: true,
    imageThumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80',
    bezelStyle: 'iphone-pro'
  },
  {
    id: 'samsung-tab-s10-ultra',
    name: 'Galaxy Tab S10 Ultra 14.6"',
    brand: 'Samsung',
    type: 'tablet',
    osName: 'Android 16 • DeX Desktop Mode',
    osType: 'android',
    storage: '1 TB NVMe UFS 4.1',
    ram: '16 GB LPDDR5X',
    cpu: 'Dimensity 9300+ / Snapdragon 8G5',
    gpu: 'Immortalis-G720 MC12',
    resolution: '2960 × 1848 (14.6" Dynamic AMOLED 2X)',
    refreshRate: '120Hz HDR10+',
    cameraSpecs: 'Dual 13MP + 8MP Macro Inspection',
    nfcSupported: true,
    imageThumbnail: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80',
    bezelStyle: 'tab-s10'
  },
  {
    id: 'ipad-pro-m4',
    name: 'iPad Pro 13" M4 OLED',
    brand: 'Apple',
    type: 'tablet',
    osName: 'iPadOS 19 Forensics Lab',
    osType: 'ios',
    storage: '1 TB Ultra-Fast SSD',
    ram: '16 GB Unified Memory',
    cpu: 'Apple M4 (10-Core CPU + 16-Core NPU)',
    gpu: '10-Core GPU Hardware Ray Tracing',
    resolution: '2752 × 2064 (Tandem OLED Liquid Retina XDR)',
    refreshRate: '120Hz ProMotion 1600 nits',
    cameraSpecs: '12 MP LiDAR Scanner + Macro Optics',
    nfcSupported: true,
    imageThumbnail: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&q=80',
    bezelStyle: 'ipad-m4'
  },
  {
    id: 'surface-pro-11',
    name: 'Microsoft Surface Pro 11 Copilot+',
    brand: 'Microsoft',
    type: 'laptop',
    osName: 'Windows 11 Pro Forensics Edition',
    osType: 'windows',
    storage: '1 TB PCIe Gen 4 NVMe',
    ram: '32 GB LPDDR5X',
    cpu: 'Snapdragon X Elite (12-Core 3.8GHz + 45 TOPS NPU)',
    gpu: 'Adreno X1-85 Direct3D 12 Ultimate',
    resolution: '2880 × 1920 (13" PixelSense Flow OLED)',
    refreshRate: '120Hz Dynamic Refresh',
    cameraSpecs: 'Quad HD Studio Cam + Windows Hello IR',
    nfcSupported: true,
    imageThumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80',
    bezelStyle: 'surface-pro'
  },
  {
    id: 'thinkpad-x1-extreme',
    name: 'Lenovo ThinkPad X1 Carbon Gen 12',
    brand: 'Lenovo',
    type: 'laptop',
    osName: 'Ubuntu 24.04 LTS / Kali Linux Forensics',
    osType: 'linux',
    storage: '2 TB PCIe 5.0 SSD',
    ram: '64 GB LPDDR5X-7500',
    cpu: 'Intel Core Ultra 9 185H (16-Core 5.1GHz)',
    gpu: 'Intel Arc Graphics + Dual NPU',
    resolution: '2880 × 1800 (14" 2.8K OLED 120Hz)',
    refreshRate: '120Hz 100% DCI-P3',
    cameraSpecs: 'FHD RGB+IR MIPI Computer Vision Sensor',
    nfcSupported: true,
    imageThumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80',
    bezelStyle: 'thinkpad'
  },
  {
    id: 'vca-forensic-workstation',
    name: 'VCA Dual-Xeon Forensic Lab Rig',
    brand: 'VCA Systems',
    type: 'desktop',
    osName: 'VCA Custom Linux Forensics Core 6.10',
    osType: 'linux',
    storage: '4 TB Enterprise NVMe RAID 0',
    ram: '128 GB ECC DDR5 Quad-Channel',
    cpu: 'Dual Intel Xeon Platinum 8480+ (112 Cores)',
    gpu: 'Dual NVIDIA RTX 6000 Ada Generation (96 GB VRAM)',
    resolution: '3840 × 2160 × 3 Triple 4K HDR',
    refreshRate: '144Hz G-Sync Ultimate',
    cameraSpecs: '4K USB 3.2 100x Optical Micro-Rosette Inspection Sensor',
    nfcSupported: true,
    imageThumbnail: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400&q=80',
    bezelStyle: 'workstation'
  }
];

export interface InstalledApk {
  id: string;
  name: string;
  version: string;
  size: string;
  packageId: string;
  icon: string;
  installedAt: string;
  status: 'ready' | 'running' | 'updated';
}

export const EmulatorApp: React.FC = () => {
  const { openWindow, addNotification, logActivity } = useOS();

  // Active Device Selection
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEVICE_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<'screen' | 'customize' | 'peripherals' | 'software' | 'diagnostics'>('screen');
  const [deviceOrientation, setDeviceOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isPoweredOn, setIsPoweredOn] = useState<boolean>(true);
  const [batteryLevel, setBatteryLevel] = useState<number>(94);
  const [isCharging, setIsCharging] = useState<boolean>(true);

  // Active Android Screen State
  const [activeAndroidApp, setActiveAndroidApp] = useState<'home' | 'scanner' | 'nfc' | 'camera' | 'settings' | 'terminal' | 'files'>('home');
  const [nfcSimulatedState, setNfcSimulatedState] = useState<'idle' | 'scanning' | 'detected' | 'verified'>('idle');
  const [nfcTagUid, setNfcTagUid] = useState<string>('1D:93:48:A9:1C:10:80');
  const [cameraZoomLevel, setCameraZoomLevel] = useState<number>(1);
  const [cameraLightMode, setCameraLightMode] = useState<'normal' | 'uv365' | 'ir850' | 'rosette'>('normal');

  // Customization Configuration
  const [customMemory, setCustomMemory] = useState<number>(16);
  const [customStorage, setCustomStorage] = useState<number>(512);
  const [customCpuCores, setCustomCpuCores] = useState<number>(8);
  const [customRefreshRate, setCustomRefreshRate] = useState<number>(144);
  const [customGpuBackend, setCustomGpuBackend] = useState<string>('Vulkan 1.3 High-Performance');
  const [customGpsLat, setCustomGpsLat] = useState<string>('37.7749');
  const [customGpsLng, setCustomGpsLng] = useState<string>('-122.4194');
  const [customNetworkLatency, setCustomNetworkLatency] = useState<number>(4);
  const [isRootEnabled, setIsRootEnabled] = useState<boolean>(true);
  const [isAdbEnabled, setIsAdbEnabled] = useState<boolean>(true);
  const [isUsbMicroscopeConnected, setIsUsbMicroscopeConnected] = useState<boolean>(true);

  // Installed APKs list
  const [installedApks, setInstalledApks] = useState<InstalledApk[]>([
    {
      id: 'apk-1',
      name: 'VCA Mobile Inspection Lab',
      version: 'v3.4.12-release',
      size: '48.6 MB',
      packageId: 'com.vca.inspection.lab',
      icon: 'ShieldCheck',
      installedAt: 'Today, 14:10',
      status: 'ready'
    },
    {
      id: 'apk-2',
      name: 'Pokémon TCG Card Scanner Pro',
      version: 'v2.8.4',
      size: '62.1 MB',
      packageId: 'com.tcg.cardscanner.ai',
      icon: 'Camera',
      installedAt: 'Today, 13:45',
      status: 'ready'
    },
    {
      id: 'apk-3',
      name: 'CollectorVision Mobile Engine',
      version: 'v1.9.0-cuda',
      size: '88.4 MB',
      packageId: 'org.hanclinto.collectorvision.mobile',
      icon: 'Eye',
      installedAt: 'Yesterday',
      status: 'ready'
    },
    {
      id: 'apk-4',
      name: 'NFC Tools Pro Enterprise',
      version: 'v8.2.1',
      size: '18.2 MB',
      packageId: 'com.wakdev.nfctools.pro',
      icon: 'Radio',
      installedAt: 'Today, 10:20',
      status: 'ready'
    }
  ]);

  // Terminal logs inside emulator
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'vca-s26-ultra:/ $ su',
    'Root shell granted (UID 0). Android 16 (API 36) runtime active.',
    'vca-s26-ultra:/ # getprop ro.product.model',
    'SM-S938B (Samsung Galaxy S26 Ultra 512GB)',
    'vca-s26-ultra:/ # vca-nfc-daemon --status',
    '[NFC] PN553 Controller active. ISO/IEC 14443-A & NFC Forum Type 4 ready.',
    '[VCA-CV] Optical Rosette Sensor 100x calibration: OK (SNR 48.2 dB).'
  ]);
  const [terminalInput, setTerminalInput] = useState<string>('');

  const [installingPackage, setInstallingPackage] = useState<string | null>(null);

  // Trigger NFC Tap simulation
  const handleSimulateNfcTap = () => {
    setNfcSimulatedState('scanning');
    setTimeout(() => {
      setNfcSimulatedState('detected');
      addNotification({
        title: 'NFC Tag Detected (S26 Ultra)',
        message: `UID: ${nfcTagUid} resolved to VCA-2026-0001 (Reshiram & Charizard GX Secret Rare).`,
        type: 'success'
      });
      logActivity('NFC_EMULATOR_TAP', `UID: ${nfcTagUid}`);
      setTimeout(() => {
        setNfcSimulatedState('verified');
      }, 800);
    }, 600);
  };

  const handleInstallApk = (pkgName: string, pkgId: string, size: string) => {
    setInstallingPackage(pkgName);
    setTimeout(() => {
      const newApk: InstalledApk = {
        id: `apk-${Date.now()}`,
        name: pkgName,
        version: 'v1.0.0-verified',
        size,
        packageId: pkgId,
        icon: 'Box',
        installedAt: 'Just now',
        status: 'ready'
      };
      setInstalledApks((prev) => [newApk, ...prev]);
      setInstallingPackage(null);
      addNotification({
        title: 'APK Installed Successfully',
        message: `${pkgName} (${size}) was installed into ${selectedDevice.name}.`,
        type: 'success'
      });
      logActivity('APK_SIDELOAD', `${pkgName} on ${selectedDevice.name}`);
    }, 1200);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.trim();
    const newLogs = [...terminalLogs, `vca-s26-ultra:/ # ${cmd}`];
    if (cmd === 'clear') {
      setTerminalLogs([]);
      setTerminalInput('');
      return;
    } else if (cmd === 'uname -a' || cmd === 'uname') {
      newLogs.push('Linux localhost 6.10.4-vca-android16-arm64 #1 SMP PREEMPT aarch64 GNU/Linux');
    } else if (cmd.startsWith('pm list packages')) {
      newLogs.push('package:com.vca.inspection.lab');
      newLogs.push('package:com.tcg.cardscanner.ai');
      newLogs.push('package:org.hanclinto.collectorvision.mobile');
      newLogs.push('package:com.wakdev.nfctools.pro');
    } else if (cmd.startsWith('ping')) {
      newLogs.push(`64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=${customNetworkLatency} ms`);
    } else if (cmd === 'df -h') {
      newLogs.push(`/dev/block/dm-0      ${customStorage}G   48G  ${customStorage - 48}G  10% /data`);
      newLogs.push(`tmpfs                 ${customMemory}G  1.2G   ${customMemory - 1.2}G   8% /dev`);
    } else {
      newLogs.push(`Executing: ${cmd}... [Exit code: 0 (OK)]`);
    }
    setTerminalLogs(newLogs);
    setTerminalInput('');
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Header & Device Selector */}
      <div className="h-14 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">{selectedDevice.name}</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {customMemory} GB RAM • {customStorage} GB SSD
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isPoweredOn ? 'RUNNING (VULKAN 144Hz)' : 'POWERED OFF'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{selectedDevice.osName} • {selectedDevice.cpu}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('screen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'screen'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Live Device Screen
          </button>
          <button
            onClick={() => setActiveTab('customize')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'customize'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Specs & Models
          </button>
          <button
            onClick={() => setActiveTab('peripherals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'peripherals'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            NFC & Microscope
          </button>
          <button
            onClick={() => setActiveTab('software')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'software'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            APK & OS Sideload
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'diagnostics'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            ADB Shell
          </button>
        </div>

        {/* Quick Power & Rotation controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeviceOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'))}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title="Rotate Device Orientation"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPoweredOn(!isPoweredOn)}
            className={`p-2 rounded-lg transition ${
              isPoweredOn
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-rose-500/20 hover:text-rose-400'
                : 'bg-rose-500/20 text-rose-400 hover:bg-emerald-500/20 hover:text-emerald-400'
            }`}
            title={isPoweredOn ? 'Power Off Device' : 'Power On Device'}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 overflow-hidden relative bg-gradient-to-b from-slate-950 via-[#0a0f1d] to-slate-950 p-4">
        {/* TAB 1: LIVE INTERACTIVE DEVICE SCREEN */}
        {activeTab === 'screen' && (
          <div className="w-full h-full flex items-center justify-center relative">
            {/* Realistic Device Frame */}
            <div
              className={`transition-all duration-300 relative shadow-[0_25px_70px_rgba(0,0,0,0.85)] border-4 rounded-[40px] flex flex-col overflow-hidden ${
                selectedDevice.bezelStyle === 'samsung-s26'
                  ? 'border-slate-700 bg-slate-900 ring-2 ring-cyan-500/30'
                  : selectedDevice.bezelStyle === 'iphone-pro'
                  ? 'border-neutral-700 bg-neutral-900 ring-2 ring-neutral-500/30'
                  : 'border-slate-800 bg-slate-900 ring-2 ring-slate-700'
              } ${
                deviceOrientation === 'portrait'
                  ? selectedDevice.type === 'phone'
                    ? 'w-[360px] h-[660px]'
                    : selectedDevice.type === 'tablet'
                    ? 'w-[560px] h-[660px]'
                    : 'w-[780px] h-[540px]'
                  : selectedDevice.type === 'phone'
                  ? 'w-[660px] h-[360px]'
                  : 'w-[780px] h-[520px]'
              }`}
            >
              {/* Metallic Camera Punch-hole / Dynamic Island */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
                {selectedDevice.bezelStyle === 'iphone-pro' ? (
                  <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2 text-[9px] text-white">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    <span className="text-[8px] text-slate-400 font-mono">VCA AI</span>
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full bg-black border border-slate-800 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-900/80" />
                  </div>
                )}
              </div>

              {/* Top Android Status Bar */}
              <div className="h-7 bg-slate-950/80 backdrop-blur text-slate-300 text-[10px] px-5 flex items-center justify-between z-20 shrink-0 select-none">
                <span className="font-semibold font-mono">14:38</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-cyan-400 font-bold tracking-wider">5G+ UW</span>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <div className="flex items-center gap-1 font-mono text-[9px]">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{batteryLevel}%</span>
                  </div>
                </div>
              </div>

              {/* Active Device Display Content */}
              <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
                {!isPoweredOn ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black text-slate-600 gap-3">
                    <Power className="w-10 h-10 text-slate-700" />
                    <p className="text-xs">Device is powered off</p>
                    <button
                      onClick={() => setIsPoweredOn(true)}
                      className="px-4 py-2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500 hover:text-slate-950 transition"
                    >
                      Power On {selectedDevice.name}
                    </button>
                  </div>
                ) : activeAndroidApp === 'home' ? (
                  /* Android / Device Home Screen */
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    {/* Top Widgets (Clock, Weather, VCA Status) */}
                    <div>
                      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl backdrop-blur-md mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            VCA OS Runtime
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">v4.2-Pro</span>
                        </div>
                        <div className="text-xl font-black text-white tracking-tight">14:38</div>
                        <div className="text-[11px] text-slate-300 flex items-center justify-between mt-1">
                          <span>San Francisco, CA • 68°F</span>
                          <span className="text-emerald-400 font-mono font-bold">NFC READY</span>
                        </div>
                      </div>

                      {/* App Grid */}
                      <div className="grid grid-cols-4 gap-3 text-center">
                        <button
                          onClick={() => setActiveAndroidApp('scanner')}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-800/60 transition group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-200 truncate w-full">VCA Scan</span>
                        </button>

                        <button
                          onClick={() => setActiveAndroidApp('nfc')}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-800/60 transition group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
                            <Radio className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-200 truncate w-full">NFC Slab</span>
                        </button>

                        <button
                          onClick={() => setActiveAndroidApp('camera')}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-800/60 transition group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                            <Microscope className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-200 truncate w-full">Macro 100x</span>
                        </button>

                        <button
                          onClick={() => setActiveAndroidApp('terminal')}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-800/60 transition group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/50 group-hover:scale-105 transition-transform border border-slate-700">
                            <Terminal className="w-6 h-6 text-cyan-400" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-200 truncate w-full">Termux</span>
                        </button>

                        <button
                          onClick={() => setActiveAndroidApp('settings')}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-800/60 transition group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-105 transition-transform">
                            <Settings className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-200 truncate w-full">Settings</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('software')}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-800/60 transition group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-105 transition-transform">
                            <DownloadCloud className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-200 truncate w-full">Get APKs</span>
                        </button>

                        <button
                          onClick={() => openWindow('vca')}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-800/60 transition group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                            <ShieldCheck className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-200 truncate w-full">VCA Host</span>
                        </button>

                        <button
                          onClick={() => openWindow('files')}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-800/60 transition group cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:scale-105 transition-transform">
                            <Folder className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-200 truncate w-full">Files</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Android Dock */}
                    <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl flex items-center justify-around shadow-2xl backdrop-blur-md">
                      <button
                        onClick={() => setActiveAndroidApp('scanner')}
                        className="p-2 rounded-xl hover:bg-slate-800 text-cyan-400"
                        title="VCA Scanner"
                      >
                        <Camera className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setActiveAndroidApp('nfc')}
                        className="p-2 rounded-xl hover:bg-slate-800 text-purple-400"
                        title="NFC Reader"
                      >
                        <Radio className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setActiveAndroidApp('camera')}
                        className="p-2 rounded-xl hover:bg-slate-800 text-emerald-400"
                        title="Macro Microscope"
                      >
                        <Microscope className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setActiveAndroidApp('settings')}
                        className="p-2 rounded-xl hover:bg-slate-800 text-amber-400"
                        title="Settings"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : activeAndroidApp === 'scanner' ? (
                  /* VCA Mobile Scanner Inside Device */
                  <div className="flex-1 flex flex-col justify-between bg-slate-950 p-3 relative">
                    <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-cyan-400" />
                        <span>VCA Mobile AI Card Scanner</span>
                      </div>
                      <button
                        onClick={() => setActiveAndroidApp('home')}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                      >
                        Exit
                      </button>
                    </div>

                    {/* Viewfinder simulation */}
                    <div className="my-auto relative aspect-[3/4] max-h-[300px] mx-auto w-full max-w-[230px] rounded-xl border-2 border-cyan-500/80 bg-slate-900 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
                      <img
                        src="https://images.pokemontcg.io/sm10/217_hires.png"
                        alt="Test Card Viewfinder"
                        className="w-full h-full object-contain p-2"
                      />
                      {/* Laser alignment line */}
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-cyan-400 shadow-[0_0_8px_#06b6d4] animate-pulse" />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[8px] font-mono text-cyan-300">
                        ALIGNMENT: 99.4%
                      </div>
                      <div className="absolute bottom-2 inset-x-2 px-2 py-1 rounded bg-black/80 text-[9px] font-mono text-emerald-400 text-center">
                        IDENTIFIED: Reshiram & Charizard GX (217/214)
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => {
                          addNotification({
                            title: 'Card Captured (Mobile S26)',
                            message: 'Reshiram & Charizard GX Secret Rare sent to VCA Inspection Lab.',
                            type: 'success'
                          });
                          openWindow('vca');
                        }}
                        className="flex-1 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/30"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Capture & Grade
                      </button>
                      <button
                        onClick={() => setActiveAndroidApp('home')}
                        className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : activeAndroidApp === 'nfc' ? (
                  /* NFC Tag Tool Inside Device */
                  <div className="flex-1 flex flex-col justify-between bg-slate-950 p-3">
                    <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-purple-400" />
                        <span>NFC Slab Hardware Tool</span>
                      </div>
                      <button
                        onClick={() => setActiveAndroidApp('home')}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                      >
                        Exit
                      </button>
                    </div>

                    <div className="my-auto flex flex-col items-center text-center gap-3">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all ${
                          nfcSimulatedState === 'verified'
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                            : nfcSimulatedState === 'scanning'
                            ? 'bg-purple-500/20 border-purple-400 text-purple-300 animate-pulse'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        <Radio className="w-8 h-8" />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {nfcSimulatedState === 'verified'
                            ? 'VCA Slab Authenticated'
                            : nfcSimulatedState === 'scanning'
                            ? 'Scanning RF Field...'
                            : 'Ready to Read NFC Tag'}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {nfcSimulatedState === 'verified'
                            ? `Cert #VCA-2026-0001 (UID: ${nfcTagUid})`
                            : 'Hold physical card or click Simulate Tap below.'}
                        </p>
                      </div>

                      <button
                        onClick={handleSimulateNfcTap}
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/30 transition flex items-center gap-2"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        Simulate Physical NFC Tap
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-400 bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-center font-mono">
                      NFC Controller: NXP PN553 (ISO/IEC 14443 Type A)
                    </div>
                  </div>
                ) : activeAndroidApp === 'camera' ? (
                  /* Optical 100x Macro Microscope Camera */
                  <div className="flex-1 flex flex-col justify-between bg-slate-950 p-3">
                    <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Microscope className="w-4 h-4 text-emerald-400" />
                        <span>200MP Rosette Inspection</span>
                      </div>
                      <button
                        onClick={() => setActiveAndroidApp('home')}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                      >
                        Exit
                      </button>
                    </div>

                    {/* Rosette preview canvas */}
                    <div className="my-auto relative w-full h-[220px] rounded-xl overflow-hidden border border-slate-700 bg-black flex items-center justify-center">
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          transform: `scale(${cameraZoomLevel})`,
                          filter:
                            cameraLightMode === 'uv365'
                              ? 'hue-rotate(240deg) saturate(3)'
                              : cameraLightMode === 'ir850'
                              ? 'grayscale(1) contrast(2)'
                              : 'none'
                        }}
                      >
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundImage: `radial-gradient(#06b6d4 1.5px, transparent 1.5px), radial-gradient(#ef4444 1.5px, #000 1.5px)`,
                            backgroundSize: '12px 12px',
                            backgroundPosition: '0 0, 6px 6px'
                          }}
                        />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400">
                        ZOOM: {cameraZoomLevel}x • ROSETTE CLARITY: 99.8%
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        {[1, 5, 10, 30, 100].map((z) => (
                          <button
                            key={z}
                            onClick={() => setCameraZoomLevel(z)}
                            className={`flex-1 py-1 rounded font-mono font-bold border transition ${
                              cameraZoomLevel === z
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                            }`}
                          >
                            {z}x
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between gap-1 text-[10px]">
                        {(['normal', 'uv365', 'ir850', 'rosette'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setCameraLightMode(mode)}
                            className={`flex-1 py-1 rounded uppercase font-bold border transition ${
                              cameraLightMode === mode
                                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Terminal / Settings inside device */
                  <div className="flex-1 flex flex-col justify-between bg-slate-950 p-2 font-mono text-[10px]">
                    <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-1 font-sans">
                      <span>Termux / ADB Shell</span>
                      <button
                        onClick={() => setActiveAndroidApp('home')}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                      >
                        Exit
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto my-2 space-y-1 text-slate-300">
                      {terminalLogs.map((log, i) => (
                        <div key={i} className={log.startsWith('vca') ? 'text-cyan-400 font-bold' : 'text-slate-300'}>
                          {log}
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleTerminalSubmit} className="flex items-center gap-1 border-t border-slate-800 pt-1">
                      <span className="text-cyan-400 font-bold">#</span>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        placeholder="Type shell command (e.g. df -h, pm list)..."
                        className="flex-1 bg-transparent text-slate-100 text-[10px] outline-none font-mono"
                      />
                    </form>
                  </div>
                )}

                {/* Bottom Android Navigation Bar */}
                <div className="h-6 bg-slate-950 text-slate-500 flex items-center justify-around shrink-0 border-t border-slate-900">
                  <button
                    onClick={() => setActiveAndroidApp('home')}
                    className="p-1 hover:text-slate-300 transition"
                    title="Recent Apps"
                  >
                    <div className="w-3.5 h-3.5 border border-current rounded-sm" />
                  </button>
                  <button
                    onClick={() => setActiveAndroidApp('home')}
                    className="p-1 hover:text-slate-300 transition"
                    title="Home Screen"
                  >
                    <div className="w-3 h-3 rounded-full border border-current" />
                  </button>
                  <button
                    onClick={() => setActiveAndroidApp('home')}
                    className="p-1 hover:text-slate-300 transition text-[11px]"
                    title="Back"
                  >
                    ◀
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SPECS, PRESETS & DEVICE MODELS */}
        {activeTab === 'customize' && (
          <div className="w-full h-full overflow-y-auto pr-2 space-y-6">
            {/* Choose Preset Device Models */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  Select Device Model & Form Factor
                </h2>
                <span className="text-xs text-slate-400">8 High-Fidelity Certified Hardware Profiles</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {DEVICE_PRESETS.map((preset) => {
                  const isSelected = selectedDevice.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedDevice(preset)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                            {preset.brand}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">{preset.ram}</span>
                        </div>
                        <h3 className="text-xs font-bold text-white leading-tight">{preset.name}</h3>
                        <p className="text-[11px] text-slate-400 mt-1">{preset.osName}</p>

                        <div className="mt-3 space-y-1 text-[10px] text-slate-300 font-mono">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Storage:</span>
                            <span>{preset.storage}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Display:</span>
                            <span className="truncate max-w-[130px]">{preset.refreshRate}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        className={`mt-3 w-full py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                        {isSelected ? 'Active Model' : 'Load Model'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Deep Custom Specs Configurator */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Advanced Hardware & Hypervisor Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* RAM Configuration */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 flex justify-between">
                    <span>Virtual Memory (RAM)</span>
                    <span className="text-cyan-400 font-mono font-bold">{customMemory} GB</span>
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="64"
                    step="4"
                    value={customMemory}
                    onChange={(e) => setCustomMemory(Number(e.target.value))}
                    className="w-full mt-2 accent-cyan-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                    <span>4 GB</span>
                    <span>16 GB (S26)</span>
                    <span>64 GB</span>
                  </div>
                </div>

                {/* Storage Configuration */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 flex justify-between">
                    <span>NVMe Internal Storage</span>
                    <span className="text-cyan-400 font-mono font-bold">{customStorage} GB</span>
                  </label>
                  <input
                    type="range"
                    min="128"
                    max="2048"
                    step="128"
                    value={customStorage}
                    onChange={(e) => setCustomStorage(Number(e.target.value))}
                    className="w-full mt-2 accent-cyan-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                    <span>128 GB</span>
                    <span>512 GB</span>
                    <span>2 TB</span>
                  </div>
                </div>

                {/* CPU Virtual Cores */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 flex justify-between">
                    <span>CPU Virtual Cores</span>
                    <span className="text-cyan-400 font-mono font-bold">{customCpuCores} Cores</span>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="32"
                    step="2"
                    value={customCpuCores}
                    onChange={(e) => setCustomCpuCores(Number(e.target.value))}
                    className="w-full mt-2 accent-cyan-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                    <span>2 Cores</span>
                    <span>8 Cores</span>
                    <span>32 Cores</span>
                  </div>
                </div>
              </div>

              {/* Graphics Backend & Network */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300">GPU Graphics Acceleration Backend</label>
                  <select
                    value={customGpuBackend}
                    onChange={(e) => setCustomGpuBackend(e.target.value)}
                    className="w-full mt-1.5 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-cyan-500"
                  >
                    <option value="Vulkan 1.3 High-Performance">Vulkan 1.3 High-Performance (Native Host Pass-through)</option>
                    <option value="DirectX 12 Ultimate (D3D12)">DirectX 12 Ultimate (D3D12 Hardware Acceleration)</option>
                    <option value="WebGPU Hardware Composite">WebGPU Next-Gen Hardware Composite</option>
                    <option value="OpenGL ES 3.2 ANGLE">OpenGL ES 3.2 ANGLE Compatibility Layer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Refresh Rate (LTPO Mode)</label>
                  <div className="grid grid-cols-4 gap-2 mt-1.5">
                    {[60, 90, 120, 144].map((hz) => (
                      <button
                        key={hz}
                        onClick={() => setCustomRefreshRate(hz)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition ${
                          customRefreshRate === hz
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {hz} Hz
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PERIPHERALS & SENSORS */}
        {activeTab === 'peripherals' && (
          <div className="w-full h-full overflow-y-auto space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NFC Sensor Configuration */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-purple-400" />
                    NFC Hardware Reader & Tag Simulator
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                    ISO/IEC 14443-A
                  </span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400">Target NFC Tag UID (Hex):</label>
                  <input
                    type="text"
                    value={nfcTagUid}
                    onChange={(e) => setNfcTagUid(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-purple-300 outline-none focus:border-purple-500"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Certificate Ref:</span>
                    <span className="text-white font-mono">VCA-2026-0001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Card:</span>
                    <span className="text-cyan-400">Reshiram & Charizard GX (217/214)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tamper Status:</span>
                    <span className="text-emerald-400">Pristine Sonic Weld</span>
                  </div>
                </div>

                <button
                  onClick={handleSimulateNfcTap}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/30 transition flex items-center justify-center gap-2"
                >
                  <Radio className="w-4 h-4" />
                  Simulate Physical NFC Tag Tap
                </button>
              </div>

              {/* Optical Microscope USB Passthrough */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <Microscope className="w-4 h-4 text-emerald-400" />
                    USB Optical Microscope 100x
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                    PASSTHROUGH ON
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Transfers live 4K macro video stream directly into the Android / Windows emulator for micro-print rosette inspection.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Sensor:</span>
                    <span className="font-semibold text-white">Sony IMX678 4K Starvis</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Illumination:</span>
                    <span className="font-semibold text-cyan-300">UV 365nm + IR 850nm</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('screen');
                    setActiveAndroidApp('camera');
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 transition flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Launch Rosette Inspection View
                </button>
              </div>
            </div>

            {/* GPS & Network Simulation */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                GPS Location & Network Sniffer Spoofing
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400">Spoofed Latitude:</label>
                  <input
                    type="text"
                    value={customGpsLat}
                    onChange={(e) => setCustomGpsLat(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Spoofed Longitude:</label>
                  <input
                    type="text"
                    value={customGpsLng}
                    onChange={(e) => setCustomGpsLng(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Simulated 5G Latency:</label>
                  <input
                    type="number"
                    value={customNetworkLatency}
                    onChange={(e) => setCustomNetworkLatency(Number(e.target.value))}
                    className="w-full mt-1 p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOFTWARE INSTALLER & APK SIDELOADING */}
        {activeTab === 'software' && (
          <div className="w-full h-full overflow-y-auto space-y-5">
            {/* Sideload APK Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-900 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <DownloadCloud className="w-4 h-4 text-cyan-400" />
                  Sideload Custom APK / Package
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Drag and drop any Android `.apk`, Windows `.exe`, or Linux `.deb` container directly to install.
                </p>
              </div>

              <button
                onClick={() => handleInstallApk('Custom Lab Analyzer APK', 'com.custom.analyzer', '34.2 MB')}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition flex items-center gap-1.5 shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload APK File
              </button>
            </div>

            {/* 1-Click Production Installers */}
            <div>
              <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                <Box className="w-4 h-4 text-cyan-400" />
                VCA Verified Software Library
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    name: 'VCA Mobile Inspection Lab v3.4',
                    desc: 'Full card scanner, variant detection, centering engine, and NFC verification on Android.',
                    pkg: 'com.vca.inspection.lab',
                    size: '48.6 MB',
                    type: 'Android APK'
                  },
                  {
                    name: 'Windows 11 Forensics VM Environment',
                    desc: 'Direct3D 12 acceleration with Photoshop TCG forensics plugins and OpenCV Python 3.12.',
                    pkg: 'win11.forensics.vm',
                    size: '4.2 GB',
                    type: 'Windows ISO / VM'
                  },
                  {
                    name: 'Ubuntu 24.04 LTS Computer Vision Container',
                    desc: 'PyTorch CUDA 12.4, CollectorVision recognition daemon, and TCGdex offline index.',
                    pkg: 'org.vca.ubuntu.vision',
                    size: '1.8 GB',
                    type: 'Linux Container'
                  },
                  {
                    name: 'Kali Linux Card Forensics Toolkit',
                    desc: 'Hex analysis, image EXIF deep inspection, and hardware RFID/NFC tag security tools.',
                    pkg: 'org.kali.forensics.tcg',
                    size: '2.1 GB',
                    type: 'Linux Security'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-cyan-300">
                          {item.type}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{item.size}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{item.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>

                    <button
                      disabled={installingPackage === item.name}
                      onClick={() => handleInstallApk(item.name, item.pkg, item.size)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 text-xs font-bold transition shrink-0 flex items-center gap-1.5"
                    >
                      {installingPackage === item.name ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                          Installing...
                        </>
                      ) : (
                        <>
                          <DownloadCloud className="w-3.5 h-3.5" />
                          Install
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Currently Installed Packages */}
            <div>
              <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Installed on {selectedDevice.name} ({installedApks.length} Packages)
              </h3>

              <div className="divide-y divide-slate-800 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                {installedApks.map((apk) => (
                  <div key={apk.id} className="p-3 flex items-center justify-between hover:bg-slate-800/50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                        <Box className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{apk.name}</h4>
                          <span className="text-[9px] font-mono text-slate-400">{apk.version}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">{apk.packageId} • {apk.size}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveTab('screen');
                          setActiveAndroidApp('scanner');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold transition"
                      >
                        Launch
                      </button>
                      <button
                        onClick={() => setInstalledApks((prev) => prev.filter((a) => a.id !== apk.id))}
                        className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ADB SHELL & DIAGNOSTICS */}
        {activeTab === 'diagnostics' && (
          <div className="w-full h-full flex flex-col justify-between rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 font-sans">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white">Interactive ADB Root Shell & System Telemetry</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono">ADB SERVER: localhost:5555 (CONNECTED)</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 text-slate-300 pr-2">
              {terminalLogs.map((log, i) => (
                <div key={i} className={log.startsWith('vca') ? 'text-cyan-400 font-bold' : 'text-slate-300'}>
                  {log}
                </div>
              ))}
            </div>

            <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 border-t border-slate-800 pt-2 mt-2">
              <span className="text-cyan-400 font-bold">#</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Enter ADB command (e.g. logcat, getprop, dumpsys battery, pm list packages)..."
                className="flex-1 bg-transparent text-slate-100 text-xs outline-none font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-cyan-500 text-slate-950 rounded-lg font-bold text-xs hover:bg-cyan-400"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
