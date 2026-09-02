import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

export interface MemoryEntry {
  id: string;
  category: 'episodic' | 'semantic' | 'procedure' | 'preference' | 'entity' | 'pokemon_insight';
  key: string;
  content: string;
  importance: number; // 1 to 10
  tags: string[];
  createdAt: string;
  updatedAt: string;
  accessCount: number;
  lastAccessedAt: string;
  metadata?: Record<string, any>;
}

export interface AgentMemoryStore {
  version: string;
  lastUpdated: string;
  totalMemories: number;
  memories: MemoryEntry[];
}

const MEMORY_FILE_PATH = path.join(process.cwd(), 'data', 'agent_memory.json');

// Default foundational knowledge memories
const DEFAULT_MEMORIES: MemoryEntry[] = [
  {
    id: 'mem-core-identity',
    category: 'semantic',
    key: 'agent_identity',
    content: 'VCA Autonomous Voice Agent & Autonomous Systems Engineer. Full terminal execution, dynamic tool creation, repo installation, live Pokémon pricing intelligence, and self-improving code synthesis capabilities.',
    importance: 10,
    tags: ['system', 'identity', 'vca', 'architecture'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 1,
    lastAccessedAt: new Date().toISOString()
  },
  {
    id: 'mem-pokemon-pricing-engine',
    category: 'procedure',
    key: 'pokemon_price_sync_procedure',
    content: 'To update Pokémon card market prices, call sync_pokemon_market_prices. It queries real market valuation algorithms across PSA 10, PSA 9, PSA 8, and Raw conditions with volatility and volume metrics.',
    importance: 9,
    tags: ['pokemon', 'pricing', 'procedure', 'tcg'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 1,
    lastAccessedAt: new Date().toISOString()
  },
  {
    id: 'mem-tool-authoring',
    category: 'procedure',
    key: 'dynamic_tool_creation_rule',
    content: 'The agent can author new tools from scratch via create_custom_tool. Tools are saved to agent_tools/, validated for syntax, compiled in-memory, and immediately registered into the live Gemini function call registry.',
    importance: 9,
    tags: ['tools', 'developer', 'gemini', 'code'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 1,
    lastAccessedAt: new Date().toISOString()
  },
  {
    id: 'mem-vca-standards',
    category: 'semantic',
    key: 'vca_grading_standards',
    content: 'VCA forensic grading inspects 4 core subgrades: Centering, Corners, Edges, and Surface. Grades range from 1 to 10 (Pristine 10, Gem Mint 10, Mint 9). Counterfeit detection looks for dot patterns, rosette registration, foil texture, and cardstock core.',
    importance: 9,
    tags: ['vca', 'grading', 'authenticity', 'forensics'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 1,
    lastAccessedAt: new Date().toISOString()
  }
];

export async function ensureMemoryFile(): Promise<AgentMemoryStore> {
  try {
    const dir = path.dirname(MEMORY_FILE_PATH);
    if (!fs.existsSync(dir)) {
      await fsp.mkdir(dir, { recursive: true });
    }
    if (!fs.existsSync(MEMORY_FILE_PATH)) {
      const initial: AgentMemoryStore = {
        version: '2.0.0',
        lastUpdated: new Date().toISOString(),
        totalMemories: DEFAULT_MEMORIES.length,
        memories: DEFAULT_MEMORIES
      };
      await fsp.writeFile(MEMORY_FILE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = await fsp.readFile(MEMORY_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as AgentMemoryStore;
    return parsed;
  } catch (err) {
    console.warn('Memory store fallback:', err);
    return {
      version: '2.0.0',
      lastUpdated: new Date().toISOString(),
      totalMemories: DEFAULT_MEMORIES.length,
      memories: DEFAULT_MEMORIES
    };
  }
}

export async function saveMemoryStore(store: AgentMemoryStore): Promise<void> {
  try {
    const dir = path.dirname(MEMORY_FILE_PATH);
    if (!fs.existsSync(dir)) {
      await fsp.mkdir(dir, { recursive: true });
    }
    store.lastUpdated = new Date().toISOString();
    store.totalMemories = store.memories.length;
    await fsp.writeFile(MEMORY_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save memory store:', err);
  }
}

export async function storeMemory(entry: {
  category: MemoryEntry['category'];
  key: string;
  content: string;
  importance?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}): Promise<MemoryEntry> {
  const store = await ensureMemoryFile();
  const existingIndex = store.memories.findIndex(
    (m) => m.key.toLowerCase() === entry.key.toLowerCase() || (m.metadata?.id && m.metadata.id === entry.metadata?.id)
  );

  const now = new Date().toISOString();
  if (existingIndex >= 0) {
    const existing = store.memories[existingIndex];
    const updated: MemoryEntry = {
      ...existing,
      category: entry.category || existing.category,
      content: entry.content,
      importance: entry.importance ?? existing.importance,
      tags: Array.from(new Set([...(existing.tags || []), ...(entry.tags || [])])),
      updatedAt: now,
      accessCount: existing.accessCount + 1,
      lastAccessedAt: now,
      metadata: { ...existing.metadata, ...entry.metadata }
    };
    store.memories[existingIndex] = updated;
    await saveMemoryStore(store);
    return updated;
  }

  const newEntry: MemoryEntry = {
    id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    category: entry.category,
    key: entry.key,
    content: entry.content,
    importance: entry.importance ?? 5,
    tags: entry.tags || ['general'],
    createdAt: now,
    updatedAt: now,
    accessCount: 1,
    lastAccessedAt: now,
    metadata: entry.metadata
  };

  store.memories.unshift(newEntry);
  await saveMemoryStore(store);
  return newEntry;
}

export async function recallMemories(query: string, category?: string, limit: number = 6): Promise<{
  memories: MemoryEntry[];
  totalMatches: number;
  query: string;
}> {
  const store = await ensureMemoryFile();
  const qTokens = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

  const scored = store.memories
    .filter((m) => {
      if (category && category !== 'all' && m.category !== category) return false;
      return true;
    })
    .map((m) => {
      let score = 0;
      const textToSearch = `${m.key} ${m.content} ${m.tags.join(' ')} ${m.category}`.toLowerCase();

      // Exact substring match
      if (textToSearch.includes(query.toLowerCase())) {
        score += 15;
      }

      // Token matching
      for (const tok of qTokens) {
        if (textToSearch.includes(tok)) {
          score += 4;
        }
      }

      // Boost by importance
      score += (m.importance || 5) * 0.5;

      return { memory: m, score };
    })
    .filter((item) => qTokens.length === 0 || item.score > 2)
    .sort((a, b) => b.score - a.score);

  const topResults = scored.slice(0, limit).map((s) => {
    // Update access count
    s.memory.accessCount = (s.memory.accessCount || 0) + 1;
    s.memory.lastAccessedAt = new Date().toISOString();
    return s.memory;
  });

  // Save access updates
  await saveMemoryStore(store);

  return {
    memories: topResults,
    totalMatches: scored.length,
    query
  };
}

export async function getAllMemories(): Promise<MemoryEntry[]> {
  const store = await ensureMemoryFile();
  return store.memories;
}

export async function deleteMemoryById(id: string): Promise<boolean> {
  const store = await ensureMemoryFile();
  const initialCount = store.memories.length;
  store.memories = store.memories.filter((m) => m.id !== id);
  if (store.memories.length !== initialCount) {
    await saveMemoryStore(store);
    return true;
  }
  return false;
}
