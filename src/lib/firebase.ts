import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  signInAnonymously,
  onAuthStateChanged,
  type User
} from 'firebase/auth';

export type { User };
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with specific databaseId if provided
export const db = firebaseConfigJson.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

export interface EbayComp {
  price: number;
  date: string;
  url: string;
  title?: string;
}

export interface VaultCard {
  id: string;
  name: string;
  set: string;
  setSymbol?: string;
  cardNumber: string;
  language: 'EN' | 'JP' | string;
  variant: string;
  rawValue: number;
  psa10Value: number;
  psa9Value: number;
  psa8Value: number;
  bgs95Value?: number;
  cgc10Value?: number;
  ebayComps: EbayComp[];
  imageUrl: string;
  scannedAt: string;
  lastPriceRefresh: string;
  confidence?: number;
  rarity?: string;
  notes?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: string;
  isAnonymous?: boolean;
}

// Subscribe to auth state
export function onAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Sign in with Google
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(result.user);
  return result.user;
}

// Sign in anonymously for instant zero-friction guest vault
export async function signInAsGuest(): Promise<User> {
  const result = await signInAnonymously(auth);
  await ensureUserProfile(result.user);
  return result.user;
}

// Sign in with email & password
export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  await ensureUserProfile(result.user);
  return result.user;
}

// Sign up with email & password
export async function registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  await ensureUserProfile(result.user, displayName);
  return result.user;
}

// Sign out
export async function logout(): Promise<void> {
  await fbSignOut(auth);
}

// Ensure User Profile doc exists
export async function ensureUserProfile(user: User, customName?: string) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        displayName: customName || user.displayName || (user.isAnonymous ? 'VCA Guest Collector' : 'VCA Collector'),
        email: user.email || 'guest@vca.network',
        photoURL: user.photoURL || null,
        createdAt: new Date().toISOString(),
        isAnonymous: user.isAnonymous
      });
    }
  } catch (err) {
    console.warn('Could not sync user profile to Firestore (using fallback):', err);
  }
}

// Subscribe to User Vault in real-time
export function subscribeToVault(
  uid: string, 
  onUpdate: (cards: VaultCard[]) => void, 
  onError?: (err: Error) => void
) {
  try {
    const vaultRef = collection(db, 'users', uid, 'vault');
    const q = query(vaultRef);
    return onSnapshot(
      q, 
      (snapshot) => {
        const cards: VaultCard[] = [];
        snapshot.forEach((doc) => {
          cards.push({ id: doc.id, ...doc.data() } as VaultCard);
        });
        // Sort newest first
        cards.sort((a, b) => new Date(b.scannedAt || 0).getTime() - new Date(a.scannedAt || 0).getTime());
        onUpdate(cards);
      },
      (err) => {
        console.warn('Firestore subscription error (falling back to local cache):', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Error establishing Firestore vault listener:', err);
    if (onError) onError(err);
    return () => {};
  }
}

// Add Single Card to User Vault
export async function saveCardToVault(uid: string, card: Omit<VaultCard, 'id'> & { id?: string }): Promise<string> {
  const cardId = card.id || `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const cardRef = doc(db, 'users', uid, 'vault', cardId);
  const cardData: VaultCard = {
    ...card,
    id: cardId,
    scannedAt: card.scannedAt || new Date().toISOString(),
    lastPriceRefresh: card.lastPriceRefresh || new Date().toISOString()
  };

  try {
    await setDoc(cardRef, cardData);
  } catch (err) {
    console.warn('Direct Firestore save failed, syncing to local store as well:', err);
  }

  // Backup to localStorage for cross-fallback
  try {
    const localKey = `vca_vault_${uid}`;
    const existing: VaultCard[] = JSON.parse(localStorage.getItem(localKey) || '[]');
    const filtered = existing.filter(c => c.id !== cardId);
    localStorage.setItem(localKey, JSON.stringify([cardData, ...filtered]));
  } catch (e) {
    // Ignore storage quota
  }

  return cardId;
}

// Add Multiple Cards to User Vault in Batch
export async function saveBatchToVault(uid: string, cards: (Omit<VaultCard, 'id'> & { id?: string })[]): Promise<string[]> {
  const savedIds: string[] = [];
  try {
    const batch = writeBatch(db);
    for (const card of cards) {
      const cardId = card.id || `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const cardRef = doc(db, 'users', uid, 'vault', cardId);
      const cardData: VaultCard = {
        ...card,
        id: cardId,
        scannedAt: card.scannedAt || new Date().toISOString(),
        lastPriceRefresh: card.lastPriceRefresh || new Date().toISOString()
      };
      batch.set(cardRef, cardData);
      savedIds.push(cardId);
    }
    await batch.commit();
  } catch (err) {
    console.warn('Batch write failed, performing individual writes or local backup:', err);
    for (const card of cards) {
      const id = await saveCardToVault(uid, card);
      if (!savedIds.includes(id)) savedIds.push(id);
    }
  }

  return savedIds;
}

// Delete Card from User Vault
export async function removeCardFromVault(uid: string, cardId: string): Promise<void> {
  try {
    const cardRef = doc(db, 'users', uid, 'vault', cardId);
    await deleteDoc(cardRef);
  } catch (err) {
    console.warn('Error deleting doc from Firestore:', err);
  }

  try {
    const localKey = `vca_vault_${uid}`;
    const existing: VaultCard[] = JSON.parse(localStorage.getItem(localKey) || '[]');
    const filtered = existing.filter(c => c.id !== cardId);
    localStorage.setItem(localKey, JSON.stringify(filtered));
  } catch (e) {
    // Ignore
  }
}

// Update Card Variant & recomputed prices in Vault
export async function updateVaultCard(uid: string, cardId: string, updates: Partial<VaultCard>): Promise<void> {
  try {
    const cardRef = doc(db, 'users', uid, 'vault', cardId);
    await setDoc(cardRef, updates, { merge: true });
  } catch (err) {
    console.warn('Error updating doc in Firestore:', err);
  }

  try {
    const localKey = `vca_vault_${uid}`;
    const existing: VaultCard[] = JSON.parse(localStorage.getItem(localKey) || '[]');
    const updated = existing.map(c => c.id === cardId ? { ...c, ...updates } : c);
    localStorage.setItem(localKey, JSON.stringify(updated));
  } catch (e) {
    // Ignore
  }
}
