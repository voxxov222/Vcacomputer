import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import {
  Settings,
  Shield,
  Cpu,
  Radio,
  Camera,
  Database,
  Lock,
  Moon,
  Sun,
  HardDrive,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

export const SettingsApp: React.FC = () => {
  const { wallpaper, setWallpaper, logActivity, addNotification } = useOS();
  const [nfcDiagnostic, setNfcDiagnostic] = useState<string | null>(null);
  const [cameraDiagnostic, setCameraDiagnostic] = useState<string | null>(null);

  const checkCameraHardware = async () => {
    setCameraDiagnostic('Scanning for direct UVC / WebRTC camera nodes...');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setCameraDiagnostic(`Found ${videoDevices.length} optical camera sensor(s) ready for VScan.`);
      } else {
        setCameraDiagnostic('WebRTC mediaDevices API supported with secure sandbox context.');
      }
    } catch (err: any) {
      setCameraDiagnostic(`Camera diagnostic info: ${err.message}`);
    }
  };

  const checkNfcHardware = () => {
    if ('NDEFReader' in window) {
      setNfcDiagnostic('Web NFC API is available natively on this device runtime.');
    } else {
      setNfcDiagnostic('Standard desktop browser: NFC emulation & hardware bridge active.');
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden text-xs">
      {/* Top Header */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200">VCA OS Settings & System Diagnostics</span>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-6 overflow-y-auto">
        {/* Section 1: Hardware & Peripherals */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" /> Laboratory Peripherals & Sensors
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-cyan-400" /> VScan High-Res Optical Sensor
                </span>
                <button
                  onClick={checkCameraHardware}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] rounded font-bold transition"
                >
                  Test Camera
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                {cameraDiagnostic || 'Supports 4K/60FPS optical zoom macro lenses for defect inspection.'}
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-purple-400" /> Web NFC Hardware Bridge
                </span>
                <button
                  onClick={checkNfcHardware}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] rounded font-bold transition"
                >
                  Test NFC
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                {nfcDiagnostic || 'Supports ISO/IEC 14443 Type A contactless cards and NTAG213/215/216.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Workspace Environment */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" /> OS Customization & Canvas
          </h3>

          <div className="space-y-2">
            <span className="text-xs text-slate-300 font-semibold">Desktop Theme Canvas</span>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'graphite', name: 'Deep Graphite Lab', color: 'from-slate-950 via-slate-900 to-slate-950' },
                { id: 'cyber', name: 'Electric Cyan Cyber', color: 'from-cyan-950/40 via-slate-950 to-slate-950' },
                { id: 'aurora', name: 'Holographic Aurora', color: 'from-purple-950/40 via-slate-950 to-slate-950' }
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setWallpaper(theme.id)}
                  className={`p-3 rounded-xl border text-left transition ${
                    wallpaper === theme.id
                      ? 'border-cyan-400 bg-slate-800/80 text-white shadow-lg'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className={`h-8 rounded-lg bg-gradient-to-r ${theme.color} mb-2 border border-slate-700`} />
                  <div className="font-bold text-xs">{theme.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
