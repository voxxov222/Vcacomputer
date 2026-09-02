import { VirtualFile } from '../types/os';

export const initialVirtualFiles: VirtualFile[] = [
  // Root folders
  {
    id: 'f-workspace',
    name: 'Workspace',
    path: '/Workspace',
    type: 'folder',
    content: '',
    size: 0,
    updatedAt: '2026-08-23T10:00:00.000Z',
    createdAt: '2026-08-20T08:00:00.000Z',
    isSystem: true
  },
  {
    id: 'f-projects',
    name: 'Projects',
    path: '/Workspace/Projects',
    type: 'folder',
    content: '',
    size: 0,
    updatedAt: '2026-08-23T11:00:00.000Z',
    createdAt: '2026-08-20T08:00:00.000Z'
  },
  {
    id: 'f-documents',
    name: 'Documents',
    path: '/Workspace/Documents',
    type: 'folder',
    content: '',
    size: 0,
    updatedAt: '2026-08-23T11:30:00.000Z',
    createdAt: '2026-08-20T08:00:00.000Z'
  },
  {
    id: 'f-research',
    name: 'Research',
    path: '/Workspace/Research',
    type: 'folder',
    content: '',
    size: 0,
    updatedAt: '2026-08-23T12:00:00.000Z',
    createdAt: '2026-08-20T08:00:00.000Z'
  },
  {
    id: 'f-workflows',
    name: 'Workflows',
    path: '/Workspace/Workflows',
    type: 'folder',
    content: '',
    size: 0,
    updatedAt: '2026-08-23T13:00:00.000Z',
    createdAt: '2026-08-20T08:00:00.000Z'
  },
  {
    id: 'f-vca',
    name: 'VCA_Slabs',
    path: '/Workspace/VCA_Slabs',
    type: 'folder',
    content: '',
    size: 0,
    updatedAt: '2026-08-23T14:00:00.000Z',
    createdAt: '2026-08-20T08:00:00.000Z'
  },

  // Sample Documents
  {
    id: 'doc-ai-spec',
    name: 'AI_Work_OS_Architecture.md',
    path: '/Workspace/Documents/AI_Work_OS_Architecture.md',
    type: 'document',
    content: `# AI Work OS - Autonomous Virtual Computer Architecture

## Executive Summary
AI Work OS transforms personal computing by replacing static dashboards with an intelligent multi-agent operating environment. Users instruct the computer via high-level goals ("Research competitors and summarize findings into a spreadsheet"), and specialized agents autonomously plan, execute tools, manipulate virtual files, navigate websites, and report back.

## Key Subsystems
1. **Multi-Agent Orchestration Engine**: Task decomposition, tool calling, human-in-the-loop approval gates.
2. **Persistent Virtual Filesystem**: Unix-like paths with live previewers for Code, Sheets, Slides, and Docs.
3. **Automated Browser Sandboxing**: Headless browser automation layer for web extraction and deep research.
4. **Interactive Terminal**: Sandboxed shell executing system scripts, Python analytics, and Node operations.
5. **RAG & Memory Vault**: Contextual memory layer indexing user decisions and project parameters.
6. **VCA Lab**: Certified Card Authority grading, forensic counterfeit inspection, NFC binding, and 3D slab visualization.
`,
    size: 1420,
    updatedAt: '2026-08-23T13:40:00.000Z',
    createdAt: '2026-08-21T09:00:00.000Z'
  },
  {
    id: 'doc-quarterly-report',
    name: 'Q3_Competitor_Analysis.md',
    path: '/Workspace/Research/Q3_Competitor_Analysis.md',
    type: 'document',
    content: `# Q3 2026 AI Agent & Work OS Market Intelligence

### Key Findings
- **Autonomous Workspaces**: Shift from single-turn chatbots to persistent agent workstations with memory and tools.
- **Computer-Use Agents**: Integration of DOM-level browser navigation and sandboxed code execution.
- **Physical-to-Digital Authentication**: High demand for NFC/QR-linked digital certificates in luxury and collectibles.

### Market Leaders Evaluated
1. Construct Computer (OS-style workspace model)
2. Anthropic Computer-Use Framework
3. VCA Autonomous Authentication Lab
`,
    size: 890,
    updatedAt: '2026-08-23T12:15:00.000Z',
    createdAt: '2026-08-22T10:00:00.000Z'
  },
  {
    id: 'code-agent-runner',
    name: 'orchestrator.ts',
    path: '/Workspace/Projects/orchestrator.ts',
    type: 'code',
    content: `// AI Work OS Multi-Agent Task Orchestrator
import { GoogleGenAI } from '@google/genai';

export interface TaskPlan {
  id: string;
  goal: string;
  steps: { agent: string; action: string; tool: string }[];
}

export async function executePlan(plan: TaskPlan) {
  console.log(\`[Orchestrator] Launching multi-agent plan: \${plan.goal}\`);
  for (const step of plan.steps) {
    console.log(\`-> Invoking [\${step.agent}] with tool [\${step.tool}]\`);
  }
}
`,
    size: 512,
    updatedAt: '2026-08-23T11:20:00.000Z',
    createdAt: '2026-08-22T14:00:00.000Z'
  },
  {
    id: 'sheet-financials',
    name: 'Revenue_Forecast_2026.json',
    path: '/Workspace/Documents/Revenue_Forecast_2026.json',
    type: 'sheet',
    content: JSON.stringify({
      columns: ['Month', 'Grading Submissions', 'NFC Digital Slabs', 'Enterprise API', 'Total Revenue ($)'],
      rows: [
        ['January', 4200, 1850, 12000, 58400],
        ['February', 4800, 2100, 14500, 66300],
        ['March', 5400, 2600, 16000, 75200],
        ['April', 6100, 3100, 19200, 86400],
        ['May', 7200, 3800, 22000, 101800],
        ['June', 8500, 4600, 26500, 121500]
      ]
    }, null, 2),
    size: 680,
    updatedAt: '2026-08-23T10:45:00.000Z',
    createdAt: '2026-08-21T11:00:00.000Z'
  },
  {
    id: 'slide-deck',
    name: 'VCA_Investor_Deck.json',
    path: '/Workspace/Documents/VCA_Investor_Deck.json',
    type: 'slide',
    content: JSON.stringify({
      title: 'VCA OS: The Future of Collectible Authentication',
      slides: [
        {
          title: 'Verified Card Authority (VCA)',
          subtitle: 'The Operating System for Authenticated Collectibles',
          bullets: ['Computer Vision Scanning (VScan)', 'Multi-Signal AI Forensics', 'Cryptographic NFC Hardware Slabs', 'Real-Time Pricing Intelligence']
        },
        {
          title: 'The Problem: $4B Counterfeit Epidemic',
          subtitle: 'Modern fakes fool naked-eye graders',
          bullets: ['Subtle typography and kerning errors', 'Inaccurate holographic foil patterns', 'Middle-layer paper stock deviations', 'Tampered physical slabs']
        },
        {
          title: 'The VCA Solution',
          subtitle: 'Multi-Signal Forensic Pipeline',
          bullets: ['Microscopic optical analysis', 'Dynamic reference database matching', 'Collision-resistant serial & QR verification', 'Tamper-evident Web NFC identity binding']
        }
      ]
    }, null, 2),
    size: 1100,
    updatedAt: '2026-08-23T14:10:00.000Z',
    createdAt: '2026-08-22T16:00:00.000Z'
  }
];
