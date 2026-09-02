import React, { useState, useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, PresentationControls, ContactShadows, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  ShieldCheck, MapPin, Calendar, Upload, Hexagon, Grid, 
  Search, Radio, TrendingUp, DollarSign, Camera, CheckCircle2, 
  ExternalLink, Sparkles, ChevronRight, RefreshCw, Eye, ArrowUpRight,
  Sliders, Layers, Award, AlertCircle, Copy, Check, BarChart3, Wifi,
  Zap, LogIn, LogOut, User as UserIcon
} from 'lucide-react';
import { getStoredCollection, saveStoredCollection, addCardToCollection, UserCollectionItem, resolveNfcSlab } from '../../lib/cardDatabase';
import { REFERENCE_CATALOG, ReferenceCard } from '../../lib/cardReference';
import { MarketPriceResult, generateAccuratePricing } from '../../lib/pricingEngine';
import { LiveCameraScanner } from '../scanner/LiveCameraScanner';
import { VaultGrid } from '../scanner/VaultGrid';
import { AuthModal } from '../auth/AuthModal';
import { useAuth } from '../../context/AuthContext';
import { VaultCard } from '../../lib/firebase';

// Guaranteed canvas texture generator to prevent 3D slab from ever disappearing
const createFallbackTexture = (cardName: string, setName: string, certNumber: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 716;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Dark holographic background
    const grad = ctx.createLinearGradient(0, 0, 512, 716);
    grad.addColorStop(0, '#0a1630');
    grad.addColorStop(0.5, '#190e2b');
    grad.addColorStop(1, '#050c1e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 716);

    // Golden foil border
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 12;
    ctx.strokeRect(10, 10, 492, 696);

    // Inner cyan foil outline
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.strokeRect(26, 26, 460, 664);

    // Card Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(cardName.toUpperCase().slice(0, 22), 256, 88);

    // Set & Number
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`${setName} • #${certNumber}`, 256, 126);

    // Central holographic emblem
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(256, 360, 95, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#020617';
    ctx.font = 'black 34px monospace';
    ctx.fillText('VCA 10', 256, 372);

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('AUTHENTICATED ASSET', 256, 620);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

// 3D Realistic VCA Acrylic Slab Model
const RealisticVcaSlab3D = ({ 
  frontUrl, 
  backUrl,
  cardName,
  setName,
  certNumber,
  grade = "10.0",
  gradeLabel = "GEM MINT 10.0" 
}: { 
  frontUrl: string;
  backUrl?: string;
  cardName: string;
  setName: string;
  certNumber: string;
  grade?: string | number;
  gradeLabel?: string;
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [textureLoaded, setTextureLoaded] = useState<THREE.Texture | null>(null);

  // High quality texture loading with persistent fallback
  useEffect(() => {
    const fallbackTex = createFallbackTexture(cardName || 'Trading Card', setName || 'Expansion Set', certNumber || '001');
    setTextureLoaded(fallbackTex);

    if (frontUrl) {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('anonymous');
      loader.load(
        frontUrl,
        (loadedTex) => {
          loadedTex.needsUpdate = true;
          setTextureLoaded(loadedTex);
        },
        undefined,
        (err) => {
          console.warn('Image texture load fallback active:', err);
          setTextureLoaded(fallbackTex);
        }
      );
    }
  }, [frontUrl, cardName, setName, certNumber]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.25;
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
        {/* Trading Card inside slab */}
        <mesh position={[0, -0.35, 0]}>
          <planeGeometry args={[2.5, 3.5]} />
          <meshBasicMaterial map={textureLoaded || undefined} color={textureLoaded ? '#ffffff' : '#081226'} toneMapped={false} />
        </mesh>

        {/* Holographic Sheen Layer */}
        <mesh position={[0, -0.35, 0.01]}>
          <planeGeometry args={[2.5, 3.5]} />
          <meshPhysicalMaterial 
            color="#06b6d4"
            transmission={0.88}
            opacity={0.15}
            roughness={0.1}
            metalness={0.8}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transparent
          />
        </mesh>

        {/* Outer Heavy Acrylic Slab Shell */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.1, 4.8, 0.22]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            transmission={0.96}
            opacity={1}
            metalness={0.05}
            roughness={0.03}
            ior={1.52}
            thickness={0.8}
            specularIntensity={1.2}
            transparent
          />
        </mesh>

        {/* Sonic-Welded Frosted Border Frame */}
        <mesh position={[0, 0, 0.09]}>
          <ringGeometry args={[1.3, 1.45, 32]} />
          <meshStandardMaterial color="#0284c7" opacity={0.3} transparent />
        </mesh>

        {/* VCA Master Authentication Label Header */}
        <group position={[0, 1.85, 0.05]}>
          {/* Label Background Plate */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[2.8, 0.75]} />
            <meshStandardMaterial color="#020617" roughness={0.4} metalness={0.6} />
          </mesh>

          {/* Cyan Glow Top Border */}
          <mesh position={[0, 0.36, 0.01]}>
            <planeGeometry args={[2.8, 0.04]} />
            <meshBasicMaterial color="#06b6d4" />
          </mesh>

          {/* VCA Holographic Authenticity Seal */}
          <mesh position={[-1.1, 0, 0.02]}>
            <boxGeometry args={[0.35, 0.35, 0.02]} />
            <meshStandardMaterial color="#38bdf8" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Grade Badge */}
          <mesh position={[1.05, 0, 0.02]}>
            <boxGeometry args={[0.5, 0.5, 0.02]} />
            <meshStandardMaterial color="#059669" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>
      </Float>
    </group>
  );
};

export const UserPortal: React.FC = () => {
  const { user, vault, openAuthModal, logout, isAuthModalOpen, closeAuthModal } = useAuth();
  
  const [profile, setProfile] = useState({
    name: 'Todd William',
    handle: '@toddwilliam420',
    bio: 'TCG Collector & VCA Verified Curator. Signature collection featuring VCA Gem Mint 10.0 Unbroken Bonds Reshiram & Charizard GX.',
    location: 'Seattle, WA',
    joined: 'August 2026',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'
  });

  const [activeTab, setActiveTab] = useState<'vault' | 'scanner' | 'showcase' | 'collection' | 'prices' | 'nfc'>('vault');
  const [isLiveScannerOpen, setIsLiveScannerOpen] = useState(false);
  const [collection, setCollection] = useState<UserCollectionItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<UserCollectionItem | null>(null);
  const [selectedCard3D, setSelectedCard3D] = useState<UserCollectionItem | null>(null);

  // Scanner state
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // NFC Scanner State
  const [nfcInput, setNfcInput] = useState('1D:93:48:A9:1C:10:80');
  const [nfcResolved, setNfcResolved] = useState<any>(null);
  const [isNfcReading, setIsNfcReading] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Price search
  const [priceSearch, setPriceSearch] = useState('');
  const [selectedPriceCard, setSelectedPriceCard] = useState<ReferenceCard>(REFERENCE_CATALOG[0]);

  // Load collection
  useEffect(() => {
    const items = getStoredCollection();
    setCollection(items);
    if (items.length > 0) {
      setSelectedCard3D(items[0]);
    }
  }, []);

  const totalVaultValue = vault.reduce((acc, c) => acc + (c.rawValue || 0), 0);
  const totalPortfolioValue = totalVaultValue > 0 ? totalVaultValue : collection.reduce((sum, item) => sum + (item.currentValue || 0), 0);
  const gradedCount = vault.length > 0 ? vault.filter(c => (c.psa10Value || 0) > 0).length : collection.filter(c => c.isVCA).length;
  const totalCardCount = vault.length > 0 ? vault.length : collection.length;

  const handleImageUpload = (type: 'avatar' | 'banner') => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setProfile(prev => ({ ...prev, [type]: url }));
    }
  };

  const handleScannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setScanImage(base64);
        runCardIdentification(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const runCardIdentification = async (base64Data: string) => {
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);
    setAddedSuccess(false);

    try {
      const res = await fetch('/api/vca/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data })
      });

      if (!res.ok) throw new Error('Scanner API response error');
      const data = await res.json();
      
      if (data.card && data.card.status === 'error') {
        setScanError(data.card.message || 'Card could not be recognized');
      } else {
        setScanResult(data.card);
      }
    } catch (err: any) {
      setScanError(err.message || 'Identification failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddScanToCollection = () => {
    if (!scanResult) return;

    const newItem = addCardToCollection({
      name: scanResult.name,
      set: scanResult.set,
      collectorNumber: scanResult.cardNumber || scanResult.collector_number || '001/100',
      year: scanResult.year || 2023,
      rarity: scanResult.rarity || 'Ultra Rare',
      variant: scanResult.variant || 'Standard Holo',
      language: scanResult.language || 'English',
      frontImage: scanResult.reference_image || scanImage || 'https://images.pokemontcg.io/sm10/217_hires.png',
      isVCA: scanResult.grade ? true : false,
      grade: scanResult.grade || 'RAW',
      gradeLabel: scanResult.gradeLabel || 'RAW NEAR MINT',
      subgrades: scanResult.subgrades || { centering: 9.0, corners: 9.0, edges: 9.0, surface: 9.0 },
      certificationNumber: scanResult.grade ? `VCA-2026-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      acquisitionPrice: scanResult.pricing?.raw?.market || 50.0,
      currentValue: scanResult.pricing?.raw?.market || 50.0,
      pricing: scanResult.pricing,
      notes: `Identified via VCA Optical AI Scanner on ${new Date().toLocaleDateString()}`,
      ownerName: profile.name,
      isPublic: true
    });

    setCollection(getStoredCollection());
    setAddedSuccess(true);
  };

  const handleResolveNfc = async (uidToTest?: string) => {
    setIsNfcReading(true);
    const targetUid = uidToTest || nfcInput;
    try {
      const res = await fetch('/api/vca/nfc/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nfcUid: targetUid })
      });
      const data = await res.json();
      setNfcResolved(data);
    } catch (e) {
      console.error('NFC error:', e);
    } finally {
      setIsNfcReading(false);
    }
  };

  const filteredPriceCatalog = REFERENCE_CATALOG.filter(c => 
    c.name.toLowerCase().includes(priceSearch.toLowerCase()) ||
    c.set_name.toLowerCase().includes(priceSearch.toLowerCase()) ||
    c.collector_number.toLowerCase().includes(priceSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans pb-20 selection:bg-cyan-500 selection:text-black">
      {/* Dynamic Header Banner with Custom Image / GIF */}
      <div className="relative h-64 sm:h-80 w-full group overflow-hidden border-b border-cyan-950/40">
        <img src={profile.banner} alt="Profile Banner" className="w-full h-full object-cover brightness-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        
        {/* Banner Actions */}
        <div className="absolute top-4 right-4 flex items-center gap-3">
          <button
            onClick={() => setIsLiveScannerOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xl transition text-xs font-mono tracking-wider cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current animate-pulse" />
            LIVE HUD SCANNER
          </button>

          {user ? (
            <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 backdrop-blur px-3 py-1.5 rounded-xl">
              <img 
                src={user.photoURL || profile.avatar} 
                alt="Avatar" 
                className="w-6 h-6 rounded-full border border-cyan-400" 
              />
              <span className="text-xs font-mono text-cyan-300 font-bold max-w-[100px] truncate">
                {user.displayName || user.email?.split('@')[0]}
              </span>
              <button 
                onClick={() => logout()}
                title="Sign Out"
                className="text-slate-400 hover:text-rose-400 p-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal()}
              className="bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700 hover:border-cyan-500/50 backdrop-blur text-white px-3.5 py-2 rounded-xl flex items-center gap-2 transition text-xs font-mono"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-slate-200">SIGN IN / SYNC</span>
            </button>
          )}

          <label className="bg-black/70 hover:bg-cyan-950/80 border border-cyan-500/30 backdrop-blur text-white p-2 rounded-xl flex items-center justify-center cursor-pointer transition shadow-xl" title="Customize Banner">
             <Upload className="w-4 h-4 text-cyan-400" />
             <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload('banner')} />
          </label>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        
        {/* Profile Card Header */}
        <div className="bg-[#0b1329]/90 border border-cyan-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-cyan-950/50">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between">
            
            {/* Avatar & Identifiers */}
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <div className="relative group shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-cyan-400/40 bg-slate-900 shadow-2xl shadow-cyan-500/20">
                  <img src={user?.photoURL || profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                </div>
                <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer rounded-2xl">
                  <Camera className="w-5 h-5 text-cyan-400 mb-1" />
                  <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-300">UPLOAD</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload('avatar')} />
                </label>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {user?.displayName || profile.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> VCA VERIFIED
                  </span>
                </div>
                <div className="text-cyan-400 font-mono text-sm">
                  {user?.email ? `@${user.email.split('@')[0]}` : profile.handle}
                </div>
                <p className="text-slate-300 text-sm max-w-xl leading-relaxed">{profile.bio}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-cyan-500" /> {profile.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-cyan-500" /> Joined {profile.joined}</span>
                </div>
              </div>
            </div>

            {/* Portfolio Quick Stats */}
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
              <div className="bg-slate-950/80 border border-cyan-900/40 rounded-2xl p-3.5 text-center sm:text-left">
                <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">PORTFOLIO VALUE</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5">
                  ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-slate-950/80 border border-cyan-900/40 rounded-2xl p-3.5 text-center sm:text-left">
                <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">VCA GRADED</div>
                <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-0.5">
                  {gradedCount} <span className="text-xs text-slate-400 font-normal">SLABS</span>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-cyan-900/40 rounded-2xl p-3.5 text-center sm:text-left">
                <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">VAULT ASSETS</div>
                <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                  {totalCardCount}
                </div>
              </div>
            </div>

          </div>
          
          {/* Navigation Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-800/80 pt-4">
            <button 
              onClick={() => setActiveTab('vault')}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                activeTab === 'vault' 
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25' 
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Vault & Portfolio ({totalCardCount})
            </button>
            <button 
              onClick={() => setIsLiveScannerOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30"
            >
              <Zap className="w-4 h-4 text-cyan-400" /> Live HUD Scanner
            </button>
            <button 
              onClick={() => setActiveTab('showcase')}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                activeTab === 'showcase' 
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25' 
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Hexagon className="w-4 h-4" /> 3D Slab Inspection
            </button>
            <button 
              onClick={() => setActiveTab('scanner')}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                activeTab === 'scanner' 
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25' 
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Camera className="w-4 h-4" /> Single Photo Scanner
            </button>
            <button 
              onClick={() => setActiveTab('prices')}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                activeTab === 'prices' 
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25' 
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Price Intelligence
            </button>
            <button 
              onClick={() => setActiveTab('nfc')}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-2 ${
                activeTab === 'nfc' 
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25' 
                  : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Wifi className="w-4 h-4" /> NFC Slab Ledger
            </button>
          </div>
        </div>

        {/* Tab 0: PERSISTENT FIRESTORE VAULT & PORTFOLIO */}
        {activeTab === 'vault' && (
          <div className="mt-8">
            <VaultGrid 
              onInspectSlab={(card) => {
                const pricing = generateAccuratePricing(
                  card.name, 
                  card.set, 
                  card.cardNumber, 
                  card.rarity || 'Ultra Rare', 
                  card.variant
                );

                setSelectedCard3D({
                  id: card.id,
                  name: card.name,
                  set: card.set,
                  collectorNumber: card.cardNumber,
                  year: 2023,
                  rarity: card.rarity || 'Ultra Rare',
                  variant: card.variant,
                  language: 'English',
                  frontImage: card.imageUrl || 'https://images.pokemontcg.io/sm10/217_hires.png',
                  isVCA: true,
                  grade: '10.0',
                  gradeLabel: 'GEM MINT 10.0',
                  subgrades: { centering: 10, corners: 10, edges: 9.5, surface: 10 },
                  certificationNumber: `VCA-2026-${card.id.slice(0, 4)}`,
                  acquisitionPrice: card.rawValue,
                  currentValue: card.psa10Value || card.rawValue * 4,
                  pricing,
                  addedDate: card.scannedAt || new Date().toISOString(),
                  notes: 'Synchronized from VCA Live Vault',
                  ownerName: user?.displayName || profile.name,
                  isPublic: true
                });
                setActiveTab('showcase');
              }}
              onOpenScanner={() => setIsLiveScannerOpen(true)}
            />
          </div>
        )}

        {/* Tab 1: 3D SLAB SHOWCASE */}
        {activeTab === 'showcase' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 3D Canvas Viewport */}
            <div className="lg:col-span-2 bg-[#080e1e]/90 border border-cyan-900/40 rounded-3xl p-6 relative overflow-hidden h-[620px] flex flex-col justify-between shadow-2xl">
              <div className="relative flex items-start justify-between z-10 pointer-events-none">
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold tracking-widest uppercase">
                    <ShieldCheck className="w-4 h-4" /> VCA ULTRALIGHT NFC OPTICAL SLAB
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">
                    {selectedCard3D?.name || "Reshiram & Charizard GX"}
                  </h2>
                  <div className="text-sm text-slate-300 font-mono">
                    {selectedCard3D?.set} • <span className="text-cyan-400">{selectedCard3D?.collectorNumber}</span> • {selectedCard3D?.variant}
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-right">
                  <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">GRADE OVERALL</div>
                  <div className="text-xl font-black text-emerald-300 font-mono">{selectedCard3D?.grade || "10.0"}</div>
                </div>
              </div>

              {/* Three.js Canvas */}
              <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 8], fov: 42 }}>
                  <Suspense fallback={
                    <Html center>
                      <div className="w-full flex flex-col items-center justify-center gap-3 text-cyan-400 font-mono text-center">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto" />
                        <span className="whitespace-nowrap">INITIALIZING 3D RENDERER...</span>
                      </div>
                    </Html>
                  }>
                    <Environment preset="city" />
                    <ambientLight intensity={0.7} />
                    <directionalLight position={[5, 8, 5]} intensity={1.5} />
                    <pointLight position={[-5, -5, 3]} intensity={0.8} color="#06b6d4" />
                    
                    <PresentationControls 
                      global 
                      snap={true}
                      rotation={[0, -0.2, 0]} 
                      polar={[-Math.PI / 3, Math.PI / 3]} 
                      azimuth={[-Math.PI / 1.5, Math.PI / 1.5]}
                    >
                      <RealisticVcaSlab3D 
                        frontUrl={selectedCard3D?.frontImage || "https://images.pokemontcg.io/sm10/217_hires.png"}
                        cardName={selectedCard3D?.name || "Reshiram & Charizard GX"}
                        setName={selectedCard3D?.set || "Unbroken Bonds"}
                        certNumber={selectedCard3D?.certificationNumber || "VCA-2026-0001"}
                        grade={selectedCard3D?.grade || "10.0"}
                        gradeLabel={selectedCard3D?.gradeLabel || "GEM MINT 10.0"}
                      />
                    </PresentationControls>
                    <ContactShadows position={[0, -3.2, 0]} opacity={0.5} scale={15} blur={2.5} far={4} color="#0284c7" />
                  </Suspense>
                </Canvas>
              </div>

              {/* Interaction instructions footer */}
              <div className="z-10 bg-slate-950/70 border border-slate-800/80 backdrop-blur px-4 py-2 rounded-xl flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Click & drag anywhere on slab to inspect holographic foil & micro-welded casing
                </span>
                <span className="text-cyan-400 font-bold">NFC TAG EMBEDDED</span>
              </div>
            </div>

            {/* Slab Details & Subgrade Breakdown */}
            <div className="space-y-4">
              <div className="bg-[#0b1329]/90 border border-cyan-900/40 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-cyan-400" /> VCA CERTIFICATE DETAILS
                  </h3>
                  <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-800/40">
                    {selectedCard3D?.certificationNumber || "VCA-2026-0001"}
                  </span>
                </div>

                {/* Subgrades breakdown */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Centering</div>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                      {selectedCard3D?.subgrades?.centering || 10.0}
                    </div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Corners</div>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                      {selectedCard3D?.subgrades?.corners || 10.0}
                    </div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Edges</div>
                    <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">
                      {selectedCard3D?.subgrades?.edges || 9.5}
                    </div>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Surface</div>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                      {selectedCard3D?.subgrades?.surface || 10.0}
                    </div>
                  </div>
                </div>

                {/* Market Price matrix for this slab */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="text-xs font-mono text-slate-400 uppercase font-bold">Grade Comparison Values</div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-lg">
                      <div className="text-[10px] text-emerald-400 font-bold">PSA 10</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        ${selectedCard3D?.pricing?.psa10?.market.toLocaleString() || '1,850'}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">PSA 9</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        ${selectedCard3D?.pricing?.psa9?.market.toLocaleString() || '320'}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400">RAW NM</div>
                      <div className="text-sm font-bold text-white mt-0.5">
                        ${selectedCard3D?.pricing?.raw?.market.toLocaleString() || '185'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* NFC & Ledger metadata */}
                <div className="bg-slate-950/90 rounded-2xl p-4 border border-cyan-900/30 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>NFC Chip UID:</span>
                    <span className="text-cyan-300 font-bold">{selectedCard3D?.nfcUid || "1D:93:48:A9:1C:10:80"}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Serial:</span>
                    <span className="text-slate-200">{selectedCard3D?.serialNumber || "SN-TAG-217-1080"}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Ledger Owner:</span>
                    <span className="text-slate-200">{selectedCard3D?.ownerName || profile.name}</span>
                  </div>
                </div>

                {/* Switch Slab Button Selector */}
                <div className="space-y-1.5 pt-2">
                  <div className="text-xs font-mono text-slate-400 uppercase">Select Graded Slab to Inspect:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {collection.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedCard3D(item)}
                        className={`p-2 rounded-xl text-left border transition text-xs font-mono truncate ${
                          selectedCard3D?.id === item.id 
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-300' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-bold truncate">{item.name}</div>
                        <div className="text-[10px] opacity-75">{item.isVCA ? `VCA ${item.grade}` : 'RAW'}</div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Tab 2: COLLECTION GRID & DETAILS */}
        {activeTab === 'collection' && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0b1329]/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white font-mono">COLLECTION VAULT</h2>
                <span className="text-xs font-mono bg-cyan-950 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-800/40">
                  {collection.length} ITEMS TRACKED
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setActiveTab('scanner')}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-mono text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-400 transition"
                >
                  <Camera className="w-4 h-4" /> SCAN NEW CARD
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {collection.map(card => (
                <div 
                  key={card.id}
                  onClick={() => { setSelectedCard(card); setSelectedCard3D(card); }}
                  className="bg-[#0b1329]/80 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/40 group flex flex-col justify-between"
                >
                  <div>
                    {/* Card Image Thumbnail */}
                    <div className="aspect-[3/4.2] rounded-xl overflow-hidden mb-3 relative bg-slate-950 border border-slate-800/60">
                      <img 
                        src={card.frontImage} 
                        alt={card.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      />
                      {card.isVCA ? (
                        <div className="absolute top-2 right-2 bg-emerald-500 text-black text-[10px] font-mono font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> VCA {card.grade}
                        </div>
                      ) : (
                        <div className="absolute top-2 right-2 bg-slate-800/90 text-slate-300 text-[10px] font-mono font-bold px-2 py-1 rounded-lg border border-slate-700">
                          RAW
                        </div>
                      )}

                      {card.nfcUid && (
                        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur text-cyan-400 text-[9px] font-mono px-2 py-0.5 rounded border border-cyan-500/30 flex items-center gap-1">
                          <Wifi className="w-2.5 h-2.5" /> NFC LINKED
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-white text-base group-hover:text-cyan-300 transition truncate">{card.name}</h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5 truncate">{card.set} • <span className="text-cyan-400">{card.collectorNumber}</span></div>
                    <div className="text-[11px] text-slate-400 font-mono mt-1 truncate">{card.variant}</div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase">Est. Market Value</div>
                      <div className="text-base font-black text-emerald-400 font-mono">
                        ${card.currentValue?.toLocaleString()}
                      </div>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCard3D(card);
                        setActiveTab('showcase');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 text-xs font-mono flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> 3D
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: AI CARD SCANNER */}
        {activeTab === 'scanner' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-[#0b1329]/90 border border-cyan-900/40 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold text-white font-mono flex items-center gap-2">
                    <Camera className="w-5 h-5 text-cyan-400" /> OPTICAL AI SCANNER
                  </h2>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-lg border border-cyan-800/40">
                    REAL COMPUTER VISION
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Upload or photograph any Pokémon card. The VCA vision pipeline performs OCR, variant recognition (Rainbow, 1st Edition, Shadowless, Alt Art), authentic reference comparison, and live pricing indexing.
                </p>

                {/* File Upload / Camera Zone */}
                <label className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-slate-950/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition group">
                  {scanImage ? (
                    <div className="w-48 aspect-[3/4.2] rounded-xl overflow-hidden border border-cyan-500/40 relative shadow-xl">
                      <img src={scanImage} alt="Scanned card" className="w-full h-full object-cover" />
                      {isScanning && (
                        <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 text-cyan-400 font-mono text-xs">
                          <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                          <span>ANALYZING IMAGE...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition">
                        <Camera className="w-8 h-8" />
                      </div>
                      <div className="font-mono font-bold text-white text-sm">SELECT PHOTO OR TAKE PICTURE</div>
                      <div className="text-xs text-slate-400 font-mono mt-1">Supports JPEG, PNG, WebP</div>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleScannerUpload} />
                </label>

                {scanError && (
                  <div className="bg-rose-950/50 border border-rose-500/40 p-4 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{scanError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Scanner Identification & Pricing Result */}
            <div className="lg:col-span-6">
              {scanResult ? (
                <div className="bg-[#0b1329]/90 border border-cyan-500/30 rounded-3xl p-6 space-y-5 shadow-2xl shadow-cyan-950/50">
                  <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" /> IDENTIFICATION CONFIRMED ({(scanResult.confidence * 100).toFixed(1)}%)
                      </div>
                      <h3 className="text-2xl font-black text-white mt-1">{scanResult.name}</h3>
                      <div className="text-sm font-mono text-slate-300">
                        {scanResult.set} • <span className="text-cyan-400">{scanResult.cardNumber || scanResult.collector_number}</span>
                      </div>
                    </div>

                    <span className="px-3 py-1 bg-cyan-950 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-mono font-bold">
                      {scanResult.variant || 'Standard Holo'}
                    </span>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-slate-400 uppercase font-bold">Live Market Prices</div>
                    <div className="grid grid-cols-4 gap-2 text-center font-mono">
                      <div className="bg-emerald-950/50 border border-emerald-500/40 p-2.5 rounded-xl">
                        <div className="text-[10px] text-emerald-400 font-bold">PSA 10</div>
                        <div className="text-base font-black text-white mt-0.5">
                          ${scanResult.pricing?.psa10?.market?.toLocaleString() || '1,850'}
                        </div>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400">PSA 9</div>
                        <div className="text-base font-bold text-white mt-0.5">
                          ${scanResult.pricing?.psa9?.market?.toLocaleString() || '320'}
                        </div>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400">PSA 8</div>
                        <div className="text-base font-bold text-white mt-0.5">
                          ${scanResult.pricing?.psa8?.market?.toLocaleString() || '210'}
                        </div>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <div className="text-[10px] text-slate-400">RAW NM</div>
                        <div className="text-base font-bold text-emerald-400 mt-0.5">
                          ${scanResult.pricing?.raw?.market?.toLocaleString() || '185'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleAddScanToCollection}
                      disabled={addedSuccess}
                      className={`flex-1 py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                        addedSuccess 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25'
                      }`}
                    >
                      {addedSuccess ? (
                        <>
                          <Check className="w-4 h-4" /> ADDED TO YOUR COLLECTION!
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> SAVE TO MY COLLECTION
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0b1329]/60 border border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 font-mono flex flex-col items-center justify-center h-full min-h-[300px]">
                  <Camera className="w-12 h-12 text-slate-600 mb-3" />
                  <div className="text-base font-bold text-slate-300">NO SCAN LOADED</div>
                  <div className="text-xs text-slate-500 mt-1 max-w-sm">
                    Upload any Pokémon card photo on the left to initiate real-time OCR, variant matching, and price intelligence.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: PRICE INTELLIGENCE (PSA 10, 9, 8, RAW) */}
        {activeTab === 'prices' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#0b1329]/90 border border-cyan-900/40 rounded-3xl p-5 space-y-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={priceSearch}
                    onChange={(e) => setPriceSearch(e.target.value)}
                    placeholder="Search card by name, set, number..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {filteredPriceCatalog.map(card => (
                    <div
                      key={card.card_id}
                      onClick={() => setSelectedPriceCard(card)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        selectedPriceCard.card_id === card.card_id
                          ? 'bg-cyan-950/80 border-cyan-400 shadow-lg shadow-cyan-950/40'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={card.image_url} alt={card.name} className="w-10 h-14 object-cover rounded-lg border border-slate-800" />
                        <div>
                          <div className="text-xs font-bold text-white">{card.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{card.set_name} • {card.collector_number}</div>
                          <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{card.variant}</div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-emerald-400">${card.pricing.psa10.market.toLocaleString()}</div>
                        <div className="text-[9px] text-slate-400">PSA 10</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Card Deep Price Analytics */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#0b1329]/90 border border-cyan-900/40 rounded-3xl p-6 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-2xl font-black text-white">{selectedPriceCard.name}</h3>
                    <div className="text-xs font-mono text-slate-300 mt-1">
                      {selectedPriceCard.set_name} • <span className="text-cyan-400">{selectedPriceCard.collector_number}</span> • {selectedPriceCard.rarity}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold rounded-xl">
                      PSA 10: ${selectedPriceCard.pricing.psa10.market.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Grade Breakdown Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                  <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-2xl">
                    <div className="text-[10px] text-emerald-400 font-bold uppercase">PSA 10 GEM MINT</div>
                    <div className="text-lg font-black text-white mt-1">${selectedPriceCard.pricing.psa10.market.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Pop: {selectedPriceCard.pricing.psa10.popCount}</div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">PSA 9 MINT</div>
                    <div className="text-lg font-bold text-white mt-1">${selectedPriceCard.pricing.psa9.market.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Pop: {selectedPriceCard.pricing.psa9.popCount}</div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">PSA 8 NM-MT</div>
                    <div className="text-lg font-bold text-white mt-1">${selectedPriceCard.pricing.psa8.market.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Pop: {selectedPriceCard.pricing.psa8.popCount}</div>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="text-[10px] text-cyan-400 font-bold uppercase">RAW NEAR MINT</div>
                    <div className="text-lg font-black text-emerald-400 mt-1">${selectedPriceCard.pricing.raw.market.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">Vol: {selectedPriceCard.pricing.raw.volume}/mo</div>
                  </div>
                </div>

                {/* Price Sources Aggregator */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-slate-400 uppercase font-bold">Verified Market Feeds & Sales</div>
                  <div className="space-y-2">
                    {selectedPriceCard.pricing.sources.map((source, idx) => (
                      <div key={idx} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-white font-bold">{source.name}</span>
                          <span className="text-slate-500">({source.condition})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 font-bold">${source.price.toLocaleString()}</span>
                          <span className="text-slate-500 text-[10px]">{source.updated}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Tab 5: NFC SLAB LEDGER & RESOLVER */}
        {activeTab === 'nfc' && (
          <div className="mt-8 max-w-4xl mx-auto space-y-6">
            <div className="bg-[#0b1329]/90 border border-cyan-900/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white font-mono flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-cyan-400" /> NFC SLAB VERIFICATION & OWNERSHIP LEDGER
                  </h2>
                  <p className="text-xs text-slate-300 font-mono mt-1">
                    Every VCA physical slab is embedded with an NXP NTAG424 DNA cryptographic NFC chip.
                  </p>
                </div>
              </div>

              {/* NFC Scanner input */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-cyan-900/40 space-y-4">
                <div className="text-xs font-mono text-slate-400 uppercase font-bold">Simulate or Read Physical NFC Tap</div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={nfcInput}
                    onChange={(e) => setNfcInput(e.target.value)}
                    placeholder="Enter NFC UID or Cert (e.g. 1D:93:48:A9:1C:10:80)"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => handleResolveNfc()}
                    disabled={isNfcReading}
                    className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold rounded-xl flex items-center gap-2 transition"
                  >
                    {isNfcReading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                    RESOLVE SLAB
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span>Quick Test UID:</span>
                  <button 
                    onClick={() => { setNfcInput('1D:93:48:A9:1C:10:80'); handleResolveNfc('1D:93:48:A9:1C:10:80'); }}
                    className="text-cyan-400 underline font-bold"
                  >
                    1D:93:48:A9:1C:10:80 (Reshiram & Charizard GX)
                  </button>
                </div>
              </div>

              {/* Resolved Slab Certificate Display */}
              {nfcResolved && nfcResolved.slab && (
                <div className="bg-slate-950/90 border border-emerald-500/40 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-400 font-mono font-bold text-sm">{nfcResolved.nfcStatus}</span>
                    </div>
                    <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950 px-3 py-1 rounded-lg border border-cyan-800">
                      {nfcResolved.slab.certNumber}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-5 items-center">
                    <img 
                      src={nfcResolved.slab.card.image_url || "https://images.pokemontcg.io/sm10/217_hires.png"} 
                      alt={nfcResolved.slab.card.name} 
                      className="w-28 aspect-[3/4.2] object-cover rounded-xl border border-cyan-500/30 shadow-lg"
                    />

                    <div className="space-y-1.5 flex-1 text-center sm:text-left">
                      <h4 className="text-xl font-black text-white">{nfcResolved.slab.card.name}</h4>
                      <div className="text-xs font-mono text-slate-300">
                        {nfcResolved.slab.card.set_name} • {nfcResolved.slab.card.collector_number} • {nfcResolved.slab.card.variant}
                      </div>
                      <div className="text-emerald-400 font-mono font-bold text-sm pt-1">
                        OVERALL GRADE: {nfcResolved.slab.gradeLabel}
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        Current Owner: <span className="text-white font-bold">{nfcResolved.slab.owner}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* Full Screen Live Camera Holographic Scanner */}
      {isLiveScannerOpen && (
        <LiveCameraScanner 
          isOpen={isLiveScannerOpen} 
          onClose={() => setIsLiveScannerOpen(false)} 
          onCardAddedToVault={(card) => {
            setActiveTab('vault');
          }}
        />
      )}

      {/* Cloud Persistence & Authentication Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </div>
  );
};
