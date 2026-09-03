import React, { useState, useEffect, useRef } from 'react';
import { Radio, CheckCircle, ShieldCheck, Lock, Unlock, Smartphone, HardDrive, AlertTriangle, Key, Trash2, Copy, FileText, Layers, Sparkles } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, PresentationControls, Environment, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

// --- 3D Slab Component ---
const VCASlab3D = ({ 
  card, 
  serialNumber, 
  gradeLabel, 
  isVerified 
}: { 
  card: any; 
  serialNumber: string; 
  gradeLabel: string;
  isVerified: boolean;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <PresentationControls global polar={[-0.2, 0.2]} azimuth={[-Math.PI / 4, Math.PI / 4]}>
          {/* Main Slab Body (Clear Acrylic) */}
          <RoundedBox args={[3.2, 5, 0.3]} radius={0.1} smoothness={4}>
            <meshPhysicalMaterial 
              transmission={0.9} 
              opacity={1} 
              roughness={0.1} 
              metalness={0.1}
              ior={1.5}
              thickness={0.5}
              clearcoat={1}
              color="#e0f2fe"
            />
          </RoundedBox>

          {/* VCA Label Area */}
          <mesh position={[0, 1.9, 0.05]}>
            <planeGeometry args={[2.8, 0.8]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 1.9, 0.16]}>
            <planeGeometry args={[2.7, 0.7]} />
            <meshStandardMaterial color={isVerified ? "#064e3b" : "#334155"} />
          </mesh>

          {/* Label Content */}
          <Text position={[-1.2, 2.05, 0.17]} fontSize={0.15} color="#38bdf8" anchorX="left" font="https://fonts.gstatic.com/s/firasans/v11/va9E4kDNxMZdWfMOD5Vvl4jO.ttf">
            VCA {isVerified ? 'VERIFIED' : 'UNVERIFIED'}
          </Text>
          <Text position={[-1.2, 1.85, 0.17]} fontSize={0.12} color="white" anchorX="left" maxWidth={2}>
            {card?.name || 'Unknown Specimen'}
          </Text>
          <Text position={[-1.2, 1.65, 0.17]} fontSize={0.1} color="#94a3b8" anchorX="left">
            {serialNumber}
          </Text>

          {/* Grade */}
          <Text position={[1.1, 1.9, 0.17]} fontSize={0.3} color={isVerified ? "#34d399" : "white"} anchorX="right" font="https://fonts.gstatic.com/s/firasans/v11/va9E4kDNxMZdWfMOD5Vvl4jO.ttf" fontWeight="bold">
            {gradeLabel?.split(' ')?.[1] || '10'}
          </Text>

          {/* Hologram / NFC Chip representation */}
          <mesh position={[0, -2, 0.1]}>
            <circleGeometry args={[0.2, 32]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Card Image Area (Mockup) */}
          <mesh position={[0, -0.2, 0]}>
            <planeGeometry args={[2.4, 3.4]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          
          <Text position={[0, -0.2, 0.02]} fontSize={0.2} color="#475569">
            CARD VISUAL
          </Text>
        </PresentationControls>
      </Float>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </group>
  );
};


export const NfcSlabManager = ({ selectedCard, onUpdateCard }: { selectedCard: any, onUpdateCard: (updated: any) => void }) => {
  const [activeSubTab, setActiveSubTab] = useState<'READ' | 'WRITE' | 'OTHER' | 'TASKS'>('WRITE');
  const [nfcStatus, setNfcStatus] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [adminCode, setAdminCode] = useState('0000');
  const [serialPrefix] = useState('VCA-2026-');
  const [serialCounter, setSerialCounter] = useState(22);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  
  const addLog = (msg: string) => setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));

  const currentSerial = `${serialPrefix}${String(serialCounter).padStart(4, '0')}`;

  const handleProgramNfc = () => {
    setNfcStatus('SCANNING');
    addLog('Awaiting physical NFC tag tap for WRITING...');
    
    // Simulate Web NFC write
    setTimeout(() => {
      setNfcStatus('SUCCESS');
      addLog(`Tag programmed successfully with Serial: ${currentSerial}`);
      addLog(`Card Data: ${selectedCard?.name} - Grade: ${selectedCard?.gradeLabel || 'VCA 10 GEM MINT'}`);
      
      const updatedCard = {
        ...selectedCard,
        certificationNumber: currentSerial,
        nfcId: `UID-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        nfcLocked: isLocked
      };
      onUpdateCard(updatedCard);
      
      setShowAnimation(true);
      setSerialCounter(prev => prev + 1);
      
      setTimeout(() => {
        setNfcStatus('IDLE');
      }, 3000);
    }, 2000);
  };

  const handleReadNfc = () => {
    setNfcStatus('SCANNING');
    addLog('Awaiting physical NFC tag tap for READING...');
    
    // Simulate Web NFC read
    setTimeout(() => {
      if (selectedCard?.nfcId) {
        setNfcStatus('SUCCESS');
        addLog(`Tag detected. UID: ${selectedCard.nfcId}`);
        addLog(`Payload: VCA Serial ${selectedCard.certificationNumber || currentSerial}`);
        setShowAnimation(true);
      } else {
        setNfcStatus('ERROR');
        addLog('Tag read successfully, but it is empty or not formatted for VCA.');
      }
      
      setTimeout(() => {
        setNfcStatus('IDLE');
      }, 3000);
    }, 1500);
  };

  const handleLockNfc = () => {
    const input = window.prompt('Enter Admin Code to lock tag:', '');
    if (input === adminCode) {
      setNfcStatus('SCANNING');
      addLog('Awaiting tag tap to LOCK...');
      setTimeout(() => {
        setNfcStatus('SUCCESS');
        setIsLocked(true);
        addLog('Tag permanently locked. Write access disabled.');
        setTimeout(() => setNfcStatus('IDLE'), 2000);
      }, 1500);
    } else {
      addLog('Authentication failed. Incorrect admin code.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-cyan-400" />
            <span>VCA NFC Identity Management</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Program, read, and securely lock ISO-14443A NFC chips inside VCA Slabs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
            Current Sequential Serial: <strong className="text-cyan-400">{currentSerial}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: NFC Operations */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Sub-navigation tabs (mimicking NFC Tools App) */}
          <div className="flex items-center w-full bg-slate-900 border border-slate-800 rounded-xl p-1 overflow-hidden">
            {['READ', 'WRITE', 'OTHER', 'TASKS'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab as any)}
                className={`flex-1 text-center py-2 text-[10px] font-bold tracking-wider transition rounded-lg ${
                  activeSubTab === tab 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 min-h-[400px] flex flex-col">
            
            {activeSubTab === 'READ' && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all ${
                  nfcStatus === 'SCANNING' ? 'border-cyan-400 bg-cyan-500/20 animate-pulse text-cyan-300 scale-110' : 
                  nfcStatus === 'SUCCESS' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' :
                  nfcStatus === 'ERROR' ? 'border-rose-500 bg-rose-500/20 text-rose-400' :
                  'border-slate-700 bg-slate-950 text-slate-400'
                }`}>
                  <Smartphone className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-2">Approach an NFC Tag</h4>
                  <p className="text-xs text-slate-400 max-w-[250px]">
                    Place the VCA slab near the NFC reader or the back of your smartphone.
                  </p>
                </div>
                <button
                  onClick={handleReadNfc}
                  disabled={nfcStatus === 'SCANNING'}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition w-full max-w-[200px]"
                >
                  {nfcStatus === 'SCANNING' ? 'Listening...' : 'Read Tag'}
                </button>
              </div>
            )}

            {activeSubTab === 'WRITE' && (
              <div className="flex-1 flex flex-col space-y-5">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Record Payload to Write
                  </h4>
                  
                  <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs space-y-2.5">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
                      <span className="text-slate-400">Card Identity</span>
                      <span className="font-semibold text-white truncate max-w-[150px]">{selectedCard?.name || 'No Card Selected'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
                      <span className="text-slate-400">Sequential Serial</span>
                      <span className="font-mono font-bold text-cyan-400">{currentSerial}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
                      <span className="text-slate-400">Grade Assignment</span>
                      <span className="font-bold text-emerald-400">{selectedCard?.gradeLabel || 'VCA 10 GEM MINT'}</span>
                    </div>
                    <div className="flex flex-col gap-1 pt-1">
                      <span className="text-slate-500 text-[10px]">Grading Reason/Notes:</span>
                      <p className="text-slate-300 text-[10px] italic">
                        {selectedCard?.reviewerNotes || "Flawless centering. Pristine surface. Minimal edge wear on back."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1" />

                <div className="bg-cyan-950/30 border border-cyan-800/40 rounded-xl p-3 flex gap-3 text-[11px] text-cyan-300">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <p>Writing this record will associate the current physical NFC chip with the immutable VCA digital ledger entry for <strong>{currentSerial}</strong>.</p>
                </div>

                <button
                  onClick={handleProgramNfc}
                  disabled={nfcStatus === 'SCANNING' || !selectedCard}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition w-full shadow-lg shadow-cyan-950/40 flex items-center justify-center gap-2"
                >
                  <Radio className="w-4 h-4" />
                  {nfcStatus === 'SCANNING' ? 'Approach Tag to Write...' : 'Write Record to Tag'}
                </button>
              </div>
            )}

            {activeSubTab === 'OTHER' && (
              <div className="flex-1 flex flex-col space-y-2">
                {/* Mimicking NFC Tools App "OTHER" menu */}
                {[
                  { icon: Copy, label: 'Copy tag' },
                  { icon: Layers, label: 'Copy to infinity!' },
                  { icon: Trash2, label: 'Erase tag' },
                  { icon: Lock, label: 'Lock tag', action: handleLockNfc, active: isLocked },
                  { icon: HardDrive, label: 'Read memory' },
                  { icon: AlertTriangle, label: 'Format memory' },
                  { icon: Key, label: 'Set password' },
                  { icon: Key, label: 'Remove password' },
                  { icon: Smartphone, label: 'Advanced NFC commands' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="flex items-center gap-3 p-3 w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition"
                  >
                    <div className={`p-1.5 rounded-md ${item.active ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-sm font-medium ${item.active ? 'text-rose-400' : 'text-slate-200'}`}>
                      {item.label} {item.active && '(Locked)'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {activeSubTab === 'TASKS' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <FileText className="w-12 h-12 mb-4 opacity-50" />
                <h4 className="font-bold text-white mb-2">Automated Tasks</h4>
                <p className="text-xs">
                  Create sequential programming batches or assign macros to execute upon NFC detection.
                </p>
              </div>
            )}

          </div>

          {/* Activity Log */}
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[9px] h-32 overflow-y-auto space-y-1">
            {log.length === 0 && <span className="text-slate-600">No recent NFC activity...</span>}
            {log.map((entry, idx) => (
              <div key={idx} className={idx === 0 ? "text-cyan-400" : "text-slate-500"}>
                {entry}
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: 3D Visualization */}
        <div className="lg:col-span-7 relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden min-h-[500px] flex flex-col items-center justify-center">
          
          {/* Congrats Overlay */}
          {showAnimation && (
            <div className="absolute inset-x-0 top-6 z-10 flex flex-col items-center animate-in slide-in-from-top-10 fade-in duration-500">
              <div className="px-6 py-3 bg-emerald-950/80 border border-emerald-500/50 backdrop-blur-md rounded-full shadow-2xl flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <div className="text-center">
                  <div className="font-bold text-white text-sm">Congrats, you have graded and bound a card!</div>
                  <div className="text-emerald-300 text-[10px] font-mono">Ready to send back to customer.</div>
                </div>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 to-transparent pointer-events-none" />
          
          <div className="w-full h-full relative z-0">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
              <VCASlab3D 
                card={selectedCard}
                serialNumber={selectedCard?.certificationNumber || currentSerial}
                gradeLabel={selectedCard?.gradeLabel || 'VCA 10 GEM MINT'}
                isVerified={!!selectedCard?.nfcId || showAnimation}
              />
            </Canvas>
          </div>

          {/* Admin Control (Dev Overlay) */}
          <div className="absolute bottom-4 right-4 z-10 bg-slate-900/80 p-2 rounded-xl border border-slate-800 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-slate-400">Admin Lock Code:</span>
              <input 
                type="text" 
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-[9px] font-mono text-white w-16 text-center"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
