import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'https://api.pokemontcg.io/v2';

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'VCA-Computer-MCP-Client/1.0',
  };
  const apiKey = process.env.POKEMONTCG_API_KEY;
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }
  return headers;
}

export interface CardSearchOptions {
  name?: string;
  set_name?: string;
  types?: string;
  rarity?: string;
  subtype?: string;
  supertype?: string;
  page?: number;
  limit?: number;
}

export interface SetSearchOptions {
  name?: string;
  page?: number;
  limit?: number;
}

/**
 * Searches Pokémon cards by various criteria
 */
export async function searchCards(options: CardSearchOptions = {}) {
  const { name, set_name, types, rarity, subtype, supertype, page = 1, limit = 20 } = options;
  const queries: string[] = [];

  if (name) queries.push(`name:"*${name.trim()}*"`);
  if (set_name) queries.push(`set.name:"*${set_name.trim()}*"`);
  if (types) queries.push(`types:"${types.trim()}"`);
  if (rarity) queries.push(`rarity:"${rarity.trim()}"`);
  if (subtype) queries.push(`subtypes:"${subtype.trim()}"`);
  if (supertype) queries.push(`supertype:"${supertype.trim()}"`);

  const queryParams = new URLSearchParams({
    page: String(page),
    pageSize: String(Math.min(limit, 250)),
  });

  if (queries.length > 0) {
    queryParams.set('q', queries.join(' '));
  }

  const url = `${BASE_URL}/cards?${queryParams.toString()}`;
  try {
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) {
      throw new Error(`Pokemon TCG API Error ${res.status}: ${res.statusText}`);
    }
    const json = await res.json();
    return {
      count: json.count,
      page: json.page,
      pageSize: json.pageSize,
      totalCount: json.totalCount,
      cards: (json.data || []).map(formatCardSummary),
    };
  } catch (err: any) {
    console.warn(`[pokemonTcgApi] searchCards error:`, err.message);
    throw err;
  }
}

/**
 * Get card by ID (e.g., 'base1-4' for Charizard)
 */
export async function getCardById(id: string) {
  const url = `${BASE_URL}/cards/${encodeURIComponent(id)}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) {
    throw new Error(`Card '${id}' not found (${res.status} ${res.statusText})`);
  }
  const json = await res.json();
  return json.data;
}

/**
 * Get real-time TCGPlayer and Cardmarket prices for a card
 */
export async function getCardPrice(name: string, setName?: string) {
  const searchResult = await searchCards({ name, set_name: setName, limit: 10 });
  if (!searchResult.cards || searchResult.cards.length === 0) {
    return {
      found: false,
      message: `No pricing found for "${name}"${setName ? ` in set "${setName}"` : ''}`,
      pricing: null,
    };
  }

  // Get full card details for the top match to extract detailed pricing
  const topCardSummary = searchResult.cards[0];
  const fullCard = await getCardById(topCardSummary.id);

  return {
    found: true,
    cardId: fullCard.id,
    name: fullCard.name,
    setName: fullCard.set?.name,
    number: fullCard.number,
    rarity: fullCard.rarity,
    images: fullCard.images,
    tcgplayer: fullCard.tcgplayer || null,
    cardmarket: fullCard.cardmarket || null,
    marketPrices: extractNormalizedPrices(fullCard),
  };
}

/**
 * Search expansion sets
 */
export async function searchSets(options: SetSearchOptions = {}) {
  const { name, page = 1, limit = 20 } = options;
  const queryParams = new URLSearchParams({
    page: String(page),
    pageSize: String(Math.min(limit, 100)),
  });

  if (name) {
    queryParams.set('q', `name:"*${name.trim()}*"`);
  }

  const url = `${BASE_URL}/sets?${queryParams.toString()}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) {
    throw new Error(`Sets query error ${res.status}: ${res.statusText}`);
  }
  const json = await res.json();
  return {
    count: json.count,
    page: json.page,
    pageSize: json.pageSize,
    totalCount: json.totalCount,
    sets: (json.data || []).map((set: any) => ({
      id: set.id,
      name: set.name,
      series: set.series,
      printedTotal: set.printedTotal,
      total: set.total,
      releaseDate: set.releaseDate,
      symbolUrl: set.images?.symbol,
      logoUrl: set.images?.logo,
    })),
  };
}

/**
 * Get set by ID (e.g., 'base1')
 */
export async function getSetById(id: string) {
  const url = `${BASE_URL}/sets/${encodeURIComponent(id)}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) {
    throw new Error(`Set '${id}' not found (${res.status} ${res.statusText})`);
  }
  const json = await res.json();
  return json.data;
}

const FALLBACK_TYPES = [
  'Colorless', 'Darkness', 'Dragon', 'Fairy', 'Fighting', 'Fire',
  'Grass', 'Lightning', 'Metal', 'Psychic', 'Water'
];

const FALLBACK_SUPERTYPES = ['Energy', 'Pokémon', 'Trainer'];

const FALLBACK_SUBTYPES = [
  'ACE SPEC', 'Ancient', 'Baby', 'Basic', 'BREAK', 'EX', 'Future',
  'GX', 'Item', 'LEGEND', 'Level-Up', 'MEGA', 'Pokémon Tool', 'Radiant',
  'Rapid Strike', 'Restored', 'Single Strike', 'Special', 'Stadium',
  'Stage 1', 'Stage 2', 'Supporter', 'TAG TEAM', 'Technical Machine',
  'Tera', 'Ultra Beast', 'V', 'V-UNION', 'VMAX', 'VSTAR'
];

const FALLBACK_RARITIES = [
  'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Holo EX',
  'Rare Holo GX', 'Rare Holo V', 'Rare Holo VMAX', 'Rare Holo VSTAR',
  'Rare Secret', 'Rare Ultra', 'Illustration Rare',
  'Special Illustration Rare', 'Hyper Rare', 'Promo'
];

/**
 * Get available card types
 */
export async function getTypes(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/types`, { headers: getHeaders() });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) return json.data;
    }
  } catch (err) {
    // Upstream 5xx or offline, use fallback
  }
  return FALLBACK_TYPES;
}

/**
 * Get available supertypes
 */
export async function getSupertypes(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/supertypes`, { headers: getHeaders() });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) return json.data;
    }
  } catch (err) {
    // Upstream 5xx or offline
  }
  return FALLBACK_SUPERTYPES;
}

/**
 * Get available subtypes
 */
export async function getSubtypes(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/subtypes`, { headers: getHeaders() });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) return json.data;
    }
  } catch (err) {
    // Upstream 5xx or offline
  }
  return FALLBACK_SUBTYPES;
}

/**
 * Get available rarities
 */
export async function getRarities(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/rarities`, { headers: getHeaders() });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) return json.data;
    }
  } catch (err) {
    // Upstream 5xx or offline
  }
  return FALLBACK_RARITIES;
}

function formatCardSummary(card: any) {
  return {
    id: card.id,
    name: card.name,
    supertype: card.supertype,
    subtypes: card.subtypes || [],
    hp: card.hp,
    types: card.types || [],
    setName: card.set?.name,
    setId: card.set?.id,
    number: card.number,
    rarity: card.rarity,
    imageUrl: card.images?.small || card.images?.large,
    prices: extractNormalizedPrices(card),
  };
}

function extractNormalizedPrices(card: any) {
  const tp = card.tcgplayer?.prices;
  if (!tp) return null;
  const result: Record<string, any> = {};
  for (const variant of Object.keys(tp)) {
    result[variant] = {
      market: tp[variant]?.market ?? null,
      low: tp[variant]?.low ?? null,
      mid: tp[variant]?.mid ?? null,
      high: tp[variant]?.high ?? null,
      directLow: tp[variant]?.directLow ?? null,
    };
  }
  return result;
}
