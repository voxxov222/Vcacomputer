export interface TCGdexCardMatch {
  id: string;
  name: string;
  set: string;
  number: string;
  rarity: string;
  image?: string;
  hp?: number;
  types?: string[];
  stage?: string;
  description?: string;
}

// In-memory cache to avoid repeated network calls
const cardCache = new Map<string, TCGdexCardMatch | null>();

/**
 * Searches TCGdex for a Pokemon card based on name, set, or ID using direct fast REST queries.
 */
export async function searchTCGDexCard(query: string, set?: string, number?: string): Promise<TCGdexCardMatch | null> {
  const cleanQuery = (query || '').trim();
  if (!cleanQuery || cleanQuery === 'Unknown Card' || cleanQuery === 'Exact card name as printed') {
    return null;
  }

  const cacheKey = `${cleanQuery.toLowerCase()}_${(set || '').toLowerCase()}_${(number || '').toLowerCase()}`;
  if (cardCache.has(cacheKey)) {
    return cardCache.get(cacheKey) || null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    // Direct TCGdex REST search by name
    const url = `https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(cleanQuery)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      cardCache.set(cacheKey, null);
      return null;
    }

    const cards = await res.json();
    if (!Array.isArray(cards) || cards.length === 0) {
      cardCache.set(cacheKey, null);
      return null;
    }

    // Filter best match based on number or set
    let best = cards[0];
    const cleanNum = (number || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    if (cleanNum) {
      const numMatch = cards.find((c: any) => {
        const cNum = String(c.localId || c.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return cNum.includes(cleanNum) || cleanNum.includes(cNum);
      });
      if (numMatch) best = numMatch;
    }

    if (set && !best) {
      const cleanSet = set.toLowerCase().replace(/[^a-z0-9]/g, '');
      const setMatch = cards.find((c: any) => {
        const setName = String(c.set?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return setName.includes(cleanSet) || cleanSet.includes(setName);
      });
      if (setMatch) best = setMatch;
    }

    // Fetch full card detail if available
    let fullCard = best;
    try {
      const detailCtrl = new AbortController();
      const detailTimeout = setTimeout(() => detailCtrl.abort(), 3500);
      const detailRes = await fetch(`https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(best.id)}`, {
        signal: detailCtrl.signal
      });
      clearTimeout(detailTimeout);
      if (detailRes.ok) {
        fullCard = await detailRes.json();
      }
    } catch {
      // Use summary card if detail times out
    }

    const match: TCGdexCardMatch = {
      id: fullCard.id || best.id,
      name: fullCard.name || best.name,
      set: fullCard.set?.name || best.set?.name || set || 'Pokémon TCG',
      number: fullCard.localId || best.localId || number || 'AR5',
      rarity: fullCard.rarity || 'Rare Holo',
      image: fullCard.image ? `${fullCard.image}/high.png` : (best.image ? `${best.image}/high.png` : undefined),
      hp: fullCard.hp ? parseInt(String(fullCard.hp), 10) : undefined,
      types: fullCard.types,
      stage: fullCard.stage
    };

    cardCache.set(cacheKey, match);
    return match;
  } catch (error) {
    console.warn("TCGdex fast search warning:", error);
    cardCache.set(cacheKey, null);
    return null;
  }
}
