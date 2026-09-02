export function getMarketPricing(card: any) {
  const baseRaw = card.name === 'Charizard' ? 185.0 : card.name === 'Pikachu' ? 0.58 : 25.0;
  
  return {
    raw: {
      market: baseRaw,
      recentSold: baseRaw * 0.95,
      low: baseRaw * 0.8,
      high: baseRaw * 1.2,
      updated: "2 minutes ago",
      volume: 18
    },
    psa10: {
      market: baseRaw * 45,
      recentSold: baseRaw * 44,
      volume: 4
    },
    psa9: {
      market: baseRaw * 12,
      recentSold: baseRaw * 11.5,
      volume: 12
    },
    psa8: {
      market: baseRaw * 4,
      recentSold: baseRaw * 4.2,
      volume: 27
    },
    sources: [
      { name: "TCGplayer", price: baseRaw, updated: "Just now" },
      { name: "eBay Sold", price: baseRaw * 0.95, updated: "1 hour ago" },
      { name: "Cardmarket", price: baseRaw * 0.9, updated: "4 hours ago" }
    ],
    variants: [
      { name: "Normal", price: baseRaw * 0.4, selected: card.variant === "Normal" },
      { name: card.variant, price: baseRaw, selected: true },
      { name: "1st Edition", price: baseRaw * 5, selected: card.variant === "1st Edition" }
    ].filter((v, i, a) => a.findIndex(t => t.name === v.name) === i)
  };
}
