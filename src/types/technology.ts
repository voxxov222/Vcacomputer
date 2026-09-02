export type TechCategory =
  | 'mcp_server'
  | 'computer_vision'
  | 'grading_centering'
  | 'market_pricing'
  | 'dataset_benchmark'
  | 'game_ai';

export type IntegrationStatus =
  | 'integrated'
  | 'evaluating'
  | 'candidate'
  | 'experimental'
  | 'deprecated';

export interface TechBenchmark {
  metric: string;
  score: string;
  target: string;
  status: 'passed' | 'warning' | 'failed' | 'info';
  latencyMs?: number;
  details?: string;
}

export interface TechRegistryEntry {
  id: string;
  name: string;
  repo: string;
  author: string;
  license: string;
  stars: number;
  category: TechCategory;
  description: string;
  keyFeatures: string[];
  strengths: string[];
  limitations: string[];
  suitabilityScore: number; // 0-100
  integrationStatus: IntegrationStatus;
  capabilities: string[];
  mcpToolsCount?: number;
  benchmarks: TechBenchmark[];
  architectureNotes: string;
  adapterSnippet?: string;
  lastEvaluated: string;
}

export interface MCPToolParam {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: any;
}

export interface MCPToolDefinition {
  name: string;
  title: string;
  sourceRepo: string;
  category: 'psa_lookup' | 'centering' | 'forensics' | 'pricing' | 'nfc' | 'repository' | 'benchmark';
  description: string;
  parameters: MCPToolParam[];
  samplePayload: Record<string, any>;
}

export interface MCPInvocationResult {
  toolName: string;
  timestamp: string;
  executionTimeMs: number;
  status: 'success' | 'error';
  data: any;
  rawJson: string;
}

export interface EngineeringTaskLog {
  id: string;
  timestamp: string;
  step: string;
  level: 'info' | 'warn' | 'success' | 'error';
  message: string;
}

export interface EngineeringAgentRun {
  id: string;
  objective: string;
  targetRepoId?: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  logs: EngineeringTaskLog[];
  generatedCode?: string;
  generatedFileName?: string;
  diffSummary?: string;
  benchmarkResult?: {
    accuracy: number;
    latencyMs: number;
    testCasesPassed: number;
    totalTestCases: number;
  };
  executiveSummary?: string;
}

export interface ForensicStage1Identity {
  name: string;
  set: string;
  cardNumber: string;
  year: number;
  rarity: string;
  language: string;
  confidence: number;
}

export interface ForensicStage2Variant {
  variant: string;
  foilType: string;
  stampType: string;
  textureVerified: boolean;
  shadowlessConfirmed?: boolean;
  confidence: number;
}

export interface ForensicStage3Authentication {
  status: 'AUTHENTIC' | 'COUNTERFEIT' | 'SUSPICIOUS' | 'INCONCLUSIVE';
  confidenceScore: number;
  rosetteMatrixPassed: boolean;
  fontKerningPassed: boolean;
  blackCoreLayerPassed: boolean;
  copyrightSpacingPassed: boolean;
  findings: string[];
}

export interface ForensicStage4Centering {
  leftRatio: number;
  rightRatio: number;
  topRatio: number;
  bottomRatio: number;
  frontRatioLabel: string;
  backRatioLabel?: string;
  centeringSubgrade: number;
  meetsGemMint10Standard: boolean; // 55/45 or better
  meetsMint9Standard: boolean; // 60/40 or better
}

export interface ForensicStage5Grading {
  overallGrade: number;
  gradeLabel: string;
  subgrades: {
    centering: number;
    corners: number;
    edges: number;
    surface: number;
  };
  consensusSummary: string;
}

export interface ForensicStage6MarketPSA {
  psaCertNumber?: string;
  psaStatus: 'VERIFIED' | 'NOT_FOUND' | 'DATA_UNAVAILABLE';
  psaPopulation?: number;
  psaHigherPop?: number;
  fairMarketValueUSD?: number;
  isPriceEstimate: boolean;
  verifiedSales: {
    date: string;
    venue: string;
    grade: string;
    priceUSD: number;
    txHash?: string;
  }[];
}

export interface FullForensicPipelineResult {
  id: string;
  timestamp: string;
  stage1Identity: ForensicStage1Identity;
  stage2Variant: ForensicStage2Variant;
  stage3Auth: ForensicStage3Authentication;
  stage4Centering: ForensicStage4Centering;
  stage5Grading: ForensicStage5Grading;
  stage6Market: ForensicStage6MarketPSA;
}
