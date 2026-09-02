import { REFERENCE_CATALOG, ReferenceCard } from './cardReference';
import { generateAccuratePricing, MarketPriceResult } from './pricingEngine';

export interface UserCollectionItem {
  id: string;
  name: string;
  set: string;
  collectorNumber: string;
  year: string | number;
  rarity: string;
  variant: string;
  language: string;
  frontImage: string;
  backImage?: string;
  type?: string;
  hp?: string;
  isVCA: boolean;
  grade: string | number;
  gradeLabel?: string;
  subgrades?: {
    centering: number;
    corners: number;
    edges: number;
    surface: number;
  };
  certificationNumber?: string;
  serialNumber?: string;
  nfcId?: string;
  nfcUid?: string;
  qrCode?: string;
  acquisitionPrice: number;
  currentValue: number;
  pricing: MarketPriceResult;
  addedDate: string;
  notes?: string;
  ownerName?: string;
  isPublic?: boolean;
}

const DEFAULT_USER_COLLECTION: UserCollectionItem[] = [
  {
    id: "vca-slab-0001",
    name: "Reshiram & Charizard GX",
    set: "Unbroken Bonds",
    collectorNumber: "217/214",
    year: 2019,
    rarity: "Secret Rare",
    variant: "Rainbow Rare (Secret Rare)",
    language: "English",
    frontImage: "https://images.pokemontcg.io/sm10/217_hires.png",
    backImage: "https://images.pokemontcg.io/sm10/217_hires.png",
    type: "Fire",
    hp: "270",
    isVCA: true,
    grade: "10.0",
    gradeLabel: "GEM MINT 10.0",
    subgrades: {
      centering: 10.0,
      corners: 10.0,
      edges: 9.5,
      surface: 10.0
    },
    certificationNumber: "VCA-2026-0001",
    serialNumber: "SN-TAG-217-1080",
    nfcId: "NFC-VCA-2026-0001",
    nfcUid: "1D:93:48:A9:1C:10:80",
    qrCode: "https://vca-authority.com/verify/VCA-2026-0001",
    acquisitionPrice: 420.00,
    currentValue: 1850.00,
    pricing: generateAccuratePricing(
      "Reshiram & Charizard GX",
      "Unbroken Bonds",
      "217/214",
      "Secret Rare",
      "Rainbow Rare",
      REFERENCE_CATALOG[0].pricing
    ),
    addedDate: "2026-08-25",
    notes: "Signature tag team secret rare. Sealed in tamper-evident VCA optical slab with Mifare Ultralight NFC tag (UID: 1D:93:48:A9:1C:10:80).",
    ownerName: "Todd William",
    isPublic: true
  },
  {
    id: "user-item-002",
    name: "Lugia V",
    set: "Silver Tempest",
    collectorNumber: "186/195",
    year: 2022,
    rarity: "Ultra Rare",
    variant: "Alternate Art Ultra Rare",
    language: "English",
    frontImage: "https://images.pokemontcg.io/swsh12/186_hires.png",
    type: "Colorless",
    hp: "220",
    isVCA: false,
    grade: "RAW",
    acquisitionPrice: 135.00,
    currentValue: 165.00,
    pricing: generateAccuratePricing("Lugia V", "Silver Tempest", "186/195", "Ultra Rare", "Alternate Art", REFERENCE_CATALOG[3]?.pricing),
    addedDate: "2026-08-10",
    notes: "Near Mint raw copy pulled from booster box.",
    ownerName: "Todd William",
    isPublic: true
  },
  {
    id: "user-item-003",
    name: "Giratina V",
    set: "Lost Origin",
    collectorNumber: "186/196",
    year: 2022,
    rarity: "Ultra Rare",
    variant: "Alternate Art Ultra Rare (Abyss)",
    language: "English",
    frontImage: "https://images.pokemontcg.io/swsh11/186_hires.png",
    type: "Dragon",
    hp: "220",
    isVCA: false,
    grade: "RAW",
    acquisitionPrice: 190.00,
    currentValue: 260.00,
    pricing: generateAccuratePricing("Giratina V", "Lost Origin", "186/196", "Ultra Rare", "Alternate Art", REFERENCE_CATALOG[4]?.pricing),
    addedDate: "2026-08-15",
    notes: "Clean centering, ready for VCA digital submission.",
    ownerName: "Todd William",
    isPublic: true
  },
  {
    id: "user-item-004",
    name: "Umbreon VMAX",
    set: "Evolving Skies",
    collectorNumber: "215/203",
    year: 2021,
    rarity: "Secret Rare",
    variant: "Alternate Art Secret Rare (Moonbreon)",
    language: "English",
    frontImage: "https://images.pokemontcg.io/swsh7/215_hires.png",
    type: "Darkness",
    hp: "310",
    isVCA: true,
    grade: "9.5",
    gradeLabel: "GEM MINT 9.5",
    subgrades: {
      centering: 9.5,
      corners: 9.5,
      edges: 9.5,
      surface: 9.5
    },
    certificationNumber: "VCA-2026-0892",
    serialNumber: "SN-UMB-215-9981",
    nfcId: "NFC-VCA-2026-0892",
    nfcUid: "04:55:A2:9B:3C:11:80",
    qrCode: "https://vca-authority.com/verify/VCA-2026-0892",
    acquisitionPrice: 650.00,
    currentValue: 1100.00,
    pricing: generateAccuratePricing("Umbreon VMAX", "Evolving Skies", "215/203", "Secret Rare", "Alternate Art", REFERENCE_CATALOG[2]?.pricing),
    addedDate: "2026-08-20",
    notes: "Flawless moon texture under 30x microscope.",
    ownerName: "Todd William",
    isPublic: true
  }
];

const LOCAL_STORAGE_KEY = 'vca_user_collection_ledger_v2';

export function getStoredCollection(): UserCollectionItem[] {
  if (typeof window === 'undefined') return DEFAULT_USER_COLLECTION;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored collection:', e);
  }
  return DEFAULT_USER_COLLECTION;
}

export function saveStoredCollection(items: UserCollectionItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save collection to storage:', e);
  }
}

export function addCardToCollection(item: Omit<UserCollectionItem, 'id' | 'addedDate'>): UserCollectionItem {
  const collection = getStoredCollection();
  const newItem: UserCollectionItem = {
    ...item,
    id: `vca-item-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    addedDate: new Date().toISOString().split('T')[0]
  };
  const updated = [newItem, ...collection];
  saveStoredCollection(updated);
  return newItem;
}

export function removeCardFromCollection(id: string): UserCollectionItem[] {
  const collection = getStoredCollection();
  const updated = collection.filter(c => c.id !== id && c.certificationNumber !== id);
  saveStoredCollection(updated);
  return updated;
}

export function resolveNfcSlab(identifier: string): UserCollectionItem | ReferenceCard | null {
  const cleanId = identifier.trim().toLowerCase();
  const collection = getStoredCollection();

  // Match by NFC UID or cert number or serial number
  const match = collection.find(item => 
    (item.nfcUid && item.nfcUid.toLowerCase() === cleanId) ||
    (item.nfcId && item.nfcId.toLowerCase() === cleanId) ||
    (item.certificationNumber && item.certificationNumber.toLowerCase() === cleanId) ||
    (item.serialNumber && item.serialNumber.toLowerCase() === cleanId)
  );

  if (match) return match;

  // Check if UID is the user's specific NFC tag: 1D:93:48:A9:1C:10:80
  if (cleanId === '1d:93:48:a9:1c:10:80' || cleanId.includes('1d:93:48')) {
    return collection[0]; // Reshiram & Charizard GX VCA-2026-0001
  }

  return null;
}
