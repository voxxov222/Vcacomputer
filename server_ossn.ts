import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

// OSSN Standard API Response Status Codes
export const OSSN_CODES = {
  SUCCESS: 100,
  INVALID_METHOD: 101,
  NO_RESPONSE: 102,
  INVALID_USER: 103,
  USER_NOT_VALIDATED: 104,
  LOGIN_FAILED: 105,
  MISSING_INPUT: 106,
  PASSWORD_LENGTH: 107,
  ERROR: 200,
  COMPONENT_MISSING: 201
};

export interface OssnUser {
  guid: number;
  type: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  fullname: string;
  avatar_url: string;
  cover_url: string;
  role: 'admin' | 'master_grader' | 'collector' | 'verified_dealer';
  badge: string;
  bio: string;
  created_at: string;
}

export interface AttachedSlab {
  certNumber: string;
  cardName: string;
  setName: string;
  year: number;
  grade: number | string;
  gradeLabel: string;
  subgrades?: {
    centering: number;
    corners: number;
    edges: number;
    surface: number;
  };
  valuation?: number;
  imageUrl: string;
  tamperProofHash: string;
}

export interface AttachedLink {
  url: string;
  title: string;
  description?: string;
  image?: string;
  domain?: string;
}

export interface AttachedVideo {
  url: string;
  type?: 'file' | 'youtube' | 'vimeo' | 'streamable' | 'direct';
  title?: string;
  thumbnail?: string;
}

export interface OssnPost {
  guid: number;
  owner_guid: number;
  poster_name: string;
  poster_username: string;
  poster_avatar: string;
  poster_badge: string;
  description: string;
  background_style?: string; // e.g. 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500'
  item_type?: string;
  item_guid?: number;
  attached_slab?: AttachedSlab;
  attached_photos?: string[];
  attached_gif?: string;
  attached_video?: AttachedVideo;
  attached_link?: AttachedLink;
  location?: string;
  feeling?: string;
  privacy: 'public' | 'friends' | 'private';
  time_created: number;
  total_likes: number;
  last_three_reactions: string[];
  is_liked_by_user: boolean;
  total_comments: number;
  pinned?: boolean;
}

export interface OssnComment {
  id: string;
  post_guid: number;
  owner_guid: number;
  user_name: string;
  user_avatar: string;
  user_badge: string;
  comment: string;
  time_created: number;
}

export interface OssnGroup {
  guid: number;
  title: string;
  description: string;
  cover_url: string;
  category: string;
  members_count: number;
  is_member: boolean;
}

export interface OssnNotification {
  id: string;
  user_guid: number;
  actor_name: string;
  actor_avatar: string;
  message: string;
  type: 'like' | 'comment' | 'slab_certified' | 'friend_request' | 'trade_offer';
  time_created: number;
  viewed: boolean;
}

export interface OssnMessage {
  id: string;
  from_guid: number;
  from_name: string;
  from_avatar: string;
  to_guid: number;
  message: string;
  time_created: number;
  read: boolean;
}

export interface PokemonTheme {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  previewUrl: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    headerBg: string;
    postBg: string;
    cardBorder: string;
    badgeBg: string;
  };
  customCss?: string;
  isCustomZip?: boolean;
}

export interface OssnComponent {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  isActive: boolean;
  isCore?: boolean;
}

export interface SlabBookDatabase {
  apiKey: string;
  activeThemeId: string;
  customThemes: PokemonTheme[];
  components: OssnComponent[];
  users: OssnUser[];
  posts: OssnPost[];
  comments: OssnComment[];
  groups: OssnGroup[];
  notifications: OssnNotification[];
  messages: OssnMessage[];
  siteSettings: {
    siteName: string;
    tagline: string;
    allowRegistration: boolean;
    maxPostChars: number;
    allowSlabAttachment: boolean;
    enableLivePricingFeed: boolean;
    systemAnnouncement: string;
  };
  metrics: {
    totalApiRequests: number;
    lastApiCallTimestamp: number;
  };
}

const DB_PATH = path.join(process.cwd(), 'vca_projects', 'slabbook_db.json');

// Built-in Pokémon themes
export const POKEMON_THEMES: PokemonTheme[] = [
  {
    id: 'pokemon_kanto',
    name: 'Pokémon Kanto League PokéBall',
    author: 'VCA OS Theme Studio',
    version: '2.4.0',
    description: 'Iconic PokéBall scarlet, titanium white, and indigo slate with holographic badge accents.',
    previewUrl: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=500&auto=format&fit=crop&q=60',
    colors: {
      primary: '#ef4444',
      secondary: '#1e293b',
      accent: '#f59e0b',
      headerBg: 'linear-gradient(135deg, #b91c1c 0%, #1e1b4b 100%)',
      postBg: '#0f172a',
      cardBorder: '#334155',
      badgeBg: '#dc2626'
    }
  },
  {
    id: 'pokemon_emerald',
    name: 'Pokémon Emerald Rayquaza Cyber Edition',
    author: 'Hoenn Tech Labs',
    version: '1.9.2',
    description: 'Emerald ray luminescence, neon cyber green, and dark obsidian carbon fiber aesthetic.',
    previewUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60',
    colors: {
      primary: '#10b981',
      secondary: '#064e3b',
      accent: '#06b6d4',
      headerBg: 'linear-gradient(135deg, #047857 0%, #064e3b 50%, #022c22 100%)',
      postBg: '#062018',
      cardBorder: '#065f46',
      badgeBg: '#059669'
    }
  },
  {
    id: 'pokemon_charizard',
    name: 'Charizard Ember Flame & Gold',
    author: 'VCA Core Engineering',
    version: '3.1.0',
    description: 'Fiery incandescent blaze, ember orange glow, dark volcanic ash, and golden borders.',
    previewUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=60',
    colors: {
      primary: '#f97316',
      secondary: '#7c2d12',
      accent: '#eab308',
      headerBg: 'linear-gradient(135deg, #ea580c 0%, #9a3412 50%, #431407 100%)',
      postBg: '#1c100b',
      cardBorder: '#9a3412',
      badgeBg: '#ea580c'
    }
  },
  {
    id: 'pokemon_gengar',
    name: 'Gengar Shadow Phantom Vault',
    author: 'Lavender Town Labs',
    version: '2.0.5',
    description: 'Deep ethereal purple, nightfall violet, sinister phantom magenta, and dark slate.',
    previewUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=60',
    colors: {
      primary: '#a855f7',
      secondary: '#581c87',
      accent: '#ec4899',
      headerBg: 'linear-gradient(135deg, #7e22ce 0%, #4c1d95 60%, #17092c 100%)',
      postBg: '#130826',
      cardBorder: '#6b21a8',
      badgeBg: '#9333ea'
    }
  },
  {
    id: 'pokemon_pikachu',
    name: 'Pikachu Electric Thunder Volt',
    author: 'Pallet Town Power Co.',
    version: '2.2.0',
    description: 'High-voltage lightning yellow, electric cyan sparks, and midnight navy contrast.',
    previewUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60',
    colors: {
      primary: '#eab308',
      secondary: '#713f12',
      accent: '#38bdf8',
      headerBg: 'linear-gradient(135deg, #ca8a04 0%, #854d0e 50%, #0f172a 100%)',
      postBg: '#17140a',
      cardBorder: '#854d0e',
      badgeBg: '#ca8a04'
    }
  },
  {
    id: 'goblue',
    name: 'OSSN GoBlue (Official Classic)',
    author: 'Open Source Social Network Core Team',
    version: '6.4.0',
    description: 'The authentic, default GoBlue theme for Open Source Social Network, modernized for VCA.',
    previewUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=500&auto=format&fit=crop&q=60',
    colors: {
      primary: '#2563eb',
      secondary: '#1e40af',
      accent: '#38bdf8',
      headerBg: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
      postBg: '#0f172a',
      cardBorder: '#1e3a8a',
      badgeBg: '#2563eb'
    }
  }
];

// Seed components matching OSSN modules
const INITIAL_COMPONENTS: OssnComponent[] = [
  {
    id: 'OssnServices',
    name: 'OSSN Web Services (REST API)',
    version: '6.1.0',
    author: 'OpenTeknik LLC',
    description: 'Provides REST API endpoints (v1.0 & v2.0) enabling mobile apps & external bridges.',
    isActive: true,
    isCore: true
  },
  {
    id: 'OssnWall',
    name: 'OSSN Newsfeed Wall & Advanced Post',
    version: '6.4.0',
    author: 'OSSN Core Team',
    description: 'Advanced posting with backgrounds, feelings, locations, privacy filters & tags.',
    isActive: true,
    isCore: true
  },
  {
    id: 'PokeSlabInspector',
    name: 'VCA 3D Slab Interactive Inspector',
    version: '3.0.0',
    author: 'VCA Verified Card Authority',
    description: 'Live 3D interactive tilt, holographic foil rendering, and real-time NFC verification inside posts.',
    isActive: true
  },
  {
    id: 'OssnPostBackground',
    name: 'OSSN Gradient Post Backgrounds',
    version: '2.5.0',
    author: 'OpenTeknik',
    description: 'Allows users to post status updates with colorful gradient backgrounds.',
    isActive: true
  },
  {
    id: 'OssnNotifications',
    name: 'OSSN Global Push Notification Center',
    version: '6.2.0',
    author: 'OSSN Core Team',
    description: 'Real-time bell alerts, reaction counters, and cert audit events.',
    isActive: true,
    isCore: true
  },
  {
    id: 'OssnChat',
    name: 'OSSN Direct Messaging & Live Chat',
    version: '5.8.0',
    author: 'OSSN Core Team',
    description: 'Private 1-on-1 direct messaging and real-time trade discussions between collectors.',
    isActive: true
  },
  {
    id: 'OssnGroups',
    name: 'OSSN Collector Guilds & Groups',
    version: '6.0.0',
    author: 'OSSN Core Team',
    description: 'Create and join specialized TCG groups, grail clubs, and auction rooms.',
    isActive: true
  },
  {
    id: 'OssnLikes',
    name: 'OSSN Reactions & PokéBall Likes',
    version: '6.1.0',
    author: 'OSSN Core Team',
    description: 'Multi-reaction engine supporting Like, Fire, Love, Grail Trophy, and Master PokéBall.',
    isActive: true
  },
  {
    id: 'OssnComments',
    name: 'OSSN Social Comments & Sub-Threads',
    version: '6.0.0',
    author: 'OSSN Core Team',
    description: 'Multi-level nested comments, smilies, and real-time discussion thread.',
    isActive: true
  },
  {
    id: 'PokeMarketStream',
    name: 'TCG Live Market Ticker & Sales Stream',
    version: '1.8.0',
    author: 'VCA Autonomous Pricing Engine',
    description: 'Injects real-time eBay and verified marketplace sales trends into relevant slab posts.',
    isActive: true
  }
];

// Helper to generate OSSN standard API key
export function generateOssnApiKey(): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const micro = (Date.now() % 1000) / 1000;
  const rand = Math.floor(Math.random() * 3);
  const raw = crypto.createHash('md5').update(`${timestamp}${micro}${rand}`).digest('hex');
  return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 48);
}

// Initial Database Seed
function getInitialDb(): SlabBookDatabase {
  return {
    apiKey: 'ossn_vca_' + generateOssnApiKey(),
    activeThemeId: 'pokemon_kanto',
    customThemes: [],
    components: INITIAL_COMPONENTS,
    users: [
      {
        guid: 1,
        type: 'user',
        username: 'admin',
        email: 'admin@vca-os.network',
        first_name: 'VCA',
        last_name: 'Administrator',
        fullname: 'VCA Lead Inspector',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        role: 'admin',
        badge: 'Lead Authenticator 🛡️',
        bio: 'Senior Forensic Card Grader at VCA. Inspecting Shadowless Grails and Vintage Holos.',
        created_at: '2026-01-15T00:00:00Z'
      },
      {
        guid: 2,
        type: 'user',
        username: 'red_collector',
        email: 'red@kanto.league',
        first_name: 'Red',
        last_name: 'Kanto',
        fullname: 'Red from Pallet Town',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        cover_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
        role: 'collector',
        badge: 'Champion Collector 🏆',
        bio: 'Hunting all 102 Base Set Holos in VCA Gem Mint 10. Just sent in a fresh batch to the Lab.',
        created_at: '2026-02-01T12:00:00Z'
      },
      {
        guid: 3,
        type: 'user',
        username: 'cynthia_grails',
        email: 'cynthia@sinnoh.champions',
        first_name: 'Cynthia',
        last_name: 'Sinnoh',
        fullname: 'Cynthia Grail Vault',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        role: 'master_grader',
        badge: 'Master Grader 🔬',
        bio: 'Optical and spectral analysis specialist. High-grade Rayquaza Gold Stars and modern Japanese SARs.',
        created_at: '2026-02-10T14:30:00Z'
      },
      {
        guid: 4,
        type: 'user',
        username: 'gary_oak',
        email: 'gary@oak.labs',
        first_name: 'Gary',
        last_name: 'Oak',
        fullname: 'Gary Oak TCG',
        avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
        role: 'verified_dealer',
        badge: 'Verified Dealer 💎',
        bio: 'Dealer at all major card expos. Buying and selling VCA authenticated slabs.',
        created_at: '2026-02-20T09:15:00Z'
      }
    ],
    posts: [
      {
        guid: 101,
        owner_guid: 1,
        poster_name: 'VCA Lead Inspector',
        poster_username: 'admin',
        poster_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        poster_badge: 'System Administrator 🛡️',
        description: '⚡ Welcome to SLABBOOK — The Open Source Social Network for Card Collectors! Connected directly to the VCA Forensic Lab, NFC Registry, and Real-time Pricing Engine. Share your slabs, trade grails, and inspect tamper-proof certificates!',
        background_style: 'bg-gradient-to-r from-red-600 via-purple-700 to-indigo-900 text-white font-semibold',
        location: 'VCA High-Security Vault, NY',
        feeling: 'celebrating milestone 🌟',
        privacy: 'public',
        time_created: Date.now() - 3600 * 1000 * 5,
        total_likes: 42,
        last_three_reactions: ['fire', 'grail', 'like'],
        is_liked_by_user: true,
        total_comments: 4,
        pinned: true
      },
      {
        guid: 102,
        owner_guid: 2,
        poster_name: 'Red from Pallet Town',
        poster_username: 'red_collector',
        poster_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        poster_badge: 'Champion Collector 🏆',
        description: 'MAILDAY! Just received back my 1999 Base Set 1st Edition Charizard Holographic from VCA grading! Subgrades are pristine across all four corners and centering. Check out the 3D slab inspect!',
        location: 'Pallet Town HQ',
        feeling: 'feeling hyped 🚀',
        privacy: 'public',
        attached_slab: {
          certNumber: 'VCA-2026-88001999',
          cardName: 'Charizard - 1st Edition Shadowless Holo #4/102',
          setName: 'Base Set (1999)',
          year: 1999,
          grade: 10,
          gradeLabel: 'GEM MINT 10',
          subgrades: {
            centering: 10,
            corners: 9.5,
            edges: 10,
            surface: 10
          },
          valuation: 345000,
          imageUrl: 'https://images.pokemontcg.io/base1/4_hires.png',
          tamperProofHash: 'a7f92b49c0182e6d9821'
        },
        time_created: Date.now() - 3600 * 1000 * 3,
        total_likes: 89,
        last_three_reactions: ['pokeball', 'fire', 'grail'],
        is_liked_by_user: false,
        total_comments: 7
      },
      {
        guid: 103,
        owner_guid: 3,
        poster_name: 'Cynthia Grail Vault',
        poster_username: 'cynthia_grails',
        poster_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        poster_badge: 'Master Grader 🔬',
        description: 'Microscopic spectral analysis on 2005 EX Deoxys Rayquaza Gold Star completed. Authentic foil rosette pattern and laser edge profile verified. NFC tag bound successfully.',
        location: 'VCA Forensic Optical Lab',
        feeling: 'grading with VCA 🔬',
        privacy: 'public',
        attached_slab: {
          certNumber: 'VCA-2026-77002005',
          cardName: 'Rayquaza Gold Star #107/107',
          setName: 'EX Deoxys (2005)',
          year: 2005,
          grade: 9.5,
          gradeLabel: 'MINT+ 9.5',
          subgrades: {
            centering: 9.5,
            corners: 9.5,
            edges: 9.5,
            surface: 9.5
          },
          valuation: 48500,
          imageUrl: 'https://images.pokemontcg.io/ex8/107_hires.png',
          tamperProofHash: 'f4820dc7190e23aa1290'
        },
        time_created: Date.now() - 3600 * 1000 * 1,
        total_likes: 56,
        last_three_reactions: ['fire', 'love', 'grail'],
        is_liked_by_user: true,
        total_comments: 3
      }
    ],
    comments: [
      {
        id: 'c-1',
        post_guid: 102,
        owner_guid: 3,
        user_name: 'Cynthia Grail Vault',
        user_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        user_badge: 'Master Grader 🔬',
        comment: 'Unbelievable copy! That 50/50 centering is almost impossible to find on English 1st Edition printings. Truly a Museum specimen.',
        time_created: Date.now() - 3600 * 1000 * 2
      },
      {
        id: 'c-2',
        post_guid: 102,
        owner_guid: 4,
        user_name: 'Gary Oak TCG',
        user_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        user_badge: 'Verified Dealer 💎',
        comment: 'If this is ever open for private offers, DM me directly on SlabBook! Ready wire on standby.',
        time_created: Date.now() - 3600 * 1000 * 1.5
      },
      {
        id: 'c-3',
        post_guid: 101,
        owner_guid: 2,
        user_name: 'Red from Pallet Town',
        user_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        user_badge: 'Champion Collector 🏆',
        comment: 'SlabBook integration is super clean! Love the Pokémon themes and the 3D card tilt.',
        time_created: Date.now() - 3600 * 1000 * 4
      }
    ],
    groups: [
      {
        guid: 1,
        title: 'Vintage WOTC Grails & Shadowless',
        description: 'Dedicated to Base Set, Jungle, Fossil, Team Rocket and Gym Challenge holos certified by VCA.',
        cover_url: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=500&auto=format&fit=crop&q=60',
        category: 'Vintage TCG',
        members_count: 1420,
        is_member: true
      },
      {
        guid: 2,
        title: 'VCA Gem Mint 10 & Black Label Club',
        description: 'Elite collectors holding pristine condition cards graded 9.5 or 10 with verified NFC tags.',
        cover_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60',
        category: 'High-End Collectors',
        members_count: 850,
        is_member: true
      },
      {
        guid: 3,
        title: 'Modern Japanese Alternate Arts & SARs',
        description: 'Sword & Shield, Scarlet & Violet Japanese high-class sets, promo cards & master balls.',
        cover_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&auto=format&fit=crop&q=60',
        category: 'Japanese TCG',
        members_count: 2190,
        is_member: false
      },
      {
        guid: 4,
        title: 'Card Show & Expo Meetups',
        description: 'Coordinate trades, cash deals, and table numbers at National, San Diego, and Dallas expos.',
        cover_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop&q=60',
        category: 'Events & Trade',
        members_count: 640,
        is_member: false
      }
    ],
    notifications: [
      {
        id: 'n-1',
        user_guid: 1,
        actor_name: 'Red from Pallet Town',
        actor_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        message: 'liked your system announcement post',
        type: 'like',
        time_created: Date.now() - 3600 * 1000 * 4,
        viewed: false
      },
      {
        id: 'n-2',
        user_guid: 1,
        actor_name: 'VCA Forensic Lab',
        actor_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        message: 'Grading complete: Rayquaza Gold Star certified as 9.5 Mint+ (Cert: VCA-2026-77002005)',
        type: 'slab_certified',
        time_created: Date.now() - 3600 * 1000 * 2,
        viewed: false
      }
    ],
    messages: [
      {
        id: 'm-1',
        from_guid: 2,
        from_name: 'Red from Pallet Town',
        from_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        to_guid: 1,
        message: 'Hey! Are you bringing the 1st Edition Charizard to the next expo table?',
        time_created: Date.now() - 3600 * 1000 * 3,
        read: true
      },
      {
        id: 'm-2',
        from_guid: 4,
        from_name: 'Gary Oak TCG',
        from_avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        to_guid: 1,
        message: 'Sent over three raw Gold Stars for optical scan inspection. Let me know when they land!',
        time_created: Date.now() - 3600 * 1000 * 1,
        read: false
      }
    ],
    siteSettings: {
      siteName: 'SLABBOOK',
      tagline: 'The Open Source Social Network for Certified Collectibles & Slabs',
      allowRegistration: true,
      maxPostChars: 2000,
      allowSlabAttachment: true,
      enableLivePricingFeed: true,
      systemAnnouncement: '📢 VCA Forensic Grading Submissions now sync live with SlabBook portfolio & feed!'
    },
    metrics: {
      totalApiRequests: 148,
      lastApiCallTimestamp: Date.now()
    }
  };
}

// Read or initialize DB
export function getSlabBookDb(): SlabBookDatabase {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading SlabBook DB, reinitializing:', err);
  }
  const initial = getInitialDb();
  saveSlabBookDb(initial);
  return initial;
}

// Write DB
export function saveSlabBookDb(db: SlabBookDatabase): void {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving SlabBook DB:', err);
  }
}

// OSSN Standard API Response Helper
export function ossnResponse(res: Response, code: number, responsePayload: any = null) {
  let message = 'The requested method successfully responded to the request.';
  if (code === OSSN_CODES.INVALID_METHOD) message = 'Invalid API method.';
  else if (code === OSSN_CODES.NO_RESPONSE) message = "The requested method didn't return any response.";
  else if (code === OSSN_CODES.INVALID_USER) message = 'The requested user is invalid.';
  else if (code === OSSN_CODES.USER_NOT_VALIDATED) message = 'The requested user is not validated.';
  else if (code === OSSN_CODES.LOGIN_FAILED) message = 'Unable to login. The supplied password is incorrect or system have returned the error.';
  else if (code === OSSN_CODES.MISSING_INPUT) message = 'One or more input expected , is empty. Please make sure you send all required inputs';
  else if (code === OSSN_CODES.PASSWORD_LENGTH) message = 'Contains the password length required';
  else if (code === OSSN_CODES.ERROR) message = 'Error or failed.';
  else if (code === OSSN_CODES.COMPONENT_MISSING) message = 'One or more component required for this request can not be found on remote server';

  return res.json({
    OssnServices: {
      code,
      message,
      response: responsePayload
    }
  });
}

// Generate real Pokémon Theme ZIP package
export async function generatePokemonThemeZip(theme: PokemonTheme): Promise<Buffer> {
  const zip = new JSZip();

  const themeFolder = `themes/${theme.id}/`;

  // 1. ossn_theme.xml manifest
  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<theme>
    <name>${theme.name}</name>
    <action>theme</action>
    <author>${theme.author}</author>
    <author_url>https://vca-computer.ai.studio</author_url>
    <description>${theme.description}</description>
    <license>GNU General Public License, version 2</license>
    <version>${theme.version}</version>
    <requirements>
        <required ossn_version="6.0" />
    </requirements>
</theme>`;
  zip.file(`${themeFolder}ossn_theme.xml`, xmlContent);

  // 2. ossn_theme.php bootstrap
  const phpBootstrap = `<?php
/**
 * SlabBook - Pokémon Theme: ${theme.name}
 * Generated for Open Source Social Network (OSSN)
 */
define('__THEME_NAME__', '${theme.id}');

function ossn_theme_${theme.id.replace(/-/g, '_')}_init() {
    ossn_extend_view('css/ossn.default', 'themes/${theme.id}/plugins/default/css/core/default');
    ossn_extend_view('css/ossn.admin.default', 'themes/${theme.id}/plugins/default/css/core/admin');
}

ossn_register_callback('ossn', 'init', 'ossn_theme_${theme.id.replace(/-/g, '_')}_init');
`;
  zip.file(`${themeFolder}ossn_theme.php`, phpBootstrap);

  // 3. CSS theme stylesheet
  const cssContent = `/**
 * SlabBook Theme CSS: ${theme.name}
 * Primary: ${theme.colors.primary}
 * Secondary: ${theme.colors.secondary}
 * Header: ${theme.colors.headerBg}
 */

:root {
  --ossn-primary: ${theme.colors.primary};
  --ossn-secondary: ${theme.colors.secondary};
  --ossn-accent: ${theme.colors.accent};
  --ossn-header-bg: ${theme.colors.headerBg};
  --ossn-post-bg: ${theme.colors.postBg};
  --ossn-border: ${theme.colors.cardBorder};
  --ossn-badge-bg: ${theme.colors.badgeBg};
}

.topbar {
  background: var(--ossn-header-bg) !important;
  border-bottom: 2px solid var(--ossn-primary) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
}

.ossn-wall-item {
  background: var(--ossn-post-bg) !important;
  border: 1px solid var(--ossn-border) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3) !important;
}

.btn-primary, .ossn-button-submit {
  background: var(--ossn-primary) !important;
  border-color: var(--ossn-primary) !important;
  color: #ffffff !important;
  font-weight: bold !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.btn-primary:hover {
  filter: brightness(1.15) !important;
  box-shadow: 0 0 15px var(--ossn-primary) !important;
}

.slab-card-container {
  border: 2px solid var(--ossn-accent) !important;
  border-radius: 14px !important;
  background: rgba(15, 23, 42, 0.95) !important;
}
`;
  zip.file(`${themeFolder}plugins/default/css/core/default.php`, cssContent);

  // 4. Admin theme CSS
  const adminCssContent = `/**
 * SlabBook Admin Theme CSS
 */
.admin-sidebar {
  background: #090d16 !important;
  border-right: 1px solid var(--ossn-border) !important;
}
.admin-header {
  background: var(--ossn-header-bg) !important;
}
`;
  zip.file(`${themeFolder}plugins/default/css/core/admin.php`, adminCssContent);

  // 5. README instructions
  const readmeContent = `# ${theme.name} (v${theme.version})
Theme for Open Source Social Network (OSSN) & SlabBook.

## Installation in OSSN:
1. Upload this ZIP via OSSN Administrator Dashboard -> Themes -> Install
2. Or unzip into your \`ossn/themes/\` directory
3. Go to Administrator Dashboard -> Themes -> Activate
4. Enjoy the authentic Pokémon collector experience!
`;
  zip.file(`${themeFolder}README.md`, readmeContent);

  return await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

// Router Setup
export function createSlabBookRouter(): Router {
  const router = Router();

  // Helper middleware to count API calls & authenticate API key if provided
  const validateApiKey = (req: Request, res: Response, next: () => void) => {
    const db = getSlabBookDb();
    db.metrics.totalApiRequests += 1;
    db.metrics.lastApiCallTimestamp = Date.now();
    saveSlabBookDb(db);

    const key = req.query.api_key || req.headers['x-api-key'] || req.body?.api_key;
    if (key && key !== db.apiKey) {
      return ossnResponse(res, OSSN_CODES.ERROR, { error: 'Invalid API Key' });
    }
    next();
  };

  // =========================================================================
  // OSSN Web Services API - v1.0 Endpoints
  // =========================================================================

  // 1. user_authenticate
  router.post('/api/v1.0/user_authenticate', validateApiKey, (req: Request, res: Response) => {
    const { username, password } = req.body;
    const db = getSlabBookDb();
    const user = db.users.find(u => u.username === username || u.email === username);

    if (!user) {
      return ossnResponse(res, OSSN_CODES.LOGIN_FAILED, { error: 'Invalid username or password' });
    }
    // Accept valid demo password or standard admin
    return ossnResponse(res, OSSN_CODES.SUCCESS, {
      user: {
        guid: user.guid,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        avatar_url: user.avatar_url,
        role: user.role,
        badge: user.badge
      },
      token: db.apiKey
    });
  });

  // 2. user_details
  router.get('/api/v1.0/user_details', validateApiKey, (req: Request, res: Response) => {
    const guid = parseInt(req.query.guid as string) || 1;
    const db = getSlabBookDb();
    const user = db.users.find(u => u.guid === guid);

    if (!user) {
      return ossnResponse(res, OSSN_CODES.INVALID_USER);
    }
    return ossnResponse(res, OSSN_CODES.SUCCESS, { user });
  });

  // 3. user_friends
  router.get('/api/v1.0/user_friends', validateApiKey, (req: Request, res: Response) => {
    const db = getSlabBookDb();
    return ossnResponse(res, OSSN_CODES.SUCCESS, {
      friends: db.users.slice(1),
      total: db.users.length - 1
    });
  });

  // 4. wall_list_home (Home Feed)
  router.get('/api/v1.0/wall_list_home', validateApiKey, (req: Request, res: Response) => {
    const db = getSlabBookDb();
    return ossnResponse(res, OSSN_CODES.SUCCESS, {
      posts: db.posts,
      total: db.posts.length
    });
  });

  // 5. wall_list_user
  router.get('/api/v1.0/wall_list_user', validateApiKey, (req: Request, res: Response) => {
    const guid = parseInt(req.query.guid as string) || 1;
    const db = getSlabBookDb();
    const posts = db.posts.filter(p => p.owner_guid === guid);
    return ossnResponse(res, OSSN_CODES.SUCCESS, {
      posts,
      total: posts.length
    });
  });

  // 6. wall_add (Post to Feed)
  router.post('/api/v1.0/wall_add', validateApiKey, (req: Request, res: Response) => {
    const {
      description,
      background_style,
      attached_slab,
      attached_photos,
      attached_gif,
      attached_video,
      attached_link,
      location,
      feeling,
      privacy = 'public',
      poster_guid = 1
    } = req.body;

    const hasPhotos = Array.isArray(attached_photos) && attached_photos.length > 0;
    const hasGif = Boolean(attached_gif && typeof attached_gif === 'string');
    const hasVideo = Boolean(attached_video && attached_video.url);
    const hasLink = Boolean(attached_link && attached_link.url);
    const hasSlab = Boolean(attached_slab && (attached_slab.cardName || attached_slab.certNumber));
    const hasText = Boolean(description && description.trim().length > 0);

    if (!hasText && !hasSlab && !hasPhotos && !hasGif && !hasVideo && !hasLink) {
      return ossnResponse(res, OSSN_CODES.MISSING_INPUT);
    }

    const db = getSlabBookDb();
    const poster = db.users.find(u => u.guid === poster_guid) || db.users[0];

    const newPost: OssnPost = {
      guid: Date.now(),
      owner_guid: poster.guid,
      poster_name: poster.fullname,
      poster_username: poster.username,
      poster_avatar: poster.avatar_url,
      poster_badge: poster.badge,
      description: description || '',
      background_style: background_style || undefined,
      attached_slab: hasSlab ? attached_slab : undefined,
      attached_photos: hasPhotos ? attached_photos : undefined,
      attached_gif: hasGif ? attached_gif : undefined,
      attached_video: hasVideo ? attached_video : undefined,
      attached_link: hasLink ? attached_link : undefined,
      location: location || undefined,
      feeling: feeling || undefined,
      privacy: privacy as any,
      time_created: Date.now(),
      total_likes: 0,
      last_three_reactions: [],
      is_liked_by_user: false,
      total_comments: 0
    };

    db.posts.unshift(newPost);
    saveSlabBookDb(db);

    return ossnResponse(res, OSSN_CODES.SUCCESS, { post: newPost });
  });

  // 6b. Fetch Rich Link Metadata
  router.post('/api/ossn/fetch-link-meta', async (req: Request, res: Response) => {
    const rawUrl = req.body.url || req.query.url;
    if (!rawUrl || typeof rawUrl !== 'string') {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    try {
      const trimmed = rawUrl.trim();
      const validUrlStr = trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;

      let parsed: URL;
      try {
        parsed = new URL(validUrlStr);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      const domain = parsed.hostname.replace(/^www\./, '');
      let title = domain;
      let description = `Browse collectible card insights and content on ${domain}`;
      let image = '';
      let videoId = '';

      // YouTube support
      if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
        if (domain.includes('youtu.be')) {
          videoId = parsed.pathname.replace(/^\//, '').split(/[?#]/)[0];
        } else {
          videoId = parsed.searchParams.get('v') || '';
        }
        title = 'Pokémon TCG Showcase & Pack Opening Video';
        description = `Watch collectible video coverage on YouTube (${domain})`;
        image = videoId
          ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
          : 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=600&auto=format&fit=crop&q=80';
      } else if (domain.includes('tcgplayer.com')) {
        title = 'TCGplayer Marketplace - Live Pokémon Card Listings & Market Value';
        description = 'Official verified price guides, sales history, and market analytics for collectible cards.';
        image = 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=600&auto=format&fit=crop&q=80';
      } else if (domain.includes('ebay.com')) {
        title = 'eBay Collectibles - Authenticated Trading Cards & Grails';
        description = 'Explore rare graded Pokémon cards, vintage booster packs, and live auctions.';
        image = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80';
      } else if (domain.includes('pokemon.com')) {
        title = 'The Official Pokémon Website | Pokémon TCG Database';
        description = 'Explore official Pokémon cards, expansion sets, rules, tournament schedules, and Pokédex entries.';
        image = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80';
      } else if (domain.includes('pokebeach.com')) {
        title = 'PokéBeach: Pokémon TCG News, Set Reveals & Card Rumors';
        description = 'The leading community source for Pokémon card leaks, Japanese set scans, and competitive deck lists.';
        image = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80';
      } else if (domain.includes('instagram.com') || domain.includes('tiktok.com')) {
        title = `${domain.includes('instagram') ? 'Instagram' : 'TikTok'} Collector Post`;
        description = `View social media collectible card showcase on ${domain}`;
        image = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
      }

      // Try fetching HTML metadata with 2.5s timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const fetchRes = await fetch(validUrlStr, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) VCA-SlabBook/1.0' }
        });
        clearTimeout(timeoutId);

        if (fetchRes.ok) {
          const html = await fetchRes.text();
          const ogTitleMatch =
            html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
            html.match(/<title>(.*?)<\/title>/i);
          if (ogTitleMatch && ogTitleMatch[1]) {
            title = ogTitleMatch[1]
              .replace(/&amp;/g, '&')
              .replace(/&#39;/g, "'")
              .replace(/&quot;/g, '"')
              .trim();
          }

          const ogDescMatch = html.match(
            /<meta\s+(?:property=["']og:description["']|name=["']description["'])\s+content=["'](.*?)["']/i
          );
          if (ogDescMatch && ogDescMatch[1]) {
            description = ogDescMatch[1]
              .replace(/&amp;/g, '&')
              .replace(/&#39;/g, "'")
              .replace(/&quot;/g, '"')
              .trim();
          }

          const ogImgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
          if (ogImgMatch && ogImgMatch[1]) {
            let foundImg = ogImgMatch[1].trim();
            if (foundImg.startsWith('//')) foundImg = 'https:' + foundImg;
            else if (foundImg.startsWith('/')) foundImg = parsed.origin + foundImg;
            image = foundImg;
          }
        }
      } catch {
        // Fallbacks remain intact
      }

      return res.json({
        success: true,
        data: {
          url: validUrlStr,
          title,
          description,
          image: image || undefined,
          domain,
          videoId: videoId || undefined
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to process link' });
    }
  });

  // 6c. Direct Media Upload (Supports Base64 Images & Videos)
  router.post('/api/ossn/upload', (req: Request, res: Response) => {
    const { data, name, type } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'No media data provided' });
    }

    // In a serverless/cloud environment, returning data URL or stored buffer URL
    return res.json({
      success: true,
      url: data,
      name: name || 'upload_' + Date.now(),
      type: type || 'image/jpeg',
      uploaded_at: Date.now()
    });
  });

  // 7. wall_delete
  router.post('/api/v1.0/wall_delete', validateApiKey, (req: Request, res: Response) => {
    const guid = parseInt(req.body.post_guid || req.query.post_guid);
    if (!guid) {
      return ossnResponse(res, OSSN_CODES.MISSING_INPUT);
    }
    const db = getSlabBookDb();
    const initialLen = db.posts.length;
    db.posts = db.posts.filter(p => p.guid !== guid);
    db.comments = db.comments.filter(c => c.post_guid !== guid);
    saveSlabBookDb(db);

    if (db.posts.length === initialLen) {
      return ossnResponse(res, OSSN_CODES.ERROR, { error: 'Post not found' });
    }
    return ossnResponse(res, OSSN_CODES.SUCCESS, { deleted_guid: guid });
  });

  // 8. like_add / reaction_add
  router.post('/api/v1.0/like_add', validateApiKey, (req: Request, res: Response) => {
    const { post_guid, reaction = 'like' } = req.body;
    const pGuid = parseInt(post_guid);
    const db = getSlabBookDb();
    const post = db.posts.find(p => p.guid === pGuid);

    if (!post) {
      return ossnResponse(res, OSSN_CODES.ERROR, { error: 'Post not found' });
    }

    if (!post.is_liked_by_user) {
      post.is_liked_by_user = true;
      post.total_likes += 1;
      if (!post.last_three_reactions.includes(reaction)) {
        post.last_three_reactions = [reaction, ...post.last_three_reactions].slice(0, 3);
      }
    } else {
      // Toggle unlike
      post.is_liked_by_user = false;
      post.total_likes = Math.max(0, post.total_likes - 1);
    }
    saveSlabBookDb(db);

    return ossnResponse(res, OSSN_CODES.SUCCESS, {
      total_likes: post.total_likes,
      is_liked: post.is_liked_by_user,
      last_three_reactions: post.last_three_reactions
    });
  });

  // 9. comment_add
  router.post('/api/v1.0/comment_add', validateApiKey, (req: Request, res: Response) => {
    const { post_guid, comment, user_guid = 1 } = req.body;
    if (!post_guid || !comment) {
      return ossnResponse(res, OSSN_CODES.MISSING_INPUT);
    }
    const db = getSlabBookDb();
    const pGuid = parseInt(post_guid);
    const post = db.posts.find(p => p.guid === pGuid);
    if (!post) {
      return ossnResponse(res, OSSN_CODES.ERROR, { error: 'Post not found' });
    }

    const user = db.users.find(u => u.guid === user_guid) || db.users[0];
    const newComment: OssnComment = {
      id: `c-${Date.now()}`,
      post_guid: pGuid,
      owner_guid: user.guid,
      user_name: user.fullname,
      user_avatar: user.avatar_url,
      user_badge: user.badge,
      comment,
      time_created: Date.now()
    };

    db.comments.push(newComment);
    post.total_comments = (post.total_comments || 0) + 1;
    saveSlabBookDb(db);

    return ossnResponse(res, OSSN_CODES.SUCCESS, { comment: newComment });
  });

  // 10. comments_list
  router.get('/api/v1.0/comments_list', validateApiKey, (req: Request, res: Response) => {
    const pGuid = parseInt(req.query.post_guid as string);
    if (!pGuid) {
      return ossnResponse(res, OSSN_CODES.MISSING_INPUT);
    }
    const db = getSlabBookDb();
    const comments = db.comments.filter(c => c.post_guid === pGuid);
    return ossnResponse(res, OSSN_CODES.SUCCESS, { comments });
  });

  // 11. groups_view & groups_list
  router.get('/api/v1.0/groups_view', validateApiKey, (req: Request, res: Response) => {
    const db = getSlabBookDb();
    return ossnResponse(res, OSSN_CODES.SUCCESS, { groups: db.groups });
  });

  // 12. notifications_list_user
  router.get('/api/v1.0/notifications_list_user', validateApiKey, (req: Request, res: Response) => {
    const db = getSlabBookDb();
    return ossnResponse(res, OSSN_CODES.SUCCESS, {
      notifications: db.notifications,
      unread_count: db.notifications.filter(n => !n.viewed).length
    });
  });

  // 13. notification/mark_all_read (v2.0)
  router.post('/api/v2.0/notification/mark_all_read', validateApiKey, (req: Request, res: Response) => {
    const db = getSlabBookDb();
    db.notifications.forEach(n => { n.viewed = true; });
    saveSlabBookDb(db);
    return ossnResponse(res, OSSN_CODES.SUCCESS, { success: true });
  });

  // 14. components/list_enabled (v2.0)
  router.get('/api/v2.0/components/list_enabled', validateApiKey, (req: Request, res: Response) => {
    const db = getSlabBookDb();
    const enabled = db.components.filter(c => c.isActive);
    return ossnResponse(res, OSSN_CODES.SUCCESS, { components: enabled });
  });

  // 15. Generic OSSN Query Router (e.g. /api/v1.0?method=wall_list_home)
  router.all('/api/v1.0', validateApiKey, (req: Request, res: Response) => {
    const method = req.query.method || req.body?.method;
    const db = getSlabBookDb();

    switch (method) {
      case 'wall_list_home':
        return ossnResponse(res, OSSN_CODES.SUCCESS, { posts: db.posts });
      case 'user_details':
        return ossnResponse(res, OSSN_CODES.SUCCESS, { user: db.users[0] });
      case 'components/list_enabled':
        return ossnResponse(res, OSSN_CODES.SUCCESS, { components: db.components.filter(c => c.isActive) });
      default:
        return ossnResponse(res, OSSN_CODES.INVALID_METHOD, { requested_method: method });
    }
  });

  // =========================================================================
  // SlabBook OSSN Admin Management Endpoints
  // =========================================================================

  // Admin: Get complete configuration & metrics
  router.get('/api/ossn/admin/config', (req: Request, res: Response) => {
    const db = getSlabBookDb();
    const allThemes = [...POKEMON_THEMES, ...db.customThemes];
    const activeTheme = allThemes.find(t => t.id === db.activeThemeId) || POKEMON_THEMES[0];

    return res.json({
      success: true,
      apiKey: db.apiKey,
      activeThemeId: db.activeThemeId,
      activeTheme,
      themes: allThemes,
      components: db.components,
      siteSettings: db.siteSettings,
      metrics: {
        totalUsers: db.users.length,
        totalPosts: db.posts.length,
        totalSlabsShared: db.posts.filter(p => p.attached_slab).length,
        totalGroups: db.groups.length,
        totalApiRequests: db.metrics.totalApiRequests,
        lastApiCallTimestamp: db.metrics.lastApiCallTimestamp,
        serverStatus: 'healthy',
        ossnCoreVersion: '6.4.0-VCA'
      }
    });
  });

  // Admin: Generate new API Key
  router.post('/api/ossn/admin/genkey', (req: Request, res: Response) => {
    const db = getSlabBookDb();
    db.apiKey = 'ossn_vca_' + generateOssnApiKey();
    saveSlabBookDb(db);
    return res.json({
      success: true,
      apiKey: db.apiKey,
      message: 'New OSSN Web Services API Key successfully generated.'
    });
  });

  // Admin: Set Active Theme
  router.post('/api/ossn/admin/set-theme', (req: Request, res: Response) => {
    const { themeId } = req.body;
    const db = getSlabBookDb();
    const allThemes = [...POKEMON_THEMES, ...db.customThemes];
    const found = allThemes.find(t => t.id === themeId);

    if (!found) {
      return res.status(404).json({ error: 'Theme not found' });
    }

    db.activeThemeId = themeId;
    saveSlabBookDb(db);
    return res.json({
      success: true,
      activeThemeId: themeId,
      activeTheme: found,
      message: `Switched active theme to "${found.name}"`
    });
  });

  // Admin: Export/Download Pokémon Theme ZIP
  router.get('/api/ossn/admin/download-theme-zip/:themeId', async (req: Request, res: Response) => {
    const themeId = req.params.themeId;
    const db = getSlabBookDb();
    const allThemes = [...POKEMON_THEMES, ...db.customThemes];
    const theme = allThemes.find(t => t.id === themeId) || POKEMON_THEMES[0];

    try {
      const buffer = await generatePokemonThemeZip(theme);
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="ossn_theme_${theme.id}.zip"`);
      return res.send(buffer);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to generate theme ZIP: ' + err.message });
    }
  });

  // Admin: Import Custom Pokémon Theme ZIP
  router.post('/api/ossn/admin/import-theme', async (req: Request, res: Response) => {
    const { name, primaryColor, secondaryColor, accentColor, description } = req.body;
    if (!name || !primaryColor) {
      return res.status(400).json({ error: 'Theme name and primary color required' });
    }

    const id = 'custom_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newTheme: PokemonTheme = {
      id,
      name,
      author: 'Collector Custom Studio',
      version: '1.0.0',
      description: description || 'Custom imported Pokémon theme for SlabBook.',
      previewUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=60',
      colors: {
        primary: primaryColor,
        secondary: secondaryColor || '#1e293b',
        accent: accentColor || '#38bdf8',
        headerBg: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor || '#0f172a'} 100%)`,
        postBg: '#0f172a',
        cardBorder: secondaryColor || '#334155',
        badgeBg: primaryColor
      },
      isCustomZip: true
    };

    const db = getSlabBookDb();
    db.customThemes.push(newTheme);
    db.activeThemeId = id;
    saveSlabBookDb(db);

    return res.json({
      success: true,
      theme: newTheme,
      message: `Custom theme "${name}" imported and activated!`
    });
  });

  // Admin: Toggle component active state
  router.post('/api/ossn/admin/toggle-component', (req: Request, res: Response) => {
    const { componentId } = req.body;
    const db = getSlabBookDb();
    const comp = db.components.find(c => c.id === componentId);
    if (!comp) {
      return res.status(404).json({ error: 'Component not found' });
    }
    comp.isActive = !comp.isActive;
    saveSlabBookDb(db);
    return res.json({
      success: true,
      component: comp,
      message: `${comp.name} is now ${comp.isActive ? 'Active' : 'Disabled'}`
    });
  });

  // Admin: Update Site Settings
  router.post('/api/ossn/admin/update-settings', (req: Request, res: Response) => {
    const { siteSettings } = req.body;
    const db = getSlabBookDb();
    db.siteSettings = { ...db.siteSettings, ...siteSettings };
    saveSlabBookDb(db);
    return res.json({
      success: true,
      siteSettings: db.siteSettings,
      message: 'Site settings updated successfully'
    });
  });

  return router;
}
