import { TechRegistryEntry, MCPToolDefinition } from '../types/technology';

export const TECHNOLOGY_REGISTRY: TechRegistryEntry[] = [
  {
    id: 'tcg-mcp',
    name: 'TCG MCP Server',
    repo: 'seanlok/tcg-mcp',
    author: 'Sean Lok',
    license: 'MIT',
    stars: 342,
    category: 'mcp_server',
    description: 'Premier Model Context Protocol server exposing 25 tools for PSA certificate verification, population snapshots, raw/graded card pricing, and collection portfolio intelligence.',
    keyFeatures: [
      'PSA certificate live lookup & grade validation',
      'PSA population reports with higher-grade counts',
      'PriceCharting & Pokemon TCG API multi-source aggregation',
      'Historical price charts & market sentiment indexing',
      'Watchlist & portfolio value tracking'
    ],
    strengths: [
      'Comprehensive tool coverage for PSA and market data',
      'Strict JSON schema validation for LLM integration',
      'Built-in caching for fast query resolution'
    ],
    limitations: [
      'Requires active internet connection for live certificate checks',
      'Rate-limiting considerations on high-volume PSA scraping'
    ],
    suitabilityScore: 96,
    integrationStatus: 'integrated',
    capabilities: [
      'PSA Certificate Lookup',
      'Population Snapshots',
      'Historical Price Charts',
      'Portfolio Analytics',
      'Multi-source Pricing'
    ],
    mcpToolsCount: 25,
    benchmarks: [
      { metric: 'PSA Lookup Latency', score: '185ms', target: '<300ms', status: 'passed' },
      { metric: 'Cert Schema Accuracy', score: '99.8%', target: '>99.0%', status: 'passed' },
      { metric: 'Price Reconciliation', score: '97.4%', target: '>95.0%', status: 'passed' }
    ],
    architectureNotes: 'Exposes native Model Context Protocol (MCP) tool endpoints. Can be called directly by VCA Orchestrator agents via JSON-RPC 2.0.',
    adapterSnippet: `// TCG MCP Client Adapter
export async function lookupPsaCert(certNumber: string) {
  return await mcpGateway.invoke('psa_cert_lookup', { certNumber });
}`,
    lastEvaluated: '2026-08-20'
  },
  {
    id: 'mintpick',
    name: 'MintPick Vision & Centering Core',
    repo: 'mintpick/card-vision-engine',
    author: 'MintPick Team',
    license: 'Apache-2.0',
    stars: 520,
    category: 'computer_vision',
    description: 'High-precision computer vision pipeline specializing in trading card edge detection, perspective distortion correction, sub-pixel border measurement, and surface defect localization.',
    keyFeatures: [
      'Sub-pixel corner detection with Canny & Hough line transforms',
      'Homography matrix calculation for planar rectification',
      'Optical centering percentage calculation (50/50 to 80/20)',
      'Defect bounding boxes for whitening, foil scratches, and print lines'
    ],
    strengths: [
      'Exceptional geometric accuracy on skewed camera angles',
      'Fast client-side WebAssembly execution (<50ms)',
      'Robust against varied lighting and slight glare'
    ],
    limitations: [
      'Requires clean background contrast for optimal edge isolation',
      'Heavy holo foil glitter can occasionally add border noise'
    ],
    suitabilityScore: 94,
    integrationStatus: 'integrated',
    capabilities: [
      'Planar Rectification',
      'Sub-pixel Centering',
      'Corner Radius Analysis',
      'Defect Segmentation'
    ],
    benchmarks: [
      { metric: 'Centering Precision', score: '±0.2%', target: '±0.5%', status: 'passed' },
      { metric: 'Rectification Latency', score: '42ms', target: '<100ms', status: 'passed' },
      { metric: 'Defect Recall (IoU > 0.5)', score: '92.6%', target: '>90.0%', status: 'passed' }
    ],
    architectureNotes: 'Integrated into VCA VScan pipeline stage 4. Runs edge rectification before sending normalized frames to the forensic inspection agent.',
    lastEvaluated: '2026-08-18'
  },
  {
    id: 'centering-analysis-tool',
    name: 'Centering Analysis Tool (CAT)',
    repo: 'tcg-tools/centering-analysis-tool',
    author: 'TCG Tech Lab',
    license: 'MIT',
    stars: 280,
    category: 'grading_centering',
    description: 'Algorithmic centering evaluator implementing official grading standards (PSA, BGS, CGC) with left/right and top/bottom pixel ratio extraction.',
    keyFeatures: [
      'PSA Gem Mint 10 standard evaluation (55/45 front, 75/25 back)',
      'BGS Pristine 10 standard evaluation (50/50 front & back)',
      'Visual grid overlays with color-coded centering guides',
      'Custom border detection for standard vs vintage borders'
    ],
    strengths: [
      'Mathematically rigorous ratio calculations',
      'Zero external API dependencies (pure algorithmic math)',
      'Instant interactive feedback'
    ],
    limitations: [
      'Requires pre-cropped or rectified card coordinates',
      'Dark bordered cards (e.g. Japanese vintage) require dynamic thresholding'
    ],
    suitabilityScore: 92,
    integrationStatus: 'integrated',
    capabilities: [
      'Border Ratio Math',
      'PSA/BGS Standard Tagging',
      'Interactive Grid Overlays'
    ],
    benchmarks: [
      { metric: 'Ratio Computation Time', score: '8ms', target: '<20ms', status: 'passed' },
      { metric: 'Consistency vs Calibration Target', score: '99.9%', target: '>99.5%', status: 'passed' }
    ],
    architectureNotes: 'Powers the VCA interactive Centering Grid in both the Grading Lab and automated VScan stages.',
    lastEvaluated: '2026-08-15'
  },
  {
    id: 'ungraded-fake-db',
    name: 'Ungraded Counterfeit Intelligence Base',
    repo: 'ungraded/fake-card-taxonomy',
    author: 'Ungraded Forensic Research',
    license: 'CC-BY-4.0',
    stars: 410,
    category: 'computer_vision',
    description: 'Forensic counterfeit database capturing microscopic print rosettes, font kerning anomalies, copyright typos, and black core paper layer specifications across 25+ years of Pokémon cards.',
    keyFeatures: [
      'CMYK offset print rosette vs inkjet continuous-tone classifier',
      'Font metrics verification on energy symbols, HP text, and copyright lines',
      'Holographic starburst vs rainbow gradient fake foil discriminator',
      'Black core opacity test rules'
    ],
    strengths: [
      'Highest accuracy on proxy and bootleg detection',
      'Detailed rationale provided for every red-flag finding',
      'Covers vintage Base Set through modern Scarlet & Violet'
    ],
    limitations: [
      'Requires high-resolution macro imagery (>1000px width) for micro-rosette checks'
    ],
    suitabilityScore: 97,
    integrationStatus: 'integrated',
    capabilities: [
      'Micro-rosette Analysis',
      'Font Kerning Forensics',
      'Black Core Validation',
      'Foil Authenticity Check'
    ],
    benchmarks: [
      { metric: 'Counterfeit Detection Rate', score: '98.7%', target: '>95.0%', status: 'passed' },
      { metric: 'False Positive Rate', score: '0.4%', target: '<1.0%', status: 'passed' }
    ],
    architectureNotes: 'Integrated directly into Gemini 3.7 Flash forensic prompt engineering and subgrade validation engine.',
    lastEvaluated: '2026-08-22'
  },
  {
    id: 'pregrader-ml',
    name: 'Pregrader Subgrade Predictor',
    repo: 'pregrader/ai-card-grader',
    author: 'Pregrader Core',
    license: 'GPL-3.0',
    stars: 640,
    category: 'grading_centering',
    description: 'Deep neural network trained on over 250,000 graded card scans predicting PSA and BGS subgrades (Centering, Corners, Edges, Surface) with confidence distributions.',
    keyFeatures: [
      'Independent subgrade estimation from 1.0 to 10.0 in 0.5 increments',
      'Defect penalty attribution model (e.g. -0.5 for silvering, -1.0 for crease)',
      'Ensemble consensus grading with human-in-the-loop override support'
    ],
    strengths: [
      'Trained on extensive real-world PSA/BGS slab population data',
      'Provides explainable reasoning for grade deductions'
    ],
    limitations: [
      'Higher compute requirement for multi-angle surface inspection'
    ],
    suitabilityScore: 89,
    integrationStatus: 'evaluating',
    capabilities: [
      'Subgrade Prediction',
      'Defect Weighting',
      'Grade Confidence Interval'
    ],
    benchmarks: [
      { metric: 'Exact Grade Accuracy', score: '86.2%', target: '>80.0%', status: 'passed' },
      { metric: 'Within ±0.5 Grade', score: '96.8%', target: '>95.0%', status: 'passed' }
    ],
    architectureNotes: 'Used as consensus benchmark against VCA Grader AI recommendations.',
    lastEvaluated: '2026-08-10'
  },
  {
    id: 'pokemon-tcg-data',
    name: 'Pokémon TCG Data Canonical Schema',
    repo: 'PokemonTCG/pokemon-tcg-data',
    author: 'PokemonTCG Org',
    license: 'MIT',
    stars: 1250,
    category: 'dataset_benchmark',
    description: 'The definitive open-source structured dataset of every official Pokémon TCG card release from Base Set (1996) to present, including set IDs, card numbers, artist credits, and rarities.',
    keyFeatures: [
      'Canonical set IDs, release dates, and legal tournament formats',
      'Standardized card naming, variant tags, and card numbering',
      'High-res vector symbol assets and expansion set icons'
    ],
    strengths: [
      '100% complete historical coverage across English, Japanese, and international sets',
      'Widely adopted open-source standard'
    ],
    limitations: [
      'Static data; does not include pricing or grading populations'
    ],
    suitabilityScore: 98,
    integrationStatus: 'integrated',
    capabilities: [
      'Canonical Set Registry',
      'Card ID Resolution',
      'Rarity Indexing'
    ],
    benchmarks: [
      { metric: 'Set Coverage', score: '100%', target: '100%', status: 'passed' },
      { metric: 'Schema Integrity', score: '100%', target: '100%', status: 'passed' }
    ],
    architectureNotes: 'Forms the foundational identity index for VCA card resolution before forensic analysis.',
    lastEvaluated: '2026-08-21'
  },
  {
    id: 'card-market-pipeline',
    name: 'Card Market Data Pipeline',
    repo: 'market-intel/tcg-price-pipeline',
    author: 'Market Intel Group',
    license: 'Apache-2.0',
    stars: 195,
    category: 'market_pricing',
    description: 'ETL pipeline normalizing eBay completed sales, TCGplayer market prices, and Heritage Auctions records with outlier removal and volume weighting.',
    keyFeatures: [
      'Wash-sale & Shill-bid outlier filtering algorithm',
      'Volume-weighted moving average (VWMA) for 7d, 30d, and 90d periods',
      'Strict No-Fake-Data validation policy: displays DATA_UNAVAILABLE when records lack verified transaction hashes'
    ],
    strengths: [
      'Eliminates fake sold listings and unverified auction spikes',
      'Distinguishes raw card sales from graded slab sales accurately'
    ],
    limitations: [
      'Requires daily ingestion runs for active price ticker feeds'
    ],
    suitabilityScore: 93,
    integrationStatus: 'integrated',
    capabilities: [
      'Outlier Filter',
      'VWMA Valuation',
      'Raw vs Graded Spread'
    ],
    benchmarks: [
      { metric: 'Outlier Detection F1', score: '0.94', target: '>0.90', status: 'passed' },
      { metric: 'Price Reconciliation Latency', score: '64ms', target: '<150ms', status: 'passed' }
    ],
    architectureNotes: 'Guarantees adherence to the strict VCA "No Fake Data" rule across all pricing dashboards.',
    lastEvaluated: '2026-08-19'
  },
  {
    id: 'tcg-ar-tracking',
    name: 'TCG-AR Optical Tracking & Hologram Engine',
    repo: 'holo-vision/tcg-ar',
    author: 'HoloVision Lab',
    license: 'MIT',
    stars: 380,
    category: 'computer_vision',
    description: 'Augmented reality surface tracking and dynamic light reflection simulator for verifying holographic foil patterns under moving light sources.',
    keyFeatures: [
      'Specular reflection synthesis for cosmos, starlight, and reverse foil',
      '6-DOF pose estimation relative to camera optical axis',
      'Tamper-evident holographic security label simulation'
    ],
    strengths: [
      'Realistic real-time 3D slab and foil rendering',
      'Helps identify flat print counterfeits that lack true prismatic foil refraction'
    ],
    limitations: [
      'Requires WebGL 2.0 / Three.js hardware acceleration'
    ],
    suitabilityScore: 91,
    integrationStatus: 'integrated',
    capabilities: [
      '3D Slab Rendering',
      'Prismatic Foil Simulation',
      'Optical Pose Tracking'
    ],
    benchmarks: [
      { metric: 'Render Frame Rate', score: '60 FPS', target: '≥60 FPS', status: 'passed' },
      { metric: 'Shader Compilation Time', score: '12ms', target: '<50ms', status: 'passed' }
    ],
    architectureNotes: 'Powers the VCA 3D Slab Interactive viewer with dynamic light refraction and flip rotation.',
    lastEvaluated: '2026-08-16'
  }
];

export const MCP_TOOLS_DEFINITIONS: MCPToolDefinition[] = [
  {
    name: 'psa_cert_lookup',
    title: 'PSA Certificate Lookup',
    sourceRepo: 'seanlok/tcg-mcp',
    category: 'psa_lookup',
    description: 'Lookup official PSA certification records, grade, card details, and verification status by certificate number.',
    parameters: [
      { name: 'certNumber', type: 'string', description: 'The 8-digit PSA certification number (e.g. 68429103)', required: true },
      { name: 'includePopSnapshot', type: 'boolean', description: 'Include population data for this card & grade', required: false, default: true }
    ],
    samplePayload: { certNumber: '68429103', includePopSnapshot: true }
  },
  {
    name: 'psa_pop_snapshot',
    title: 'PSA Population Snapshot',
    sourceRepo: 'seanlok/tcg-mcp',
    category: 'psa_lookup',
    description: 'Query population distribution across grades 1-10 for a specific card identity.',
    parameters: [
      { name: 'cardName', type: 'string', description: 'Card name (e.g. Charizard)', required: true },
      { name: 'setName', type: 'string', description: 'Expansion set name (e.g. Base Set)', required: true },
      { name: 'cardNumber', type: 'string', description: 'Card number (e.g. 4/102)', required: true },
      { name: 'variant', type: 'string', description: 'Variant (e.g. 1st Edition Shadowless)', required: false }
    ],
    samplePayload: { cardName: 'Charizard', setName: 'Base Set', cardNumber: '4/102', variant: '1st Edition Shadowless' }
  },
  {
    name: 'centering_analyzer',
    title: 'Centering Precision Math',
    sourceRepo: 'tcg-tools/centering-analysis-tool',
    category: 'centering',
    description: 'Calculate left/right and top/bottom border widths, ratio percentages, and PSA/BGS qualification levels.',
    parameters: [
      { name: 'leftBorderPx', type: 'number', description: 'Left border thickness in pixels', required: true },
      { name: 'rightBorderPx', type: 'number', description: 'Right border thickness in pixels', required: true },
      { name: 'topBorderPx', type: 'number', description: 'Top border thickness in pixels', required: true },
      { name: 'bottomBorderPx', type: 'number', description: 'Bottom border thickness in pixels', required: true }
    ],
    samplePayload: { leftBorderPx: 48, rightBorderPx: 52, topBorderPx: 50, bottomBorderPx: 50 }
  },
  {
    name: 'ungraded_forensics_scan',
    title: 'Ungraded Counterfeit Forensics',
    sourceRepo: 'ungraded/fake-card-taxonomy',
    category: 'forensics',
    description: 'Perform optical inspection for rosette matrix pattern, font kerning, energy symbol alignment, and black core layer.',
    parameters: [
      { name: 'imageBase64', type: 'string', description: 'Base64 encoded card photo', required: true },
      { name: 'cardHint', type: 'string', description: 'Expected card identity hint', required: false }
    ],
    samplePayload: { cardHint: 'Charizard 4/102 Shadowless', imageBase64: 'data:image/jpeg;base64,...' }
  },
  {
    name: 'tcg_market_pricing',
    title: 'Verified Market Pricing & VWMA',
    sourceRepo: 'market-intel/tcg-price-pipeline',
    category: 'pricing',
    description: 'Retrieve volume-weighted average market pricing for raw or graded cards with wash-sale filtration.',
    parameters: [
      { name: 'cardName', type: 'string', description: 'Card name', required: true },
      { name: 'setName', type: 'string', description: 'Set name', required: true },
      { name: 'grade', type: 'string', description: 'Grade level (e.g. PSA 10, PSA 9, Raw)', required: false, default: 'Raw' }
    ],
    samplePayload: { cardName: 'Charizard', setName: 'Base Set', grade: 'PSA 9' }
  },
  {
    name: 'nfc_cryptographic_bind',
    title: 'NFC Cryptographic Slab Bind',
    sourceRepo: 'vca-authority/nfc-security-core',
    category: 'nfc',
    description: 'Generate collision-resistant cryptographic hash and sign verification record to physical NFC NTAG424 DNA tag.',
    parameters: [
      { name: 'cardCertNumber', type: 'string', description: 'VCA certification number', required: true },
      { name: 'nfcHardwareUid', type: 'string', description: 'NFC chip unique identifier', required: true }
    ],
    samplePayload: { cardCertNumber: 'VCA-2026-894102', nfcHardwareUid: '04:A2:8B:1F:3C:90:80' }
  },
  {
    name: 'github_repo_benchmark',
    title: 'Autonomous Repo Evaluator',
    sourceRepo: 'vca-engineering/benchmark-agent',
    category: 'benchmark',
    description: 'Run automated benchmarking suite against target open-source repository, measuring latency, accuracy, and adapter compatibility.',
    parameters: [
      { name: 'repoId', type: 'string', description: 'Target repo identifier from technology registry', required: true },
      { name: 'testSuite', type: 'string', description: 'Test suite type (e.g. latency, accuracy, full)', required: false, default: 'full' }
    ],
    samplePayload: { repoId: 'tcg-mcp', testSuite: 'full' }
  }
];
