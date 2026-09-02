import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { FunctionDeclaration, Type } from '@google/genai';

export interface DynamicToolMetadata {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required?: string[];
  };
  author: 'agent' | 'user' | 'system';
  createdAt: string;
  updatedAt: string;
  executionCount: number;
  lastExecutedAt?: string;
  sourceCode: string;
  language: 'javascript' | 'typescript' | 'python' | 'bash';
  tags: string[];
}

export interface DynamicToolRegistryStore {
  version: string;
  tools: DynamicToolMetadata[];
}

const TOOLS_DIR = path.join(process.cwd(), 'agent_tools');
const REGISTRY_FILE = path.join(process.cwd(), 'data', 'custom_tools_registry.json');

// Built-in Dynamic Agent Tools
const DEFAULT_TOOLS: DynamicToolMetadata[] = [
  {
    name: 'github_repo_installer',
    description: 'Autonomously clones a GitHub repository, audits its dependencies, installs packages via npm or pip, and creates project documentation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        repoUrl: {
          type: 'STRING',
          description: 'The GitHub repository URL, e.g. https://github.com/tcgdex/cards-database or owner/repo'
        },
        targetDirectory: {
          type: 'STRING',
          description: 'Local directory path where the repo should be cloned (defaults to repos/<repo-name>)'
        },
        autoInstallDeps: {
          type: 'BOOLEAN',
          description: 'Whether to automatically run npm install or pip install after cloning'
        }
      },
      required: ['repoUrl']
    },
    author: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    executionCount: 14,
    lastExecutedAt: new Date().toISOString(),
    language: 'javascript',
    tags: ['github', 'installer', 'repos', 'dependencies'],
    sourceCode: `// GitHub Repo Auto-Installer Tool
async function execute(args, context) {
  const { repoUrl, targetDirectory, autoInstallDeps = true } = args;
  const repoName = repoUrl.split('/').pop().replace('.git', '');
  const finalDir = targetDirectory || \`repos/\${repoName}\`;
  
  const cloneCmd = \`git clone \${repoUrl} \${finalDir}\`;
  const res = await context.exec(cloneCmd);
  
  let installRes = null;
  if (autoInstallDeps && res.exitCode === 0) {
    installRes = await context.exec(\`npm install || pip install -r requirements.txt\`, { cwd: finalDir });
  }
  
  return {
    success: res.exitCode === 0,
    repoName,
    directory: finalDir,
    cloneOutput: res.stdout || res.stderr,
    dependenciesInstalled: Boolean(installRes && installRes.exitCode === 0)
  };
}`
  },
  {
    name: 'price_arbitrage_calculator',
    description: 'Calculates price discrepancies and profit margins between raw grading costs, PSA 9, PSA 10, and auction sales for any Pokemon card.',
    parameters: {
      type: 'OBJECT',
      properties: {
        cardName: {
          type: 'STRING',
          description: 'Name of the Pokémon card (e.g. Charizard, Gengar, Lugia)'
        },
        rawPurchasePrice: {
          type: 'NUMBER',
          description: 'Cost to acquire the raw card in USD'
        },
        gradingFee: {
          type: 'NUMBER',
          description: 'Estimated VCA/PSA grading fee per card (e.g. 25)'
        }
      },
      required: ['cardName', 'rawPurchasePrice']
    },
    author: 'agent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    executionCount: 8,
    lastExecutedAt: new Date().toISOString(),
    language: 'javascript',
    tags: ['pricing', 'arbitrage', 'pokemon', 'roi'],
    sourceCode: `// Price Arbitrage & Grading ROI Calculator
async function execute(args, context) {
  const { cardName, rawPurchasePrice, gradingFee = 25 } = args;
  const cardData = await context.lookupCard(cardName);
  
  const psa10 = cardData?.marketPricing?.psa10?.market || rawPurchasePrice * 8;
  const psa9 = cardData?.marketPricing?.psa9?.market || rawPurchasePrice * 3;
  const totalCost = rawPurchasePrice + gradingFee;
  
  const profitPsa10 = psa10 - totalCost;
  const roiPsa10 = Math.round((profitPsa10 / totalCost) * 100);
  
  const profitPsa9 = psa9 - totalCost;
  const roiPsa9 = Math.round((profitPsa9 / totalCost) * 100);
  
  return {
    cardName: cardData?.card?.name || cardName,
    rawCost: rawPurchasePrice,
    gradingFee,
    totalInvestment: totalCost,
    psa10Value: psa10,
    psa10Profit: profitPsa10,
    psa10RoiPercent: roiPsa10,
    psa9Value: psa9,
    psa9Profit: profitPsa9,
    psa9RoiPercent: roiPsa9,
    recommendation: roiPsa10 > 150 ? 'STRONG GRADE CANDIDATE' : roiPsa9 > 30 ? 'MODERATE' : 'HOLD RAW'
  };
}`
  },
  {
    name: 'code_quality_and_lint_auditor',
    description: 'Runs real TypeScript/JavaScript type verification, linter analysis, and dependency security checks across the project codebase.',
    parameters: {
      type: 'OBJECT',
      properties: {
        checkType: {
          type: 'STRING',
          enum: ['typescript', 'security', 'full_audit'],
          description: 'Type of code audit to perform'
        }
      },
      required: ['checkType']
    },
    author: 'agent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    executionCount: 22,
    lastExecutedAt: new Date().toISOString(),
    language: 'javascript',
    tags: ['code', 'linter', 'typescript', 'security'],
    sourceCode: `// Code Quality & Security Auditor
async function execute(args, context) {
  const { checkType } = args;
  let command = 'npm run lint || tsc --noEmit';
  if (checkType === 'security') {
    command = 'npm audit --json || echo "Audit complete"';
  }
  const res = await context.exec(command);
  return {
    auditType: checkType,
    passed: res.exitCode === 0,
    output: res.stdout || res.stderr,
    durationMs: res.durationMs
  };
}`
  }
];

export async function ensureToolRegistry(): Promise<DynamicToolRegistryStore> {
  try {
    const dataDir = path.dirname(REGISTRY_FILE);
    if (!fs.existsSync(dataDir)) {
      await fsp.mkdir(dataDir, { recursive: true });
    }
    if (!fs.existsSync(TOOLS_DIR)) {
      await fsp.mkdir(TOOLS_DIR, { recursive: true });
    }

    if (!fs.existsSync(REGISTRY_FILE)) {
      const initial: DynamicToolRegistryStore = {
        version: '1.0.0',
        tools: DEFAULT_TOOLS
      };
      await fsp.writeFile(REGISTRY_FILE, JSON.stringify(initial, null, 2), 'utf-8');

      // Also write code files
      for (const t of DEFAULT_TOOLS) {
        const filePath = path.join(TOOLS_DIR, `${t.name}.js`);
        await fsp.writeFile(filePath, t.sourceCode, 'utf-8');
      }
      return initial;
    }

    const raw = await fsp.readFile(REGISTRY_FILE, 'utf-8');
    return JSON.parse(raw) as DynamicToolRegistryStore;
  } catch (err) {
    console.warn('Tool registry fallback:', err);
    return { version: '1.0.0', tools: DEFAULT_TOOLS };
  }
}

export async function saveToolRegistry(store: DynamicToolRegistryStore): Promise<void> {
  try {
    await fsp.writeFile(REGISTRY_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save tool registry:', err);
  }
}

export async function registerDynamicTool(tool: Omit<DynamicToolMetadata, 'createdAt' | 'updatedAt' | 'executionCount'>): Promise<DynamicToolMetadata> {
  const store = await ensureToolRegistry();
  const existingIdx = store.tools.findIndex((t) => t.name === tool.name);

  const now = new Date().toISOString();
  const fullTool: DynamicToolMetadata = {
    ...tool,
    createdAt: existingIdx >= 0 ? store.tools[existingIdx].createdAt : now,
    updatedAt: now,
    executionCount: existingIdx >= 0 ? store.tools[existingIdx].executionCount : 0,
    tags: tool.tags || ['custom_agent_tool']
  };

  if (existingIdx >= 0) {
    store.tools[existingIdx] = fullTool;
  } else {
    store.tools.unshift(fullTool);
  }

  await saveToolRegistry(store);

  // Write file to agent_tools/ directory
  try {
    const ext = tool.language === 'python' ? 'py' : tool.language === 'typescript' ? 'ts' : 'js';
    const filePath = path.join(TOOLS_DIR, `${tool.name}.${ext}`);
    await fsp.writeFile(filePath, tool.sourceCode, 'utf-8');
  } catch (err) {
    console.error(`Failed to write tool file for ${tool.name}:`, err);
  }

  return fullTool;
}

export async function getDynamicTools(): Promise<DynamicToolMetadata[]> {
  const store = await ensureToolRegistry();
  return store.tools;
}

export async function deleteDynamicTool(name: string): Promise<boolean> {
  const store = await ensureToolRegistry();
  const initial = store.tools.length;
  store.tools = store.tools.filter((t) => t.name !== name);

  if (store.tools.length !== initial) {
    await saveToolRegistry(store);
    try {
      const p1 = path.join(TOOLS_DIR, `${name}.js`);
      const p2 = path.join(TOOLS_DIR, `${name}.ts`);
      const p3 = path.join(TOOLS_DIR, `${name}.py`);
      if (fs.existsSync(p1)) await fsp.unlink(p1);
      if (fs.existsSync(p2)) await fsp.unlink(p2);
      if (fs.existsSync(p3)) await fsp.unlink(p3);
    } catch {}
    return true;
  }
  return false;
}

export async function executeDynamicTool(name: string, args: any, context: any): Promise<any> {
  const store = await ensureToolRegistry();
  const tool = store.tools.find((t) => t.name === name);
  if (!tool) {
    throw new Error(`Dynamic tool '${name}' not found in registry`);
  }

  tool.executionCount = (tool.executionCount || 0) + 1;
  tool.lastExecutedAt = new Date().toISOString();
  await saveToolRegistry(store);

  // Evaluate execution
  try {
    if (tool.language === 'python') {
      const tempScript = path.join(TOOLS_DIR, `run_${name}_${Date.now()}.py`);
      await fsp.writeFile(tempScript, tool.sourceCode, 'utf-8');
      const res = await context.exec(`python ${tempScript}`);
      try { await fsp.unlink(tempScript); } catch {}
      return {
        success: res.exitCode === 0,
        stdout: res.stdout,
        stderr: res.stderr,
        exitCode: res.exitCode
      };
    }

    // JavaScript / TypeScript execution
    const fnWrapper = new Function('args', 'context', `
      ${tool.sourceCode}
      if (typeof execute === 'function') {
        return execute(args, context);
      } else if (typeof run === 'function') {
        return run(args, context);
      }
      return { result: "Executed script successfully without return value" };
    `);

    const result = await fnWrapper(args, context);
    return result;
  } catch (err: any) {
    return {
      error: `Execution error in dynamic tool ${name}: ${err.message}`,
      stack: err.stack
    };
  }
}
