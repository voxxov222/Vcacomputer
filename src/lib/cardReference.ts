export interface CardPricingData {
  raw: {
    market: number;
    recentSold: number;
    low: number;
    high: number;
    volume: number;
    updated: string;
  };
  psa10: {
    market: number;
    recentSold: number;
    volume: number;
    popCount?: number;
  };
  psa9: {
    market: number;
    recentSold: number;
    volume: number;
    popCount?: number;
  };
  psa8: {
    market: number;
    recentSold: number;
    volume: number;
    popCount?: number;
  };
  bgs95?: number;
  cgc10?: number;
  sources: {
    name: string;
    price: number;
    condition: string;
    updated: string;
    url?: string;
  }[];
  priceHistory: {
    date: string;
    rawPrice: number;
    psa10Price: number;
    psa9Price: number;
    volume: number;
  }[];
  variants: {
    name: string;
    type: string;
    rawPrice: number;
    psa10Price: number;
    selected?: boolean;
    description: string;
  }[];
}

export interface ReferenceCard {
  card_id: string;
  name: string;
  set_name: string;
  set_id: string;
  collector_number: string;
  rarity: string;
  language: string;
  release_date: string;
  image_url: string;
  back_image_url?: string;
  variant: string;
  all_variants?: string[];
  hp: string;
  type: string;
  category: 'Pokémon' | 'Trainer' | 'Energy' | 'Special';
  supertype?: string;
  subtypes?: string[];
  illustrator?: string;
  regulationMark?: string;
  pricing: CardPricingData;
  forensicMarkers?: {
    rosetteMatrix: string;
    blackCoreLayer: boolean;
    fontStyle: string;
    foilTexture: string;
    expectedCentering: { front: string; back: string };
  };
}

export const REFERENCE_CATALOG: ReferenceCard[] = [
  {
    card_id: "pl4-AR5",
    name: "Arceus",
    set_name: "Platinum: Arceus",
    set_id: "pl4",
    collector_number: "AR5",
    rarity: "Rare Holo (AR)",
    language: "English",
    release_date: "2009-11-04",
    image_url: "https://images.pokemontcg.io/pl4/AR5_hires.png",
    variant: "Colorless Holofoil (Ripple Swell / Sky Spear)",
    all_variants: [
      "Colorless Holofoil (AR5)",
      "Reverse Holofoil (AR5)",
      "Normal / Non-Holo (AR5)",
      "Arceus LV.X (94/99)",
      "Arceus LV.X Tin Promo (DP56)"
    ],
    hp: "80",
    type: "Colorless",
    category: "Pokémon",
    supertype: "Pokémon",
    subtypes: ["Basic", "AR", "LV.100"],
    illustrator: "Hironobu Yoshida",
    pricing: {
      raw: {
        market: 43.32,
        recentSold: 41.50,
        low: 15.99,
        high: 80.00,
        volume: 24,
        updated: "Just now"
      },
      psa10: {
        market: 385.00,
        recentSold: 375.00,
        volume: 6,
        popCount: 142
      },
      psa9: {
        market: 125.00,
        recentSold: 118.00,
        volume: 16,
        popCount: 480
      },
      psa8: {
        market: 65.00,
        recentSold: 60.00,
        volume: 12,
        popCount: 310
      },
      bgs95: 260.00,
      cgc10: 340.00,
      sources: [
        { name: "TCGplayer Market", price: 43.32, condition: "Near Mint Holo", updated: "Just now" },
        { name: "eBay Sold Aggregator", price: 375.00, condition: "PSA 10 Gem Mint", updated: "1 hour ago" },
        { name: "PriceCharting Index", price: 385.00, condition: "PSA 10", updated: "2 hours ago" },
        { name: "Cardmarket (EU)", price: 38.00, condition: "Near Mint (~€35.00)", updated: "3 hours ago" }
      ],
      priceHistory: [
        { date: "2026-02", rawPrice: 32.00, psa10Price: 310, psa9Price: 95, volume: 18 },
        { date: "2026-05", rawPrice: 38.50, psa10Price: 350, psa9Price: 110, volume: 22 },
        { date: "2026-08", rawPrice: 43.32, psa10Price: 385, psa9Price: 125, volume: 24 }
      ],
      variants: [
        { name: "Colorless Holofoil (AR5)", type: "Holofoil", rawPrice: 43.32, psa10Price: 385.00, selected: true, description: "Official 2009 Platinum: Arceus AR5 Holofoil print featuring Ripple Swell & Sky Spear" },
        { name: "Reverse Holofoil (AR5)", type: "Reverse Holo", rawPrice: 52.00, psa10Price: 450.00, description: "Reverse holofoil mirror finish across card background" },
        { name: "Normal / Non-Holo (AR5)", type: "Non-Holo", rawPrice: 18.50, psa10Price: 140.00, description: "Theme deck non-holo variant" },
        { name: "1st Edition / Japanese (041/090)", type: "Japanese 1st Ed", rawPrice: 65.00, psa10Price: 520.00, description: "Japanese Advent of Arceus 1st Edition print" }
      ]
    },
    forensicMarkers: {
      rosetteMatrix: "2009 Diamond & Pearl / Platinum era 1200 DPI CMYK offset litho with silver starburst foil",
      blackCoreLayer: true,
      fontStyle: "Futura & Gill Sans DP-era font spec with LV.100 bold modifier",
      foilTexture: "Smooth silver refractive starburst holofoil under Yellow DP border",
      expectedCentering: { front: "55/45 or better for PSA 10", back: "75/25 for PSA 10" }
    }
  },
  {
    card_id: "xy10-125",
    name: "Alakazam EX",
    set_name: "XY - Fates Collide",
    set_id: "xy10",
    collector_number: "125/124",
    rarity: "Secret Rare",
    language: "English",
    release_date: "2016-05-02",
    image_url: "https://images.pokemontcg.io/xy10/125_hires.png",
    variant: "Secret Rare Full Art (Gold Border / Umbreon Cameo)",
    all_variants: [
      "Secret Rare Full Art (125/124)",
      "Full Art Ultra Rare (117/124)",
      "Regular Art EX (025/124)",
      "M Alakazam EX (026/124)",
      "M Alakazam EX Full Art (118/124)"
    ],
    hp: "160",
    type: "Psychic",
    category: "Pokémon",
    supertype: "Pokémon",
    subtypes: ["EX", "Basic"],
    illustrator: "Mitsuhiro Arita",
    pricing: {
      raw: {
        market: 256.00,
        recentSold: 252.00,
        low: 225.00,
        high: 295.00,
        volume: 38,
        updated: "Just now"
      },
      psa10: {
        market: 1650.00,
        recentSold: 1625.00,
        volume: 8,
        popCount: 284
      },
      psa9: {
        market: 560.00,
        recentSold: 545.00,
        volume: 22,
        popCount: 920
      },
      psa8: {
        market: 380.00,
        recentSold: 370.00,
        volume: 14,
        popCount: 390
      },
      bgs95: 1050.00,
      cgc10: 1480.00,
      sources: [
        { name: "TCGplayer Market", price: 256.00, condition: "Near Mint", updated: "Just now" },
        { name: "eBay Sold Aggregator", price: 1625.00, condition: "PSA 10 Gem Mint", updated: "1 hour ago" },
        { name: "PriceCharting Index", price: 1650.00, condition: "PSA 10", updated: "2 hours ago" },
        { name: "Cardmarket (EU)", price: 245.00, condition: "Near Mint (EUR ~€228)", updated: "4 hours ago" }
      ],
      priceHistory: [
        { date: "2026-02", rawPrice: 215, psa10Price: 1350, psa9Price: 470, volume: 28 },
        { date: "2026-05", rawPrice: 238, psa10Price: 1520, psa9Price: 515, volume: 32 },
        { date: "2026-08", rawPrice: 256, psa10Price: 1650, psa9Price: 560, volume: 38 }
      ],
      variants: [
        { name: "Secret Rare Full Art (125/124)", type: "Secret Rare Gold Border", rawPrice: 256.00, psa10Price: 1650.00, selected: true, description: "Secret Rare featuring Alakazam with Umbreon in background, illustrated by Mitsuhiro Arita with textured foil and gold borders" },
        { name: "Full Art Ultra Rare (117/124)", type: "Full Art Holo", rawPrice: 48.00, psa10Price: 260.00, description: "Full art portrait Alakazam EX without Umbreon cameo" },
        { name: "Regular Art EX (025/124)", type: "Standard EX", rawPrice: 12.50, psa10Price: 75.00, description: "Standard half-art EX print" }
      ]
    },
    forensicMarkers: {
      rosetteMatrix: "Official 2016 Pokémon USA / Japan offset lithographic rosette with high line screen frequency",
      blackCoreLayer: true,
      fontStyle: "Gill Sans Bold & Futura with specific EX symbol gradient fill",
      foilTexture: "Cross-diagonal textured foil etching across entire card body with Umbreon background relief",
      expectedCentering: { front: "55/45 or better for PSA 10", back: "75/25 for PSA 10" }
    }
  },
  {
    card_id: "sm10-217",
    name: "Reshiram & Charizard GX",
    set_name: "Unbroken Bonds",
    set_id: "sm10",
    collector_number: "217/214",
    rarity: "Secret Rare",
    language: "English",
    release_date: "2019-05-03",
    image_url: "https://images.pokemontcg.io/sm10/217_hires.png",
    variant: "Rainbow Rare (Secret Rare)",
    all_variants: ["Rainbow Rare (Secret Rare)", "Regular Art (020/214)", "Full Art (194/214)", "Special Art Promo (SM247)"],
    hp: "270",
    type: "Fire",
    category: "Pokémon",
    supertype: "Pokémon",
    subtypes: ["TAG TEAM", "GX", "Basic"],
    illustrator: "aky CG Works",
    pricing: {
      raw: {
        market: 185.00,
        recentSold: 178.50,
        low: 145.00,
        high: 220.00,
        volume: 42,
        updated: "Just now"
      },
      psa10: {
        market: 1850.00,
        recentSold: 1825.00,
        volume: 14,
        popCount: 1420
      },
      psa9: {
        market: 320.00,
        recentSold: 310.00,
        volume: 29,
        popCount: 3180
      },
      psa8: {
        market: 210.00,
        recentSold: 205.00,
        volume: 18,
        popCount: 890
      },
      bgs95: 1150.00,
      cgc10: 1650.00,
      sources: [
        { name: "TCGplayer Market", price: 185.00, condition: "Near Mint", updated: "3 mins ago" },
        { name: "eBay Sold Listings", price: 1825.00, condition: "PSA 10 Gem Mint", updated: "1 hour ago" },
        { name: "PriceCharting Index", price: 1850.00, condition: "PSA 10", updated: "2 hours ago" },
        { name: "Cardmarket (EU)", price: 165.00, condition: "Near Mint (EUR ~€155)", updated: "4 hours ago" }
      ],
      priceHistory: [
        { date: "2026-02", rawPrice: 160, psa10Price: 1550, psa9Price: 280, volume: 38 },
        { date: "2026-04", rawPrice: 170, psa10Price: 1680, psa9Price: 295, volume: 45 },
        { date: "2026-06", rawPrice: 175, psa10Price: 1750, psa9Price: 305, volume: 50 },
        { date: "2026-08", rawPrice: 185, psa10Price: 1850, psa9Price: 320, volume: 62 }
      ],
      variants: [
        { name: "Rainbow Rare (Secret Rare 217/214)", type: "Rainbow Holo", rawPrice: 185.00, psa10Price: 1850.00, selected: true, description: "Textured rainbow foil finish with Tag Team gold accents" },
        { name: "Full Art (194/214)", type: "Full Art Holo", rawPrice: 42.00, psa10Price: 280.00, description: "Full portrait card with red and gold fire background" },
        { name: "Regular Art (020/214)", type: "Half Art GX", rawPrice: 18.50, psa10Price: 95.00, description: "Standard GX card framing with holographic window" }
      ]
    },
    forensicMarkers: {
      rosetteMatrix: "Official 4-color high frequency offset lithography rosette matrix with diagonal cyan/magenta angles",
      blackCoreLayer: true,
      fontStyle: "Gill Sans MT Bold headers and Futura Demi Bold attack titles",
      foilTexture: "Diagonal textured micro-grooves across entire card front surface with glossy GX text highlights",
      expectedCentering: { front: "55/45 or better for PSA 10", back: "75/25 for PSA 10" }
    }
  },
  {
    card_id: "base1-4",
    name: "Charizard",
    set_name: "Base Set",
    set_id: "base1",
    collector_number: "4/102",
    rarity: "Rare Holo",
    language: "English",
    release_date: "1999-01-09",
    image_url: "https://images.pokemontcg.io/base1/4_hires.png",
    variant: "Unlimited Holo",
    all_variants: ["1st Edition Shadowless", "Shadowless", "Unlimited Holo", "4th Print (UK 1999-2000)"],
    hp: "120",
    type: "Fire",
    category: "Pokémon",
    supertype: "Pokémon",
    subtypes: ["Stage 2"],
    illustrator: "Mitsuhiro Arita",
    pricing: {
      raw: {
        market: 245.00,
        recentSold: 235.00,
        low: 180.00,
        high: 340.00,
        volume: 88,
        updated: "Just now"
      },
      psa10: {
        market: 9800.00,
        recentSold: 9650.00,
        volume: 3,
        popCount: 412
      },
      psa9: {
        market: 1250.00,
        recentSold: 1200.00,
        volume: 19,
        popCount: 4890
      },
      psa8: {
        market: 520.00,
        recentSold: 510.00,
        volume: 34,
        popCount: 9200
      },
      bgs95: 4500.00,
      cgc10: 8900.00,
      sources: [
        { name: "TCGplayer", price: 245.00, condition: "Near Mint", updated: "Just now" },
        { name: "eBay Sold (PSA 10)", price: 9650.00, condition: "PSA 10", updated: "3 days ago" },
        { name: "PriceCharting", price: 9800.00, condition: "PSA 10", updated: "Yesterday" }
      ],
      priceHistory: [
        { date: "2026-02", rawPrice: 220, psa10Price: 9100, psa9Price: 1150, volume: 75 },
        { date: "2026-05", rawPrice: 235, psa10Price: 9400, psa9Price: 1200, volume: 82 },
        { date: "2026-08", rawPrice: 245, psa10Price: 9800, psa9Price: 1250, volume: 94 }
      ],
      variants: [
        { name: "1st Edition Shadowless", type: "1st Edition", rawPrice: 5500.00, psa10Price: 240000.00, description: "Black 'Edition 1' circular stamp, no right drop-shadow under art box, '99, 99, 2000' copyright" },
        { name: "Shadowless", type: "Shadowless", rawPrice: 850.00, psa10Price: 38000.00, description: "No right drop-shadow under art box, thinner HP typography font" },
        { name: "Unlimited Holo", type: "Unlimited", rawPrice: 245.00, psa10Price: 9800.00, selected: true, description: "Standard Base Set printing with drop shadow on right side of art frame" },
        { name: "4th Print (UK 1999-2000)", type: "4th Print", rawPrice: 380.00, psa10Price: 12500.00, description: "Distinct copyright date line including '1999-2000 Wizards'" }
      ]
    },
    forensicMarkers: {
      rosetteMatrix: "Standard 1999 Wizards of the Coast 175-line screen offset rosette printing",
      blackCoreLayer: true,
      fontStyle: "Gill Sans for text, Futura for numbers",
      foilTexture: "Starlight / Cosmos pattern with smooth foil finish",
      expectedCentering: { front: "55/45 Front", back: "75/25 Back" }
    }
  },
  {
    card_id: "swsh7-215",
    name: "Umbreon VMAX",
    set_name: "Evolving Skies",
    set_id: "swsh7",
    collector_number: "215/203",
    rarity: "Secret Rare",
    language: "English",
    release_date: "2021-08-27",
    image_url: "https://images.pokemontcg.io/swsh7/215_hires.png",
    variant: "Alternate Art Secret Rare (Moonbreon)",
    all_variants: ["Alternate Art Secret Rare (Moonbreon)", "Regular VMAX (095/203)", "Rainbow Rare VMAX (214/203)"],
    hp: "310",
    type: "Darkness",
    category: "Pokémon",
    supertype: "Pokémon",
    subtypes: ["VMAX", "Dynamax", "Single Strike"],
    illustrator: "KEIICHIRO ITO",
    pricing: {
      raw: {
        market: 780.00,
        recentSold: 765.00,
        low: 690.00,
        high: 850.00,
        volume: 64,
        updated: "Just now"
      },
      psa10: {
        market: 1280.00,
        recentSold: 1250.00,
        volume: 38,
        popCount: 11450
      },
      psa9: {
        market: 820.00,
        recentSold: 800.00,
        volume: 45,
        popCount: 4320
      },
      psa8: {
        market: 680.00,
        recentSold: 670.00,
        volume: 12,
        popCount: 650
      },
      bgs95: 1100.00,
      cgc10: 1200.00,
      sources: [
        { name: "TCGplayer", price: 780.00, condition: "Near Mint", updated: "Just now" },
        { name: "eBay Sold (PSA 10)", price: 1250.00, condition: "PSA 10", updated: "12 hours ago" },
        { name: "PriceCharting", price: 1280.00, condition: "PSA 10", updated: "1 day ago" }
      ],
      priceHistory: [
        { date: "2026-02", rawPrice: 650, psa10Price: 1050, psa9Price: 700, volume: 55 },
        { date: "2026-05", rawPrice: 720, psa10Price: 1180, psa9Price: 760, volume: 60 },
        { date: "2026-08", rawPrice: 780, psa10Price: 1280, psa9Price: 820, volume: 72 }
      ],
      variants: [
        { name: "Alternate Art Secret Rare (Moonbreon 215/203)", type: "Alt Art Holo", rawPrice: 780.00, psa10Price: 1280.00, selected: true, description: "Famous Moonbreon illustration showing Umbreon reaching for the moon on top of a tower" },
        { name: "Rainbow Rare VMAX (214/203)", type: "Rainbow Holo", rawPrice: 38.00, psa10Price: 140.00, description: "Rainbow holographic textured card" },
        { name: "Regular VMAX (095/203)", type: "VMAX Holo", rawPrice: 8.50, psa10Price: 45.00, description: "Standard expansion VMAX card" }
      ]
    },
    forensicMarkers: {
      rosetteMatrix: "Modern ultra-fine HD digital gravure with micro-texture embossing",
      blackCoreLayer: true,
      fontStyle: "Modern Pokemon font set (Optima & Futura)",
      foilTexture: "Deep concentric ring texture in the moon with fine vertical finger-print texturing across body",
      expectedCentering: { front: "55/45 Front", back: "75/25 Back" }
    }
  },
  {
    card_id: "swsh12-186",
    name: "Lugia V",
    set_name: "Silver Tempest",
    set_id: "swsh12",
    collector_number: "186/195",
    rarity: "Ultra Rare (Alternate Art)",
    language: "English",
    release_date: "2022-11-11",
    image_url: "https://images.pokemontcg.io/swsh12/186_hires.png",
    variant: "Alternate Art Ultra Rare",
    all_variants: ["Alternate Art Ultra Rare (186/195)", "Full Art V (185/195)", "Regular V (138/195)"],
    hp: "220",
    type: "Colorless",
    category: "Pokémon",
    supertype: "Pokémon",
    subtypes: ["Basic", "V"],
    illustrator: "kawayoo",
    pricing: {
      raw: {
        market: 165.00,
        recentSold: 158.00,
        low: 135.00,
        high: 190.00,
        volume: 38,
        updated: "Just now"
      },
      psa10: {
        market: 360.00,
        recentSold: 350.00,
        volume: 24,
        popCount: 4200
      },
      psa9: {
        market: 180.00,
        recentSold: 175.00,
        volume: 30,
        popCount: 2900
      },
      psa8: {
        market: 140.00,
        recentSold: 135.00,
        volume: 8,
        popCount: 410
      },
      sources: [
        { name: "TCGplayer", price: 165.00, condition: "Near Mint", updated: "10 mins ago" },
        { name: "eBay Sold", price: 350.00, condition: "PSA 10", updated: "Yesterday" }
      ],
      priceHistory: [
        { date: "2026-02", rawPrice: 145, psa10Price: 310, psa9Price: 160, volume: 30 },
        { date: "2026-05", rawPrice: 155, psa10Price: 335, psa9Price: 170, volume: 35 },
        { date: "2026-08", rawPrice: 165, psa10Price: 360, psa9Price: 180, volume: 42 }
      ],
      variants: [
        { name: "Alternate Art Ultra Rare (186/195)", type: "Alt Art Holo", rawPrice: 165.00, psa10Price: 360.00, selected: true, description: "Moody sea storm landscape by kawayoo" },
        { name: "Full Art V (185/195)", type: "Full Art", rawPrice: 14.00, psa10Price: 65.00, description: "Full body Lugia over silver background" },
        { name: "Regular V (138/195)", type: "Standard V", rawPrice: 4.50, psa10Price: 28.00, description: "Standard half art V" }
      ]
    }
  },
  {
    card_id: "swsh11-186",
    name: "Giratina V",
    set_name: "Lost Origin",
    set_id: "swsh11",
    collector_number: "186/196",
    rarity: "Ultra Rare (Alternate Art)",
    language: "English",
    release_date: "2022-09-09",
    image_url: "https://images.pokemontcg.io/swsh11/186_hires.png",
    variant: "Alternate Art Ultra Rare (Abyss)",
    all_variants: ["Alternate Art Ultra Rare (186/196)", "Full Art V (185/196)", "Regular V (130/196)", "Gold VSTAR (GG69/GG70)"],
    hp: "220",
    type: "Dragon",
    category: "Pokémon",
    supertype: "Pokémon",
    subtypes: ["Basic", "V"],
    illustrator: "Shinji Kanda",
    pricing: {
      raw: {
        market: 260.00,
        recentSold: 252.00,
        low: 220.00,
        high: 295.00,
        volume: 45,
        updated: "Just now"
      },
      psa10: {
        market: 640.00,
        recentSold: 625.00,
        volume: 32,
        popCount: 5100
      },
      psa9: {
        market: 290.00,
        recentSold: 280.00,
        volume: 40,
        popCount: 3800
      },
      psa8: {
        market: 230.00,
        recentSold: 220.00,
        volume: 11,
        popCount: 520
      },
      sources: [
        { name: "TCGplayer", price: 260.00, condition: "Near Mint", updated: "5 mins ago" },
        { name: "eBay Sold", price: 625.00, condition: "PSA 10", updated: "2 days ago" }
      ],
      priceHistory: [
        { date: "2026-02", rawPrice: 220, psa10Price: 530, psa9Price: 250, volume: 38 },
        { date: "2026-05", rawPrice: 245, psa10Price: 590, psa9Price: 270, volume: 44 },
        { date: "2026-08", rawPrice: 260, psa10Price: 640, psa9Price: 290, volume: 50 }
      ],
      variants: [
        { name: "Alternate Art Ultra Rare (186/196)", type: "Alt Art Holo", rawPrice: 260.00, psa10Price: 640.00, selected: true, description: "Intricate surrealist distortion world artwork by Shinji Kanda" },
        { name: "Full Art V (185/196)", type: "Full Art", rawPrice: 12.00, psa10Price: 55.00, description: "Full portrait card with red/gold borders" }
      ]
    }
  },
  {
    card_id: "sv3pt5-199",
    name: "Charizard ex",
    set_name: "151",
    set_id: "sv3pt5",
    collector_number: "199/165",
    rarity: "Special Illustration Rare",
    language: "English",
    release_date: "2023-09-22",
    image_url: "https://images.pokemontcg.io/sv3pt5/199_hires.png",
    variant: "Special Illustration Rare (SIR)",
    all_variants: ["Special Illustration Rare (199/165)", "Ultra Rare Full Art (183/165)", "Double Rare ex (006/165)"],
    hp: "330",
    type: "Darkness",
    category: "Pokémon",
    supertype: "Pokémon",
    subtypes: ["Stage 2", "ex", "Tera"],
    illustrator: "miki kudo",
    pricing: {
      raw: {
        market: 115.00,
        recentSold: 112.00,
        low: 95.00,
        high: 135.00,
        volume: 72,
        updated: "Just now"
      },
      psa10: {
        market: 280.00,
        recentSold: 275.00,
        volume: 48,
        popCount: 16800
      },
      psa9: {
        market: 125.00,
        recentSold: 120.00,
        volume: 60,
        popCount: 7900
      },
      psa8: {
        market: 95.00,
        recentSold: 90.00,
        volume: 14,
        popCount: 880
      },
      sources: [
        { name: "TCGplayer", price: 115.00, condition: "Near Mint", updated: "Just now" },
        { name: "PriceCharting", price: 280.00, condition: "PSA 10", updated: "Today" }
      ],
      priceHistory: [
        { date: "2026-02", rawPrice: 105, psa10Price: 250, psa9Price: 115, volume: 65 },
        { date: "2026-05", rawPrice: 110, psa10Price: 265, psa9Price: 120, volume: 70 },
        { date: "2026-08", rawPrice: 115, psa10Price: 280, psa9Price: 125, volume: 80 }
      ],
      variants: [
        { name: "Special Illustration Rare (199/165)", type: "SIR Holo", rawPrice: 115.00, psa10Price: 280.00, selected: true, description: "Art showcasing Charizard soaring over volcanic canyon" },
        { name: "Ultra Rare Full Art (183/165)", type: "Full Art", rawPrice: 28.00, psa10Price: 85.00, description: "Full art render with crystalline Tera crown" }
      ]
    }
  },
  {
    card_id: "sv2-62",
    name: "Pikachu",
    set_name: "Paldea Evolved",
    set_id: "sv2",
    collector_number: "062/193",
    rarity: "Illustration Rare",
    language: "English",
    release_date: "2023-06-09",
    image_url: "https://images.pokemontcg.io/sv2/62_hires.png",
    variant: "Illustration Rare",
    all_variants: ["Illustration Rare (062/193)", "Common Non-Holo", "Reverse Holo"],
    hp: "70",
    type: "Lightning",
    category: "Pokémon",
    supertype: "Pokémon",
    subtypes: ["Basic"],
    illustrator: "Hiroyuki Yamamoto",
    pricing: {
      raw: {
        market: 16.50,
        recentSold: 15.80,
        low: 12.00,
        high: 22.00,
        volume: 35,
        updated: "Just now"
      },
      psa10: {
        market: 75.00,
        recentSold: 72.00,
        volume: 18,
        popCount: 2200
      },
      psa9: {
        market: 22.00,
        recentSold: 20.00,
        volume: 25,
        popCount: 1400
      },
      psa8: {
        market: 15.00,
        recentSold: 14.00,
        volume: 6,
        popCount: 190
      },
      sources: [
        { name: "TCGplayer", price: 16.50, condition: "Near Mint", updated: "Just now" }
      ],
      priceHistory: [
        { date: "2026-02", rawPrice: 14, psa10Price: 65, psa9Price: 19, volume: 30 },
        { date: "2026-05", rawPrice: 15.5, psa10Price: 70, psa9Price: 20.5, volume: 32 },
        { date: "2026-08", rawPrice: 16.5, psa10Price: 75, psa9Price: 22, volume: 38 }
      ],
      variants: [
        { name: "Illustration Rare (062/193)", type: "IR Holo", rawPrice: 16.50, psa10Price: 75.00, selected: true, description: "Full artwork of Pikachu with Pawmi and friends in cozy room" }
      ]
    }
  },
  {
    card_id: "base1-2",
    name: "Blastoise",
    set_name: "Base Set",
    set_id: "base1",
    collector_number: "2/102",
    rarity: "Rare Holo",
    language: "English",
    release_date: "1999-01-09",
    image_url: "https://images.pokemontcg.io/base1/2_hires.png",
    variant: "Unlimited Holo",
    all_variants: ["1st Edition Shadowless", "Shadowless", "Unlimited Holo"],
    hp: "100",
    type: "Water",
    category: "Pokémon",
    supertype: "Pokémon",
    subtypes: ["Stage 2"],
    illustrator: "Ken Sugimori",
    pricing: {
      raw: {
        market: 95.00,
        recentSold: 92.00,
        low: 70.00,
        high: 130.00,
        volume: 42,
        updated: "Just now"
      },
      psa10: {
        market: 3400.00,
        recentSold: 3350.00,
        volume: 4,
        popCount: 480
      },
      psa9: {
        market: 420.00,
        recentSold: 410.00,
        volume: 16,
        popCount: 3100
      },
      psa8: {
        market: 195.00,
        recentSold: 190.00,
        volume: 24,
        popCount: 5200
      },
      sources: [
        { name: "TCGplayer", price: 95.00, condition: "Near Mint", updated: "Just now" }
      ],
      priceHistory: [
        { date: "2026-02", rawPrice: 85, psa10Price: 3100, psa9Price: 390, volume: 38 },
        { date: "2026-05", rawPrice: 90, psa10Price: 3250, psa9Price: 405, volume: 40 },
        { date: "2026-08", rawPrice: 95, psa10Price: 3400, psa9Price: 420, volume: 46 }
      ],
      variants: [
        { name: "1st Edition Shadowless", type: "1st Edition", rawPrice: 1650.00, psa10Price: 35000.00, description: "1st edition stamp with no shadow" },
        { name: "Shadowless", type: "Shadowless", rawPrice: 320.00, psa10Price: 8500.00, description: "No shadow version" },
        { name: "Unlimited Holo", type: "Unlimited", rawPrice: 95.00, psa10Price: 3400.00, selected: true, description: "Classic unlimited print" }
      ]
    }
  },
  {
    card_id: "cel25-25",
    name: "Mew",
    set_name: "Celebrations",
    set_id: "cel25",
    collector_number: "25/25",
    rarity: "Secret Rare",
    language: "English",
    release_date: "2021-10-08",
    image_url: "https://images.pokemontcg.io/cel25/25_hires.png",
    variant: "Gold Secret Rare",
    all_variants: ["Gold Secret Rare (25/25)", "Regular Holo (11/25)"],
    hp: "60",
    type: "Psychic",
    category: "Pokémon",
    supertype: "Pokémon",
    subtypes: ["Basic"],
    illustrator: "Saki Hayashiro",
    pricing: {
      raw: {
        market: 34.00,
        recentSold: 32.50,
        low: 28.00,
        high: 42.00,
        volume: 52,
        updated: "Just now"
      },
      psa10: {
        market: 110.00,
        recentSold: 105.00,
        volume: 28,
        popCount: 14200
      },
      psa9: {
        market: 42.00,
        recentSold: 40.00,
        volume: 34,
        popCount: 6500
      },
      psa8: {
        market: 32.00,
        recentSold: 30.00,
        volume: 10,
        popCount: 780
      },
      sources: [
        { name: "TCGplayer", price: 34.00, condition: "Near Mint", updated: "Just now" }
      ],
      priceHistory: [
        { date: "2026-02", rawPrice: 30, psa10Price: 98, psa9Price: 38, volume: 45 },
        { date: "2026-05", rawPrice: 32, psa10Price: 104, psa9Price: 40, volume: 50 },
        { date: "2026-08", rawPrice: 34, psa10Price: 110, psa9Price: 42, volume: 55 }
      ],
      variants: [
        { name: "Gold Secret Rare (25/25)", type: "Gold Holo", rawPrice: 34.00, psa10Price: 110.00, selected: true, description: "Shiny blue Mew in metallic gold etched card framing" }
      ]
    }
  },
  {
    card_id: "swsh8-271",
    name: "Gengar VMAX",
    set_name: "Fusion Strike",
    set_id: "swsh8",
    collector_number: "271/264",
    rarity: "Secret Rare",
    language: "English",
    release_date: "2021-11-12",
    image_url: "https://images.pokemontcg.io/swsh8/271_hires.png",
    variant: "Alternate Art Secret Rare",
    all_variants: ["Alternate Art Secret Rare (271/264)", "Regular VMAX (157/264)"],
    hp: "320",
    type: "Darkness",
    category: "Pokémon",
    supertype: "Pokémon",
    subtypes: ["VMAX", "Gigantamax", "Fusion Strike"],
    illustrator: "sowsow",
    pricing: {
      raw: {
        market: 310.00,
        recentSold: 302.00,
        low: 275.00,
        high: 350.00,
        volume: 38,
        updated: "Just now"
      },
      psa10: {
        market: 720.00,
        recentSold: 710.00,
        volume: 22,
        popCount: 4600
      },
      psa9: {
        market: 340.00,
        recentSold: 330.00,
        volume: 26,
        popCount: 2900
      },
      psa8: {
        market: 270.00,
        recentSold: 260.00,
        volume: 9,
        popCount: 410
      },
      sources: [
        { name: "TCGplayer", price: 310.00, condition: "Near Mint", updated: "Just now" }
      ],
      priceHistory: [
        { date: "2026-02", rawPrice: 260, psa10Price: 620, psa9Price: 290, volume: 30 },
        { date: "2026-05", rawPrice: 285, psa10Price: 670, psa9Price: 315, volume: 34 },
        { date: "2026-08", rawPrice: 310, psa10Price: 720, psa9Price: 340, volume: 40 }
      ],
      variants: [
        { name: "Alternate Art Secret Rare (271/264)", type: "Alt Art Holo", rawPrice: 310.00, psa10Price: 720.00, selected: true, description: "Iconic art by sowsow showing Gigantamax Gengar swallowing building items" }
      ]
    }
  },
  {
    card_id: "swsh12pt5gg-GG18",
    name: "Magnezone",
    set_name: "Crown Zenith",
    set_id: "swsh12pt5gg",
    collector_number: "GG18/GG70",
    rarity: "Special Illustration Rare",
    language: "English",
    release_date: "2023-01-20",
    image_url: "https://images.pokemontcg.io/swsh12pt5gg/GG18_hires.png",
    variant: "Galarian Gallery Full Art Holo (GG18/GG70)",
    all_variants: [
      "Galarian Gallery Full Art Holo (GG18/GG70)",
      "Holo Rare (065/159)",
      "Reverse Holo (065/159)"
    ],
    hp: "150",
    type: "Metal",
    category: "Pokémon",
    supertype: "Pokémon",
    subtypes: ["Stage 2"],
    illustrator: "GOSSAN",
    pricing: {
      raw: {
        market: 3.85,
        recentSold: 3.65,
        low: 1.99,
        high: 8.50,
        volume: 54,
        updated: "Just now"
      },
      psa10: {
        market: 42.00,
        recentSold: 40.00,
        volume: 18,
        popCount: 1450
      },
      psa9: {
        market: 18.00,
        recentSold: 16.50,
        volume: 22,
        popCount: 820
      },
      psa8: {
        market: 10.00,
        recentSold: 9.50,
        volume: 8,
        popCount: 190
      },
      sources: [
        { name: "TCGplayer Market", price: 3.85, condition: "Near Mint Holo", updated: "Just now" },
        { name: "eBay Sold Aggregator", price: 40.00, condition: "PSA 10 Gem Mint", updated: "1 hour ago" },
        { name: "PriceCharting Index", price: 42.00, condition: "PSA 10", updated: "2 hours ago" }
      ],
      priceHistory: [
        { date: "2026-02", rawPrice: 3.20, psa10Price: 36, psa9Price: 15, volume: 44 },
        { date: "2026-05", rawPrice: 3.50, psa10Price: 39, psa9Price: 17, volume: 50 },
        { date: "2026-08", rawPrice: 3.85, psa10Price: 42, psa9Price: 18, volume: 54 }
      ],
      variants: [
        { name: "Galarian Gallery Full Art Holo (GG18/GG70)", type: "Full Art Holo", rawPrice: 3.85, psa10Price: 42.00, selected: true, description: "Official Crown Zenith Galarian Gallery artwork by GOSSAN featuring Giga Magnet & Power Beam" },
        { name: "Holo Rare (065/159)", type: "Standard Holo", rawPrice: 0.85, psa10Price: 18.00, description: "Main set standard holo print" }
      ]
    },
    forensicMarkers: {
      rosetteMatrix: "2023 Sword & Shield era ultra-fine offset lithographic rosette matrix with full-art holographic sheet underlay",
      blackCoreLayer: true,
      fontStyle: "Modern Pokemon SWSH font geometry with crisp yellow borderless artwork",
      foilTexture: "Diagonal matte foil dispersion across factory laboratory background",
      expectedCentering: { front: "55/45 or better for Gem Mint 10", back: "75/25" }
    }
  }
];

export function findReferenceCardByQuery(name: string, set?: string, number?: string): ReferenceCard | null {
  const normName = (name || '').toLowerCase().trim();
  const cleanName = normName.replace(/[^a-z0-9]/g, '');
  const normNum = number ? number.toLowerCase().trim().replace(/^[0]+/g, '') : '';
  const cleanSet = (set || '').toLowerCase().trim();
  
  // 1. Direct number match
  if (normNum) {
    const numMatch = REFERENCE_CATALOG.find(c => {
      const cNum = c.collector_number.toLowerCase().replace(/^[0]+/g, '');
      const rawNum = cNum.split('/')[0];
      const targetRaw = normNum.split('/')[0];
      return cNum === normNum || (rawNum && rawNum === targetRaw && (!cleanSet || c.set_name.toLowerCase().includes(cleanSet)));
    });
    if (numMatch) return numMatch;
  }

  // 2. Exact match on clean alphanumeric name
  const cleanMatch = REFERENCE_CATALOG.find(c => {
    const cClean = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cClean === cleanName;
  });
  if (cleanMatch) return cleanMatch;

  // 3. Specific multi-word name matches (e.g. "Reshiram & Charizard GX" or "Umbreon VMAX" or "Alakazam EX")
  const exactNameMatch = REFERENCE_CATALOG.find(c => c.name.toLowerCase() === normName);
  if (exactNameMatch) return exactNameMatch;

  // 4. Name contains
  const subMatch = REFERENCE_CATALOG.find(c => {
    const cName = c.name.toLowerCase();
    const cClean = cName.replace(/[^a-z0-9]/g, '');
    return (
      cName.includes(normName) ||
      normName.includes(cName) ||
      (cleanName.length >= 4 && (cClean.includes(cleanName) || cleanName.includes(cClean)))
    );
  });
  if (subMatch) return subMatch;

  return null;
}

/**
 * Resolves the true canonical reference master image matching the exact card
 */
export function getCanonicalReferenceImage(card: any): string {
  if (!card) return 'https://images.pokemontcg.io/swsh12pt5gg/GG18_hires.png';

  // 1. If card object already has a dedicated reference image (and not a generic placeholder)
  if (card.reference_image && !card.reference_image.includes('unsplash.com')) {
    return card.reference_image;
  }
  if (card.referenceImage && !card.referenceImage.includes('unsplash.com')) {
    return card.referenceImage;
  }

  // 2. Find from the official Reference Catalog
  const catalogMatch = findReferenceCardByQuery(card.name, card.set || card.set_name, card.cardNumber || card.collector_number);
  if (catalogMatch && catalogMatch.image_url) {
    return catalogMatch.image_url;
  }

  // 3. If card.backImage contains a valid reference image URL
  if (card.backImage && !card.backImage.includes('unsplash.com') && !card.backImage.endsWith('back.png') && !card.backImage.includes('pokemontcg.io/back')) {
    return card.backImage;
  }

  // 4. If card.frontImage is already an official database asset (not camera photo)
  if (card.frontImage && (card.frontImage.includes('images.pokemontcg.io') || card.frontImage.includes('tcgdex.net') || card.frontImage.includes('assets.pokemon.com'))) {
    return card.frontImage;
  }

  // 5. Derive from set & number naming patterns
  const cleanNum = (card.cardNumber || card.collector_number || '').replace(/[^a-zA-Z0-9]/g, '');
  const setName = (card.set || card.set_name || '').toLowerCase();
  
  if (setName.includes('crown zenith') || setName.includes('galarian gallery')) {
    return `https://images.pokemontcg.io/swsh12pt5gg/${cleanNum || 'GG18'}_hires.png`;
  }
  if (setName.includes('arceus') || setName.includes('platinum')) {
    return `https://images.pokemontcg.io/pl4/${cleanNum || 'AR5'}_hires.png`;
  }
  if (setName.includes('151')) {
    return `https://images.pokemontcg.io/sv3pt5/${cleanNum || '001'}_hires.png`;
  }
  if (setName.includes('fates collide') || setName.includes('xy10')) {
    return `https://images.pokemontcg.io/xy10/${cleanNum || '125'}_hires.png`;
  }
  if (setName.includes('base') || setName.includes('shadowless')) {
    return `https://images.pokemontcg.io/base1/${cleanNum || '4'}_hires.png`;
  }
  if (setName.includes('evolving skies')) {
    return `https://images.pokemontcg.io/swsh7/${cleanNum || '215'}_hires.png`;
  }
  if (setName.includes('unbroken bonds')) {
    return `https://images.pokemontcg.io/sm10/${cleanNum || '217'}_hires.png`;
  }

  // Default to Arceus AR5 or Magnezone GG18 reference
  if ((card.name || '').toLowerCase().includes('magnezone')) {
    return 'https://images.pokemontcg.io/swsh12pt5gg/GG18_hires.png';
  }
  if ((card.name || '').toLowerCase().includes('arceus')) {
    return 'https://images.pokemontcg.io/pl4/AR5_hires.png';
  }

  return 'https://images.pokemontcg.io/pl4/AR5_hires.png';
}
