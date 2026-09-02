import {
  AgentProfile,
  AIMemoryItem,
  CalendarEvent,
  EmailItem,
  KanbanTask,
  KnowledgeDoc,
  VcaCardRecord,
  WorkflowItem,
  AgentTask
} from '../types/os';

export const initialAgents: AgentProfile[] = [
  {
    id: 'agent-orchestrator',
    name: 'Command Orchestrator',
    role: 'Lead AI Director',
    avatar: 'Bot',
    color: '#06b6d4',
    status: 'idle',
    description: 'Decomposes complex objectives, provisions specialized workers, and verifies quality.',
    tools: ['task_decompose', 'delegate_task', 'request_approval', 'synthesize_results']
  },
  {
    id: 'agent-researcher',
    name: 'Deep Research Agent',
    role: 'Web & Intelligence Specialist',
    avatar: 'Search',
    color: '#3b82f6',
    status: 'idle',
    description: 'Searches the web, crawls multi-page sources, extracts structured facts, and compiles cited dossiers.',
    tools: ['google_search', 'crawl_page', 'extract_tables', 'verify_citations']
  },
  {
    id: 'agent-developer',
    name: 'Developer Agent',
    role: 'Full-Stack Software Engineer',
    avatar: 'Code2',
    color: '#10b981',
    status: 'idle',
    description: 'Writes, inspects, executes, debugs code, and provisions micro-apps.',
    tools: ['write_code', 'run_terminal', 'git_commit', 'debug_syntax', 'deploy_sandbox']
  },
  {
    id: 'agent-browser',
    name: 'Browser Automation Agent',
    role: 'Computer-Use Navigator',
    avatar: 'Globe',
    color: '#8b5cf6',
    status: 'idle',
    description: 'Automates interactive DOM navigation, form submissions, screenshots, and visual page audits.',
    tools: ['navigate_url', 'click_element', 'type_input', 'capture_screenshot', 'extract_dom']
  },
  {
    id: 'agent-data',
    name: 'Data & Finance Agent',
    role: 'Quantitative Analyst',
    avatar: 'BarChart3',
    color: '#f59e0b',
    status: 'idle',
    description: 'Processes spreadsheets, evaluates pricing models, computes CAGR, and visualizes charts.',
    tools: ['analyze_csv', 'compute_formula', 'generate_chart', 'predict_trends']
  },
  {
    id: 'agent-writer',
    name: 'Writer & Executive Agent',
    role: 'Content & Communications Lead',
    avatar: 'FileText',
    color: '#ec4899',
    status: 'idle',
    description: 'Drafts executive briefs, presentations, email responses, and marketing assets.',
    tools: ['draft_doc', 'summarize_inbox', 'format_slides', 'translate_tone']
  },
  {
    id: 'agent-vca',
    name: 'VCA Forensic Agent',
    role: 'Collectible Authentication Specialist',
    avatar: 'ShieldCheck',
    color: '#14b8a6',
    status: 'idle',
    description: 'Performs multi-signal card authentication, micro-printing audits, centering math, and NFC binding.',
    tools: ['vscan_identify', 'auth_forensics', 'centering_calc', 'nfc_bind', 'generate_cert']
  }
];

export const initialMemories: AIMemoryItem[] = [
  {
    id: 'mem-1',
    category: 'preference',
    content: 'User prefers concise, bulleted executive summaries with high-contrast UI and keyboard navigation.',
    confidence: 0.98,
    source: 'System Initialization',
    createdAt: '2026-08-20T10:00:00.000Z'
  },
  {
    id: 'mem-2',
    category: 'project',
    content: 'VCA OS project goals: integrate real computer vision scanning, 3D interactive slab inspection, and collision-resistant serials.',
    confidence: 0.99,
    source: 'VCA Architecture Spec',
    createdAt: '2026-08-21T14:30:00.000Z'
  },
  {
    id: 'mem-3',
    category: 'decision',
    content: 'All dangerous operations (sending external emails, overwriting prod files, permanent deletes) require explicit Human Approval gate.',
    confidence: 1.0,
    source: 'Security Policy',
    createdAt: '2026-08-22T09:15:00.000Z'
  },
  {
    id: 'mem-4',
    category: 'fact',
    content: 'Standard Pokemon TCG physical dimensions are 63.5 mm x 88.9 mm with a dark middle opaque core on English genuine prints.',
    confidence: 0.97,
    source: 'Ungraded Forensics Database',
    createdAt: '2026-08-23T08:00:00.000Z'
  }
];

export const initialKnowledge: KnowledgeDoc[] = [
  {
    id: 'kb-1',
    title: 'Ungraded Counterfeit Detection Guide: Pokemon TCG',
    category: 'Authentication',
    summary: 'Comprehensive forensic signals for identifying counterfeit trading cards based on typography, holo patterns, and paper stock.',
    content: `Forensic Checklist for Pokemon Card Authentication:
1. Typography & Kerning: Inspect 'a', 'g', 'q' font curves and spacing. Fakes often use generic Arial/Helvetica rather than custom Nintendo fonts.
2. Energy Symbols: Center alignment of icons inside the circle. Counterfeits have offset or blurry glyphs.
3. Card Back Forensics: Blue swirl integrity and Pokemon logo saturation. Genuine cards have rich navy/cobalt gradients without flat pixelation.
4. Three-Layer Core: English genuine cards feature a dark black-gray core sandwiched between outer layers.
5. Holo Reflection Dynamics: Diagonal vs vertical sheen patterns. Genuine vintage foils show star/cosmos patterns rather than uniform rainbow sheen.`,
    tags: ['pokemon', 'authentication', 'vca', 'forensics', 'holo'],
    sourceUrl: 'https://www.ungraded.com/fake-card-database/how-to-spot-fake-pokemon-cards/',
    updatedAt: '2026-08-23T11:00:00.000Z'
  },
  {
    id: 'kb-2',
    title: 'Construct Computer Interaction & AI Work OS Paradigm',
    category: 'Operating Systems',
    summary: 'Principles of persistent AI-operated virtual computers with desktop windowing, background agents, and tool execution.',
    content: `Construct Computer Model Principles:
- Persistent workspace that survives browser refreshes.
- Natural language command center converting intentions into multi-step execution plans.
- Direct manipulation of real files, web browsers, and sandboxed terminal environments.
- Continuous observability: every agent action produces an auditable event with live streaming logs.`,
    tags: ['construct', 'ai_os', 'agents', 'architecture'],
    sourceUrl: 'https://os.construct.computer/',
    updatedAt: '2026-08-22T15:30:00.000Z'
  }
];

export const initialWorkflows: WorkflowItem[] = [
  {
    id: 'wf-market-monitor',
    name: 'Daily Collectible Market Scanner & Report',
    description: 'Monitors TCG market trends every morning, calculates price index deltas, and updates the portfolio sheet.',
    schedule: '0 8 * * 1-5',
    isActive: true,
    nodes: [
      { id: 'n1', type: 'trigger', label: 'Cron: Mon-Fri at 8:00 AM', config: { cron: '0 8 * * 1-5' }, position: { x: 50, y: 120 } },
      { id: 'n2', type: 'browser_action', label: 'Crawl Price Aggregators', config: { target: 'tcg_index' }, position: { x: 280, y: 120 } },
      { id: 'n3', type: 'ai_action', label: 'Evaluate Volatility & Outliers', config: { agent: 'agent-data' }, position: { x: 520, y: 120 } },
      { id: 'n4', type: 'file_action', label: 'Update Revenue_Forecast.json', config: { file: '/Workspace/Documents/Revenue_Forecast_2026.json' }, position: { x: 760, y: 120 } },
      { id: 'n5', type: 'notification', label: 'Send Executive Briefing', config: { channel: 'system_notification' }, position: { x: 1000, y: 120 } }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n4' },
      { id: 'e4', source: 'n4', target: 'n5' }
    ],
    lastRunStatus: 'success',
    lastRunAt: '2026-08-23T08:00:15.000Z'
  },
  {
    id: 'wf-vca-pipeline',
    name: 'VCA Autonomous Ingestion & Grading Pipeline',
    description: 'Automates raw scan ingestion -> optical OCR -> counterfeit checks -> preliminary grade calculation -> certificate generation.',
    schedule: 'On Card Upload',
    isActive: true,
    nodes: [
      { id: 'vn1', type: 'trigger', label: 'On New Card Scan (VScan)', config: { event: 'vscan_capture' }, position: { x: 50, y: 100 } },
      { id: 'vn2', type: 'ai_action', label: 'VCA Forensic Multi-Signal Audit', config: { agent: 'agent-vca' }, position: { x: 280, y: 100 } },
      { id: 'vn3', type: 'condition', label: 'Confidence >= 90%?', config: { threshold: 0.9 }, position: { x: 520, y: 100 } },
      { id: 'vn4', type: 'ai_action', label: 'Calculate Subgrades & Centering', config: { agent: 'agent-vca' }, position: { x: 760, y: 60 } },
      { id: 'vn5', type: 'api_call', label: 'Bind Cryptographic NFC Record', config: { target: 'nfc_registry' }, position: { x: 1000, y: 60 } }
    ],
    edges: [
      { id: 've1', source: 'vn1', target: 'vn2' },
      { id: 've2', source: 'vn2', target: 'vn3' },
      { id: 've3', source: 'vn3', target: 'vn4', label: 'Yes' },
      { id: 've4', source: 'vn4', target: 'vn5' }
    ],
    lastRunStatus: 'success',
    lastRunAt: '2026-08-23T13:20:00.000Z'
  }
];

export const initialEmails: EmailItem[] = [
  {
    id: 'mail-1',
    from: 'submissions@vca-authority.com',
    fromName: 'VCA Intake Operations',
    to: 'operator@ai-work-os.local',
    subject: 'Submission Batch #VCA-2026-00128 Received (25 Items)',
    preview: '25 high-grade vintage cards have arrived at the secure vault for multi-angle scanning and authentication.',
    body: `Hello Team,

Submission batch #VCA-2026-00128 containing 25 cards has passed physical intake check-in at Vault Station B.
Notable items include:
- 1x 1st Edition Shadowless Charizard #4/102
- 2x Lugia Neo Genesis Holo #9/111
- 1x Gold Star Rayquaza EX Deoxys #107/107

Ready for automated VScan imaging, forensic AI verification, and NFC encapsulation.`,
    date: '10:42 AM',
    isRead: false,
    isStarred: true,
    isUrgent: true,
    folder: 'inbox',
    aiSummary: 'Batch of 25 high-value vintage cards received. Awaiting VScan optical analysis and NFC grading.',
    aiSuggestedReply: 'Initiating automated VScan ingestion pipeline for batch #VCA-2026-00128 now.'
  },
  {
    id: 'mail-2',
    from: 'investors@apex-ventures.io',
    fromName: 'Sarah Lin (Apex Ventures)',
    to: 'operator@ai-work-os.local',
    subject: 'Follow-up: Autonomous AI Work OS Demo',
    preview: 'Impressed by the multi-agent browser and terminal execution capabilities during yesterday’s walkthrough.',
    body: `Hi team,

Thank you for walking us through AI Work OS yesterday. The live multi-agent orchestration alongside real browser execution and sandboxed IDE was genuinely impressive.
Could you share the updated Q3 revenue model and presentation deck?

Best regards,
Sarah Lin`,
    date: 'Yesterday',
    isRead: true,
    isStarred: false,
    folder: 'inbox',
    aiSummary: 'Investor request for Q3 financial model and pitch presentation deck.',
    aiSuggestedReply: 'Hi Sarah, attaching our Revenue_Forecast_2026.json and VCA_Investor_Deck.json directly from our virtual workspace.'
  }
];

export const initialCalendarEvents: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Daily AI Multi-Agent Sync',
    description: 'Review autonomous workflow executions, failed job checkpoints, and approval queue.',
    start: '2026-08-23T09:00:00',
    end: '2026-08-23T09:30:00',
    location: 'Virtual Command Center',
    category: 'agent_run'
  },
  {
    id: 'cal-2',
    title: 'VCA High-Value Slabs QC Review',
    description: 'Expert human validation for subgrade outliers and holographic foil forensic audits.',
    start: '2026-08-23T14:00:00',
    end: '2026-08-23T15:00:00',
    location: 'Lab Room 4',
    category: 'work'
  },
  {
    id: 'cal-3',
    title: 'Autonomous Competitor Crawler Run',
    description: 'Scheduled multi-agent deep research on AI computer platforms.',
    start: '2026-08-23T16:30:00',
    end: '2026-08-23T17:00:00',
    category: 'agent_run'
  }
];

export const initialKanbanTasks: KanbanTask[] = [
  {
    id: 't-1',
    title: 'Process Batch #VCA-2026-00128 Intake',
    description: 'Run optical camera VScan, check front/back centering, and compute authenticity score.',
    status: 'in_progress',
    priority: 'urgent',
    assignedAgent: 'VCA Forensic Agent',
    dueDate: 'Today',
    tags: ['VCA', 'Forensics', 'Scanning']
  },
  {
    id: 't-2',
    title: 'Generate Q3 Competitor Intelligence Dossier',
    description: 'Gather web sources, compare Construct Computer vs AI Work OS architecture, and export PDF.',
    status: 'todo',
    priority: 'high',
    assignedAgent: 'Deep Research Agent',
    dueDate: 'Tomorrow',
    tags: ['Research', 'Intelligence']
  },
  {
    id: 't-3',
    title: 'Verify Cryptographic NFC Encapsulation Slabs',
    description: 'Read NTAG215 hardware chips to ensure collision-resistant UUIDs match Firestore records.',
    status: 'review',
    priority: 'medium',
    assignedAgent: 'VCA Forensic Agent',
    dueDate: 'Aug 24',
    tags: ['NFC', 'Hardware', 'Security']
  },
  {
    id: 't-4',
    title: 'Sandbox Container Memory Optimization',
    description: 'Improve virtual filesystem I/O latency for multi-agent parallel reads.',
    status: 'done',
    priority: 'low',
    assignedAgent: 'Developer Agent',
    dueDate: 'Aug 22',
    tags: ['Backend', 'Performance']
  }
];

export const initialVcaCards: VcaCardRecord[] = [
  {
    id: 'vca-card-magnezone',
    name: 'Magnezone',
    set: 'Crown Zenith (Galarian Gallery)',
    cardNumber: 'GG18/GG70',
    year: 2023,
    language: 'English',
    variant: 'Full Art Holo (Galarian Gallery GG18)',
    rarity: 'Special Illustration Rare',
    grade: 9.0,
    gradeLabel: 'MINT 9.0',
    subgrades: {
      centering: 9.5,
      corners: 9.0,
      edges: 9.0,
      surface: 9.0
    },
    certificationNumber: 'PSA-151323573',
    serialNumber: 'SN-2023-151323573',
    nfcId: '04:51:32:35:73:10:88',
    qrId: 'https://vca-authority.com/verify/PSA-151323573',
    nfcStatus: 'verified',
    authStatus: 'authentic',
    authConfidence: 0.994,
    marketPrice: 42.00,
    frontImage: 'https://images.pokemontcg.io/swsh12pt5gg/GG18_hires.png',
    backImage: 'https://images.pokemontcg.io/swsh12pt5gg/GG18_hires.png',
    defects: [],
    createdAt: '2026-08-30T10:00:00.000Z'
  },
  {
    id: 'vca-card-arceus-ar5',
    name: 'Arceus',
    set: 'Platinum: Arceus',
    cardNumber: 'AR5',
    year: 2009,
    language: 'English',
    variant: 'Colorless Holofoil (AR5)',
    rarity: 'Rare Holo (AR)',
    grade: 9.5,
    gradeLabel: 'GEM MINT 9.5',
    subgrades: {
      centering: 9.5,
      corners: 9.5,
      edges: 9.5,
      surface: 9.5
    },
    certificationNumber: 'VCA-2026-094109',
    serialNumber: 'SN-2009-04109005',
    nfcId: '04:99:AR:CE:US:05:22',
    qrId: 'https://vca-authority.com/verify/VCA-2026-094109',
    nfcStatus: 'verified',
    authStatus: 'authentic',
    authConfidence: 0.996,
    marketPrice: 385.00,
    frontImage: 'https://images.pokemontcg.io/pl4/AR5_hires.png',
    backImage: 'https://images.pokemontcg.io/pl4/AR5_hires.png',
    defects: [],
    createdAt: '2026-08-28T14:00:00.000Z'
  },
  {
    id: 'vca-card-000',
    name: 'Alakazam EX',
    set: 'XY - Fates Collide',
    cardNumber: '125/124',
    year: 2016,
    language: 'English',
    variant: 'Secret Rare Full Art (Gold Border / Umbreon Cameo)',
    rarity: 'Secret Rare',
    grade: 9.5,
    gradeLabel: 'GEM MINT 9.5',
    subgrades: {
      centering: 9.5,
      corners: 9.5,
      edges: 9.5,
      surface: 9.5
    },
    certificationNumber: 'VCA-2026-125124',
    serialNumber: 'SN-2026-08125124',
    nfcId: '04:88:C1:25:12:40:99',
    qrId: 'https://vca-authority.com/verify/VCA-2026-125124',
    nfcStatus: 'verified',
    authStatus: 'authentic',
    authConfidence: 0.992,
    marketPrice: 256.00,
    frontImage: 'https://images.pokemontcg.io/xy10/125_hires.png',
    backImage: 'https://images.pokemontcg.io/back.png',
    defects: [],
    createdAt: '2026-08-26T16:00:00.000Z'
  },
  {
    id: 'vca-card-001',
    name: 'Charizard (Shadowless)',
    set: 'Base Set (1st Edition)',
    cardNumber: '4/102',
    year: 1999,
    language: 'English',
    variant: 'Holo 1st Edition',
    rarity: 'Rare Holo',
    grade: 9.5,
    gradeLabel: 'GEM MINT+',
    subgrades: {
      centering: 9.5,
      corners: 9.5,
      edges: 9.5,
      surface: 10.0
    },
    certificationNumber: 'VCA-9884210',
    serialNumber: 'SN-2026-09884210',
    nfcId: '04:7A:B2:9C:3F:81:80',
    qrId: 'https://vca-authority.com/verify/VCA-9884210',
    nfcStatus: 'verified',
    authStatus: 'authentic',
    authConfidence: 0.994,
    marketPrice: 18500,
    frontImage: 'https://images.pokemontcg.io/base1/4_hires.png',
    backImage: 'https://images.pokemontcg.io/back.png',
    defects: [
      {
        id: 'd1',
        type: 'Centering (L/R 52/48)',
        severity: 'minor',
        x: 12,
        y: 45,
        note: 'Microscopic 52/48 horizontal variance within Gem Mint tolerance.'
      }
    ],
    createdAt: '2026-08-23T11:15:00.000Z'
  },
  {
    id: 'vca-card-002',
    name: 'Lugia (Cosmos Holo)',
    set: 'Neo Genesis',
    cardNumber: '9/111',
    year: 2000,
    language: 'English',
    variant: '1st Edition Holo',
    rarity: 'Rare Holo',
    grade: 10.0,
    gradeLabel: 'PRISTINE 10',
    subgrades: {
      centering: 10.0,
      corners: 10.0,
      edges: 10.0,
      surface: 10.0
    },
    certificationNumber: 'VCA-9921405',
    serialNumber: 'SN-2026-09921405',
    nfcId: '04:1E:58:AA:77:22:90',
    qrId: 'https://vca-authority.com/verify/VCA-9921405',
    nfcStatus: 'verified',
    authStatus: 'authentic',
    authConfidence: 0.998,
    marketPrice: 32000,
    frontImage: 'https://images.pokemontcg.io/neo1/9_hires.png',
    backImage: 'https://images.pokemontcg.io/back.png',
    defects: [],
    createdAt: '2026-08-23T12:00:00.000Z'
  },
  {
    id: 'vca-card-003',
    name: 'Rayquaza (Gold Star)',
    set: 'EX Deoxys',
    cardNumber: '107/107',
    year: 2005,
    language: 'English',
    variant: 'Ultra Rare Holo',
    rarity: 'Ultra Rare',
    grade: 9.0,
    gradeLabel: 'MINT 9',
    subgrades: {
      centering: 9.0,
      corners: 9.5,
      edges: 9.0,
      surface: 9.0
    },
    certificationNumber: 'VCA-9451120',
    serialNumber: 'SN-2026-09451120',
    nfcId: '04:BB:CC:11:44:88:99',
    qrId: 'https://vca-authority.com/verify/VCA-9451120',
    nfcStatus: 'bound',
    authStatus: 'authentic',
    authConfidence: 0.989,
    marketPrice: 24500,
    frontImage: 'https://images.pokemontcg.io/ex8/107_hires.png',
    backImage: 'https://images.pokemontcg.io/back.png',
    defects: [
      {
        id: 'd2',
        type: 'Top-Right Corner Whitening',
        severity: 'minor',
        x: 88,
        y: 8,
        note: '0.1mm foil edge reflection visible under 40x macro.'
      }
    ],
    createdAt: '2026-08-23T13:45:00.000Z'
  }
];

export const initialRecentTasks: AgentTask[] = [
  {
    id: 'task-101',
    objective: 'Crawl Q3 competitor landscape and update market report',
    primaryAgent: 'Deep Research Agent',
    status: 'completed',
    progress: 100,
    createdAt: '2026-08-23T12:00:00.000Z',
    completedAt: '2026-08-23T12:02:30.000Z',
    resultSummary: 'Analyzed 18 web sources, extracted key product features, and saved dossier to /Workspace/Research/Q3_Competitor_Analysis.md.',
    steps: [
      { id: 's1', title: 'Parse search query for competitor benchmarks', agent: 'Command Orchestrator', status: 'completed', timestamp: '12:00:02' },
      { id: 's2', title: 'Execute Google Search grounding & crawl websites', agent: 'Deep Research Agent', tool: 'google_search', status: 'completed', timestamp: '12:00:45' },
      { id: 's3', title: 'Synthesize findings and generate citations', agent: 'Deep Research Agent', status: 'completed', timestamp: '12:01:30' },
      { id: 's4', title: 'Write report file to virtual filesystem', agent: 'Writer & Executive Agent', tool: 'write_file', status: 'completed', timestamp: '12:02:30' }
    ]
  },
  {
    id: 'task-102',
    objective: 'Run VCA optical forensic scan on Charizard #4/102',
    primaryAgent: 'VCA Forensic Agent',
    status: 'completed',
    progress: 100,
    createdAt: '2026-08-23T13:30:00.000Z',
    completedAt: '2026-08-23T13:31:15.000Z',
    resultSummary: 'Verified genuine shadowless print (99.4% confidence). Centering 52/48. VCA Grade assigned: GEM MINT 9.5. NFC chip bound.',
    steps: [
      { id: 'vs1', title: 'Capture high-res optical image from VScan', agent: 'VCA Forensic Agent', status: 'completed', timestamp: '13:30:05' },
      { id: 'vs2', title: 'Perform text, holo, and middle-layer forensic checks', agent: 'VCA Forensic Agent', tool: 'auth_forensics', status: 'completed', timestamp: '13:30:35' },
      { id: 'vs3', title: 'Calculate subgrades and detect surface micro-defects', agent: 'VCA Forensic Agent', tool: 'centering_calc', status: 'completed', timestamp: '13:30:55' },
      { id: 'vs4', title: 'Generate collision-resistant serial & bind NFC tag', agent: 'VCA Forensic Agent', tool: 'nfc_bind', status: 'completed', timestamp: '13:31:15' }
    ]
  }
];
