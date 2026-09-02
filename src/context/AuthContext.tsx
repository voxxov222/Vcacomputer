import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  onAuth, 
  signInWithGoogle, 
  signInAsGuest, 
  loginWithEmail, 
  registerWithEmail, 
  logout as fbLogout,
  VaultCard,
  subscribeToVault,
  saveCardToVault,
  saveBatchToVault,
  removeCardFromVault,
  updateVaultCard
} from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  vaultCards: VaultCard[];
  vault: VaultCard[];
  vaultLoading: boolean;
  authInitialized: boolean;
  isOnline: boolean;
  signInGoogle: () => Promise<User>;
  signInGuest: () => Promise<User>;
  loginEmail: (email: string, pass: string) => Promise<User>;
  registerEmail: (email: string, pass: string, name?: string) => Promise<User>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  addCard: (card: Omit<VaultCard, 'id'> & { id?: string }) => Promise<string>;
  addBatch: (cards: (Omit<VaultCard, 'id'> & { id?: string })[]) => Promise<string[]>;
  removeCard: (cardId: string) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<VaultCard>) => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial sample cards for new collectors or offline visitors
const INITIAL_DEMO_VAULT: VaultCard[] = [
  {
    id: 'charizard_base_holo',
    name: 'Charizard',
    set: 'Base Set',
    setSymbol: 'BS',
    cardNumber: '4/102',
    language: 'EN',
    variant: 'Holo',
    rawValue: 340.0,
    psa10Value: 9850.0,
    psa9Value: 1250.0,
    psa8Value: 580.0,
    bgs95Value: 3400.0,
    cgc10Value: 7200.0,
    imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
    scannedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    lastPriceRefresh: new Date().toISOString(),
    confidence: 0.99,
    rarity: 'Rare Holo',
    ebayComps: [
      { price: 355.0, date: '2026-08-30', title: '1999 Pokemon Base Set Charizard #4/102 Holo NM', url: 'https://www.ebay.com' },
      { price: 330.0, date: '2026-08-28', title: 'Charizard Holo Base Set 4/102 Light Play', url: 'https://www.ebay.com' },
      { price: 9900.0, date: '2026-08-25', title: '1999 Pokemon Base Set 4 Charizard Holo PSA 10 GEM MINT', url: 'https://www.ebay.com' },
      { price: 1225.0, date: '2026-08-20', title: 'Charizard 4/102 Base Set Holo PSA 9 Mint Certified', url: 'https://www.ebay.com' },
      { price: 360.0, date: '2026-08-18', title: 'Raw Vintage Base Set Charizard 4/102 Crisp Hologram', url: 'https://www.ebay.com' }
    ]
  },
  {
    id: 'umbreon_vmax_alt',
    name: 'Umbreon VMAX',
    set: 'Evolving Skies',
    setSymbol: 'EVS',
    cardNumber: '215/203',
    language: 'EN',
    variant: 'Alt Art',
    rawValue: 850.0,
    psa10Value: 1650.0,
    psa9Value: 880.0,
    psa8Value: 740.0,
    bgs95Value: 1200.0,
    cgc10Value: 1550.0,
    imageUrl: 'https://images.pokemontcg.io/swsh7/215_hires.png',
    scannedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    lastPriceRefresh: new Date().toISOString(),
    confidence: 0.98,
    rarity: 'Secret Rare',
    ebayComps: [
      { price: 860.0, date: '2026-08-31', title: 'Pokemon Umbreon VMAX 215/203 Evolving Skies Alt Art Moonbreon NM', url: 'https://www.ebay.com' },
      { price: 1680.0, date: '2026-08-29', title: 'Umbreon VMAX Alt Art #215 PSA 10 Gem Mint Moonbreon', url: 'https://www.ebay.com' },
      { price: 840.0, date: '2026-08-27', title: 'Moonbreon Evolving Skies 215/203 Raw Near Mint Pack Fresh', url: 'https://www.ebay.com' },
      { price: 1620.0, date: '2026-08-22', title: 'PSA 10 Umbreon VMAX Secret Rare Alternate Art Moonbreon', url: 'https://www.ebay.com' },
      { price: 890.0, date: '2026-08-19', title: 'Umbreon VMAX 215/203 Alternate Art Secret Rare Evolving Skies', url: 'https://www.ebay.com' }
    ]
  },
  {
    id: 'pikachu_van_gogh',
    name: 'Pikachu with Grey Felt Hat',
    set: 'SVP Black Star Promos',
    setSymbol: 'SVP',
    cardNumber: '085',
    language: 'EN',
    variant: 'Promo',
    rawValue: 195.0,
    psa10Value: 520.0,
    psa9Value: 210.0,
    psa8Value: 170.0,
    bgs95Value: 320.0,
    cgc10Value: 480.0,
    imageUrl: 'https://images.pokemontcg.io/smp/SM85_hires.png',
    scannedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    lastPriceRefresh: new Date().toISOString(),
    confidence: 0.99,
    rarity: 'Promo',
    ebayComps: [
      { price: 195.0, date: '2026-08-31', title: 'Pikachu Grey Felt Hat Van Gogh Museum Promo Sealed 085', url: 'https://www.ebay.com' },
      { price: 530.0, date: '2026-08-28', title: 'Pikachu with Grey Felt Hat #085 PSA 10 Van Gogh Promo', url: 'https://www.ebay.com' },
      { price: 200.0, date: '2026-08-26', title: 'Van Gogh Pikachu Promo Card Sealed Mint condition', url: 'https://www.ebay.com' },
      { price: 515.0, date: '2026-08-21', title: 'PSA 10 GEM MINT Pikachu Van Gogh Felt Hat SVP 085', url: 'https://www.ebay.com' }
    ]
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [vaultCards, setVaultCards] = useState<VaultCard[]>([]);
  const [vaultLoading, setVaultLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuth(async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // Auto sign-in as guest if no user is signed in to guarantee instant persistent experience
      if (!currentUser) {
        try {
          await signInAsGuest();
        } catch (err) {
          // If network error, load local storage
          const cached = localStorage.getItem('vca_local_vault');
          if (cached) {
            setVaultCards(JSON.parse(cached));
          } else {
            setVaultCards(INITIAL_DEMO_VAULT);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore vault updates when user is authenticated
  useEffect(() => {
    if (!user) {
      const cached = localStorage.getItem('vca_local_vault');
      setVaultCards(cached ? JSON.parse(cached) : INITIAL_DEMO_VAULT);
      return;
    }

    setVaultLoading(true);
    const unsubscribe = subscribeToVault(
      user.uid,
      (cards) => {
        if (cards.length === 0) {
          // First time user: seed with initial demonstration cards if brand new
          const localStored = localStorage.getItem(`vca_vault_${user.uid}`);
          if (localStored) {
            setVaultCards(JSON.parse(localStored));
          } else {
            // Seed initial cards to user's personal vault
            saveBatchToVault(user.uid, INITIAL_DEMO_VAULT);
            setVaultCards(INITIAL_DEMO_VAULT);
          }
        } else {
          setVaultCards(cards);
          localStorage.setItem(`vca_vault_${user.uid}`, JSON.stringify(cards));
        }
        setVaultLoading(false);
      },
      () => {
        // Offline fallback
        const localStored = localStorage.getItem(`vca_vault_${user.uid}`);
        if (localStored) {
          setVaultCards(JSON.parse(localStored));
        } else {
          setVaultCards(INITIAL_DEMO_VAULT);
        }
        setVaultLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const signInGoogle = async () => {
    const u = await signInWithGoogle();
    setUser(u);
    setIsAuthModalOpen(false);
    return u;
  };

  const signInGuest = async () => {
    const u = await signInAsGuest();
    setUser(u);
    setIsAuthModalOpen(false);
    return u;
  };

  const loginEmail = async (email: string, pass: string) => {
    const u = await loginWithEmail(email, pass);
    setUser(u);
    setIsAuthModalOpen(false);
    return u;
  };

  const registerEmail = async (email: string, pass: string, name?: string) => {
    const u = await registerWithEmail(email, pass, name);
    setUser(u);
    setIsAuthModalOpen(false);
    return u;
  };

  const signOut = async () => {
    await fbLogout();
    setUser(null);
    setVaultCards([]);
  };

  const addCard = async (card: Omit<VaultCard, 'id'> & { id?: string }) => {
    const currentUid = user?.uid || 'guest_user';
    const cardId = await saveCardToVault(currentUid, card);
    // Optimistic UI update
    setVaultCards(prev => {
      const newCard: VaultCard = {
        ...card,
        id: cardId,
        scannedAt: card.scannedAt || new Date().toISOString(),
        lastPriceRefresh: card.lastPriceRefresh || new Date().toISOString()
      };
      const filtered = prev.filter(c => c.id !== cardId);
      const updated = [newCard, ...filtered];
      localStorage.setItem(`vca_vault_${currentUid}`, JSON.stringify(updated));
      return updated;
    });
    return cardId;
  };

  const addBatch = async (cards: (Omit<VaultCard, 'id'> & { id?: string })[]) => {
    const currentUid = user?.uid || 'guest_user';
    const savedIds = await saveBatchToVault(currentUid, cards);
    // Optimistic UI update
    setVaultCards(prev => {
      const newCards: VaultCard[] = cards.map((c, i) => ({
        ...c,
        id: savedIds[i] || `card_${Date.now()}_${i}`,
        scannedAt: c.scannedAt || new Date().toISOString(),
        lastPriceRefresh: c.lastPriceRefresh || new Date().toISOString()
      }));
      const updated = [...newCards, ...prev];
      localStorage.setItem(`vca_vault_${currentUid}`, JSON.stringify(updated));
      return updated;
    });
    return savedIds;
  };

  const removeCard = async (cardId: string) => {
    const currentUid = user?.uid || 'guest_user';
    await removeCardFromVault(currentUid, cardId);
    setVaultCards(prev => {
      const updated = prev.filter(c => c.id !== cardId);
      localStorage.setItem(`vca_vault_${currentUid}`, JSON.stringify(updated));
      return updated;
    });
  };

  const updateCard = async (cardId: string, updates: Partial<VaultCard>) => {
    const currentUid = user?.uid || 'guest_user';
    await updateVaultCard(currentUid, cardId, updates);
    setVaultCards(prev => {
      const updated = prev.map(c => c.id === cardId ? { ...c, ...updates } : c);
      localStorage.setItem(`vca_vault_${currentUid}`, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        vaultCards,
        vault: vaultCards,
        vaultLoading,
        authInitialized: !loading,
        isOnline: true,
        signInGoogle,
        signInGuest,
        loginEmail,
        registerEmail,
        signOut,
        logout: signOut,
        addCard,
        addBatch,
        removeCard,
        updateCard,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
