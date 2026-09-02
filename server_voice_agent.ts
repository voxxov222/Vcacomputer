import { GoogleGenAI, FunctionDeclaration, Type, Modality } from "@google/genai";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import fsp from "fs/promises";
import os from "os";
import { REFERENCE_CATALOG, findReferenceCardByQuery } from "./src/lib/cardReference";
import { generateAccuratePricing } from "./src/lib/pricingEngine";
import {
  storeMemory,
  recallMemories,
  getAllMemories,
  deleteMemoryById,
  ensureMemoryFile
} from "./src/lib/agentMemory";
import {
  syncPokemonPrices,
  ensurePriceDatabase,
  getAutonomousTasks,
  scheduleAutonomousTask
} from "./src/lib/autonomousPriceSync";
import {
  registerDynamicTool,
  getDynamicTools,
  executeDynamicTool,
  deleteDynamicTool,
  ensureToolRegistry
} from "./src/lib/dynamicToolRegistry";

const execAsync = promisify(exec);

// Function Declarations for Gemini
export const voiceAgentToolDeclarations: FunctionDeclaration[] = [
  {
    name: "execute_terminal_command",
    description: "Executes a real shell command in the host environment / container workspace (e.g. bash, node, npm, python, git, ls, ps, cat, mkdir, etc.). Returns stdout, stderr, and exit code.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        command: {
          type: Type.STRING,
          description: "The exact shell command to execute, e.g., 'ls -la', 'git status', 'node -v', 'npm list --depth=0', 'ps aux', etc."
        },
        cwd: {
          type: Type.STRING,
          description: "Optional working directory path relative to project root or absolute path."
        }
      },
      required: ["command"]
    }
  },
  {
    name: "install_dependency_or_repo",
    description: "Autonomously installs npm or python packages, or clones full Git repositories into the workspace and configures dependencies.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: {
          type: Type.STRING,
          enum: ["npm", "python_pip", "git_clone"],
          description: "Installation type: 'npm' package, 'python_pip' package, or 'git_clone' repository."
        },
        target: {
          type: Type.STRING,
          description: "Package name (e.g. 'lodash', 'axios', 'recharts') or Git repository URL (e.g. 'https://github.com/tcgdex/cards-database')."
        },
        isDev: {
          type: Type.BOOLEAN,
          description: "For npm: whether to install as dev dependency (-D)."
        }
      },
      required: ["type", "target"]
    }
  },
  {
    name: "create_custom_tool",
    description: "Codes and registers a brand new custom agent tool right from scratch. The agent can write JavaScript/TypeScript code, define parameter schemas, and immediately invoke the new tool autonomously in future tasks.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "Unique tool name in snake_case (e.g. 'pokemon_tcgdex_fetcher', 'git_branch_cleaner', 'psa_population_scraper')."
        },
        description: {
          type: Type.STRING,
          description: "Clear explanation of what the tool accomplishes and when to call it."
        },
        parameters: {
          type: Type.OBJECT,
          description: "JSON Schema definition of parameters with 'type', 'properties', and 'required' list."
        },
        sourceCode: {
          type: Type.STRING,
          description: "Executable JavaScript/TypeScript function code. Must define 'async function execute(args, context) { ... return result; }'."
        },
        language: {
          type: Type.STRING,
          enum: ["javascript", "typescript", "python"],
          description: "Programming language used for the tool logic."
        },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Categorization tags (e.g. ['pricing', 'pokemon', 'git', 'scraper'])."
        }
      },
      required: ["name", "description", "sourceCode"]
    }
  },
  {
    name: "execute_custom_tool",
    description: "Executes an existing agent-created dynamic tool by name with provided arguments.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        toolName: {
          type: Type.STRING,
          description: "The name of the custom dynamic tool to execute."
        },
        args: {
          type: Type.OBJECT,
          description: "JSON arguments matching the tool's parameter schema."
        }
      },
      required: ["toolName"]
    }
  },
  {
    name: "list_custom_tools",
    description: "Lists all dynamically coded tools in the registry, their parameter schemas, source code, and run counts.",
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: "sync_pokemon_market_prices",
    description: "Continuously checks and synchronizes real Pokémon card market valuations across PSA 10, PSA 9, PSA 8, and Raw conditions. Updates the persistent price database with 7-day/30-day trends, auction sales, and volatility metrics.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        cardQuery: {
          type: Type.STRING,
          description: "Optional specific Pokémon name or set to update (e.g. 'Charizard Base Set', 'Gengar', 'Pikachu'). If omitted, updates all tracked cards."
        },
        triggerSource: {
          type: Type.STRING,
          enum: ["voice_agent", "autonomous_cron", "manual"],
          description: "Source trigger for this price update."
        }
      }
    }
  },
  {
    name: "schedule_autonomous_task",
    description: "Schedules a recurring autonomous background task (e.g. recurring Pokémon price sync every 15 min, repository health audits, system memory supervisor).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "Descriptive name of the autonomous task."
        },
        type: {
          type: Type.STRING,
          enum: ["price_sync", "repo_audit", "system_health", "backup", "custom"],
          description: "Task type category."
        },
        intervalMinutes: {
          type: Type.INTEGER,
          description: "Frequency of execution in minutes (e.g. 5, 15, 60)."
        }
      },
      required: ["name", "type", "intervalMinutes"]
    }
  },
  {
    name: "list_autonomous_tasks",
    description: "Inspects currently running and scheduled autonomous tasks, next execution times, and recent run logs.",
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
  },
  {
    name: "store_memory",
    description: "Persists knowledge, learned tool recipes, user preferences, Pokémon card insights, and codebase facts into the agent's long-term memory store.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          enum: ["semantic", "procedure", "preference", "episodic", "entity", "pokemon_insight"],
          description: "Memory category."
        },
        key: {
          type: Type.STRING,
          description: "Unique indexing key (e.g. 'user_voice_preference', 'charizard_base_psa10_record', 'custom_tool_builder_rule')."
        },
        content: {
          type: Type.STRING,
          description: "Detailed memory description or factual knowledge to remember."
        },
        importance: {
          type: Type.INTEGER,
          description: "Importance level from 1 (low) to 10 (critical foundational knowledge)."
        },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of searchable tags."
        }
      },
      required: ["category", "key", "content"]
    }
  },
  {
    name: "recall_memory",
    description: "Searches and retrieves relevant long-term memories and learned knowledge using semantic search and keyword tokens.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "Search query describing what you want to recall (e.g. 'charizard price trends', 'user preference', 'how to build tools')."
        },
        category: {
          type: Type.STRING,
          description: "Optional category filter ('all', 'semantic', 'procedure', 'preference', 'episodic', 'pokemon_insight')."
        }
      },
      required: ["query"]
    }
  },
  {
    name: "read_project_file",
    description: "Reads the text contents of a project file at the given path.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        filePath: {
          type: Type.STRING,
          description: "The path of the file to read, relative to workspace root (e.g. 'package.json', 'metadata.json', 'src/App.tsx')."
        }
      },
      required: ["filePath"]
    }
  },
  {
    name: "write_project_file",
    description: "Writes or creates a text file at the given path with provided content.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        filePath: {
          type: Type.STRING,
          description: "The path of the file to create or write to."
        },
        content: {
          type: Type.STRING,
          description: "The content to write into the file."
        }
      },
      required: ["filePath", "content"]
    }
  },
  {
    name: "list_directory",
    description: "Lists files and subdirectories at a specific path in the workspace.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        dirPath: {
          type: Type.STRING,
          description: "The directory path to list (defaults to '.' for root)."
        }
      }
    }
  },
  {
    name: "inspect_system_and_processes",
    description: "Inspects running operating system processes, active ports, CPU and RAM usage, and available system tools.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        filter: {
          type: Type.STRING,
          description: "Optional filter string for process name or command."
        }
      }
    }
  },
  {
    name: "vca_card_lookup",
    description: "Queries the Verified Card Authority (VCA) card catalog and market valuation database for real card records, PSA grades, variants, and authenticity criteria.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "Card search query (e.g. 'Charizard Base Set 1st Edition', 'Pikachu Illustrator', 'Gengar Holo', 'Lugia Neo Genesis')."
        }
      },
      required: ["query"]
    }
  },
  {
    name: "os_action_control",
    description: "Triggers actions in the VCA Operating System UI, such as opening an application, switching virtual screens (1-10), changing layout (split-screen), launching an emulator (Samsung S26, Linux, Windows), or creating a desktop widget.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        action: {
          type: Type.STRING,
          description: "Action type: 'open_app', 'switch_screen', 'set_layout', 'launch_emulator', 'create_widget', 'toggle_dark_mode', 'set_wallpaper'."
        },
        appId: {
          type: Type.STRING,
          description: "App ID to open: 'terminal', 'code', 'files', 'vca', 'emulator', 'software_installer', 'github_runner', 'browser', 'settings', 'tasks', 'activity', 'security', 'process_manager', 'widget_studio', 'docs', 'sheets', 'mail', 'coding_agents', 'voice_agent'."
        },
        screenIndex: {
          type: Type.INTEGER,
          description: "Virtual screen index (0 to 9) to switch to."
        },
        layout: {
          type: Type.STRING,
          description: "Screen layout: 'floating', 'split-2-h', 'split-2-v', 'split-3-cols', 'split-4-grid'."
        },
        emulatorConfig: {
          type: Type.OBJECT,
          description: "Emulator specs e.g. { deviceType: 'phone', model: 'Samsung Galaxy S26 Ultra', ramGb: 16, storageGb: 512, os: 'android' }."
        },
        summary: {
          type: Type.STRING,
          description: "Brief explanation of the UI action triggered."
        }
      },
      required: ["action"]
    }
  }
];

// Tool Execution Context for Dynamic Tools
const dynamicToolContext = {
  exec: async (command: string, options: any = {}) => {
    return executeTool("execute_terminal_command", { command, cwd: options.cwd });
  },
  lookupCard: async (query: string) => {
    return executeTool("vca_card_lookup", { query });
  },
  recallMemory: async (query: string) => {
    return recallMemories(query);
  },
  storeMemory: async (entry: any) => {
    return storeMemory(entry);
  }
};

// Tool Executor Implementation
export async function executeTool(name: string, args: any, workspaceRoot: string = process.cwd()): Promise<any> {
  switch (name) {
    case "execute_terminal_command": {
      const startTime = Date.now();
      const command = args.command || "";
      const rawCwd = args.cwd || workspaceRoot;
      const safeCwd = path.isAbsolute(rawCwd) ? rawCwd : path.resolve(workspaceRoot, rawCwd);
      const targetCwd = fs.existsSync(safeCwd) ? safeCwd : workspaceRoot;

      // Basic safety check for destructive root commands
      const dangerousPatterns = [/rm\s+-rf\s+\/($|\s)/, /mkfs/, /dd\s+if=.*of=\/dev/];
      for (const pattern of dangerousPatterns) {
        if (pattern.test(command.trim())) {
          return {
            error: "Security Violation: Blocked destructive host command.",
            command,
            exitCode: 13
          };
        }
      }

      try {
        const { stdout, stderr } = await execAsync(command, {
          cwd: targetCwd,
          env: {
            ...process.env,
            PATH: process.env.PATH || "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
          },
          timeout: 45000,
          maxBuffer: 10 * 1024 * 1024
        });

        const durationMs = Date.now() - startTime;
        return {
          success: true,
          command,
          cwd: targetCwd,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: 0,
          durationMs
        };
      } catch (err: any) {
        return {
          success: false,
          command,
          cwd: targetCwd,
          stdout: err.stdout ? String(err.stdout).trim() : "",
          stderr: err.stderr ? String(err.stderr).trim() : err.message,
          exitCode: err.code || 1,
          durationMs: Date.now() - startTime
        };
      }
    }

    case "install_dependency_or_repo": {
      const { type, target, isDev } = args;
      if (!target) return { error: "Target package or repository is required" };

      if (type === "git_clone") {
        const repoName = target.split("/").pop()?.replace(".git", "") || "cloned_repo";
        const targetDir = path.join(workspaceRoot, "repos", repoName);
        await fsp.mkdir(path.join(workspaceRoot, "repos"), { recursive: true });

        const cloneRes = await executeTool("execute_terminal_command", {
          command: `git clone ${target} repos/${repoName}`
        });

        // Store repository cloned event in memory
        await storeMemory({
          category: "entity",
          key: `repo_${repoName}`,
          content: `Cloned git repository ${target} into repos/${repoName}.`,
          importance: 7,
          tags: ["repo", "git", repoName]
        });

        return {
          success: cloneRes.exitCode === 0,
          repoName,
          directory: `repos/${repoName}`,
          output: cloneRes.stdout || cloneRes.stderr
        };
      }

      if (type === "python_pip") {
        const pipRes = await executeTool("execute_terminal_command", {
          command: `pip install ${target}`
        });
        return {
          success: pipRes.exitCode === 0,
          package: target,
          type: "pip",
          output: pipRes.stdout || pipRes.stderr
        };
      }

      // Default: npm
      const npmFlag = isDev ? "-D" : "";
      const npmRes = await executeTool("execute_terminal_command", {
        command: `npm install ${target} ${npmFlag}`.trim()
      });

      return {
        success: npmRes.exitCode === 0,
        package: target,
        type: "npm",
        output: npmRes.stdout || npmRes.stderr
      };
    }

    case "create_custom_tool": {
      try {
        const { name: toolName, description, parameters, sourceCode, language = "javascript", tags = [] } = args;
        if (!toolName || !sourceCode) {
          return { error: "Tool name and sourceCode are required" };
        }

        const registered = await registerDynamicTool({
          name: toolName,
          description: description || `Custom agent tool: ${toolName}`,
          parameters: parameters || { type: "OBJECT", properties: {} },
          sourceCode,
          language,
          author: "agent",
          tags: [...tags, "self_authored"]
        });

        // Record in agent memory
        await storeMemory({
          category: "procedure",
          key: `tool_${toolName}`,
          content: `Self-coded custom tool '${toolName}': ${description}. Created at runtime with full executable logic.`,
          importance: 8,
          tags: ["tool", toolName, ...tags]
        });

        return {
          success: true,
          message: `Successfully authored, compiled, and registered tool '${toolName}'. It is now live in the active registry.`,
          tool: registered
        };
      } catch (err: any) {
        return { error: `Failed to create tool: ${err.message}` };
      }
    }

    case "execute_custom_tool": {
      try {
        const { toolName, args: customArgs } = args;
        const result = await executeDynamicTool(toolName, customArgs || {}, dynamicToolContext);
        return {
          toolName,
          executed: true,
          result
        };
      } catch (err: any) {
        return { error: `Failed to execute custom tool: ${err.message}` };
      }
    }

    case "list_custom_tools": {
      const tools = await getDynamicTools();
      return {
        totalTools: tools.length,
        tools: tools.map((t) => ({
          name: t.name,
          description: t.description,
          author: t.author,
          executionCount: t.executionCount,
          language: t.language,
          tags: t.tags
        }))
      };
    }

    case "sync_pokemon_market_prices": {
      const result = await syncPokemonPrices(args.triggerSource || "voice_agent", args.cardQuery);
      return result;
    }

    case "schedule_autonomous_task": {
      const scheduled = scheduleAutonomousTask({
        name: args.name,
        type: args.type,
        intervalMinutes: args.intervalMinutes
      });

      await storeMemory({
        category: "procedure",
        key: `task_${scheduled.id}`,
        content: `Scheduled autonomous task: ${scheduled.name} (every ${scheduled.intervalMinutes} min)`,
        importance: 6,
        tags: ["task", scheduled.type]
      });

      return {
        success: true,
        message: `Task '${scheduled.name}' scheduled successfully.`,
        task: scheduled
      };
    }

    case "list_autonomous_tasks": {
      const tasks = getAutonomousTasks();
      const priceDb = await ensurePriceDatabase();
      return {
        totalTasks: tasks.length,
        tasks,
        priceDbStatus: {
          lastSync: priceDb.lastSyncTimestamp,
          totalCardsTracked: priceDb.totalCardsTracked,
          estimatedMarketCap: priceDb.marketCapEst
        }
      };
    }

    case "store_memory": {
      const stored = await storeMemory({
        category: args.category || "semantic",
        key: args.key,
        content: args.content,
        importance: args.importance,
        tags: args.tags
      });
      return {
        success: true,
        message: `Stored memory for key '${stored.key}'`,
        memory: stored
      };
    }

    case "recall_memory": {
      const recalled = await recallMemories(args.query, args.category);
      return recalled;
    }

    case "read_project_file": {
      try {
        const filePath = args.filePath || "";
        const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(workspaceRoot, filePath);
        if (!fs.existsSync(resolved)) {
          return { error: `File not found: ${filePath}` };
        }
        const stats = await fsp.stat(resolved);
        if (stats.isDirectory()) {
          return { error: `Path is a directory: ${filePath}` };
        }
        const content = await fsp.readFile(resolved, "utf-8");
        return {
          success: true,
          filePath: path.relative(workspaceRoot, resolved),
          sizeBytes: stats.size,
          content: content.length > 50000 ? content.slice(0, 50000) + "\n...[truncated]" : content
        };
      } catch (err: any) {
        return { error: err.message || "Failed to read file" };
      }
    }

    case "write_project_file": {
      try {
        const filePath = args.filePath || "";
        const content = args.content ?? "";
        const resolved = path.isAbsolute(filePath) ? filePath : path.resolve(workspaceRoot, filePath);
        await fsp.mkdir(path.dirname(resolved), { recursive: true });
        await fsp.writeFile(resolved, content, "utf-8");
        return {
          success: true,
          filePath: path.relative(workspaceRoot, resolved),
          bytesWritten: Buffer.byteLength(content, "utf-8")
        };
      } catch (err: any) {
        return { error: err.message || "Failed to write file" };
      }
    }

    case "list_directory": {
      try {
        const dirPath = args.dirPath || ".";
        const resolved = path.isAbsolute(dirPath) ? dirPath : path.resolve(workspaceRoot, dirPath);
        if (!fs.existsSync(resolved)) {
          return { error: `Directory not found: ${dirPath}` };
        }
        const entries = await fsp.readdir(resolved, { withFileTypes: true });
        const items = await Promise.all(
          entries.slice(0, 60).map(async (entry) => {
            const fullPath = path.join(resolved, entry.name);
            let size = 0;
            try {
              if (entry.isFile()) {
                const s = await fsp.stat(fullPath);
                size = s.size;
              }
            } catch {}
            return {
              name: entry.name,
              isDirectory: entry.isDirectory(),
              sizeBytes: size,
              extension: path.extname(entry.name)
            };
          })
        );
        return {
          directory: path.relative(workspaceRoot, resolved) || ".",
          totalEntries: entries.length,
          items
        };
      } catch (err: any) {
        return { error: err.message || "Failed to list directory" };
      }
    }

    case "inspect_system_and_processes": {
      try {
        const cpus = os.cpus();
        const totalMemMb = Math.round(os.totalmem() / 1024 / 1024);
        const freeMemMb = Math.round(os.freemem() / 1024 / 1024);
        const usedMemMb = totalMemMb - freeMemMb;

        let psOutput = "";
        try {
          const { stdout } = await execAsync("ps aux | head -n 25 2>/dev/null || ps -ef | head -n 25");
          psOutput = stdout;
        } catch {
          psOutput = "PID 1 node server.ts (active)";
        }

        return {
          system: {
            platform: os.platform(),
            osRelease: os.release(),
            hostname: os.hostname(),
            cpuCount: cpus.length,
            cpuModel: cpus[0]?.model || "vCPU",
            ram: {
              totalMb: totalMemMb,
              usedMb: usedMemMb,
              freeMb: freeMemMb,
              usagePercent: Math.round((usedMemMb / totalMemMb) * 100)
            },
            uptimeSeconds: Math.round(os.uptime()),
            nodeVersion: process.version
          },
          processListSummary: psOutput
        };
      } catch (err: any) {
        return { error: err.message || "Failed to inspect system" };
      }
    }

    case "vca_card_lookup": {
      const q = (args.query || "").trim();
      const match = findReferenceCardByQuery(q);
      if (match) {
        const pricing = generateAccuratePricing(
          match.name,
          match.set_name,
          match.collector_number,
          match.rarity,
          match.variant,
          match.pricing
        );
        return {
          card: {
            id: match.card_id,
            name: match.name,
            set: match.set_name,
            setNumber: match.collector_number,
            releaseDate: match.release_date,
            rarity: match.rarity,
            variant: match.variant,
            imageUrl: match.image_url
          },
          marketPricing: pricing,
          authenticityMarkers: match.forensicMarkers
        };
      }

      // Catalog search across all items
      const catalogResults = REFERENCE_CATALOG.filter((c) =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.set_name.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 4);

      if (catalogResults.length > 0) {
        return {
          matches: catalogResults.map((c) => ({
            id: c.card_id,
            name: c.name,
            set: c.set_name,
            variant: c.variant,
            pricing: generateAccuratePricing(
              c.name,
              c.set_name,
              c.collector_number,
              c.rarity,
              c.variant,
              c.pricing
            )
          }))
        };
      }

      return {
        message: `No exact reference card found in local catalog for query '${q}'. You may run an online lookup or scan the card with VCA Lab.`,
        catalogTotalCards: REFERENCE_CATALOG.length
      };
    }

    case "os_action_control": {
      return {
        acknowledged: true,
        action: args.action,
        appId: args.appId,
        screenIndex: args.screenIndex,
        layout: args.layout,
        emulatorConfig: args.emulatorConfig,
        summary: args.summary || `Triggered OS action ${args.action}`
      };
    }

    default: {
      // Check if it's a dynamic custom tool
      try {
        const dynamicTools = await getDynamicTools();
        const found = dynamicTools.find((t) => t.name === name);
        if (found) {
          const res = await executeDynamicTool(name, args, dynamicToolContext);
          return res;
        }
      } catch {}
      return { error: `Unknown tool: ${name}` };
    }
  }
}

// Full 2-Way Conversational Handler with Memory & Self-Evolution
export async function runVoiceAgentTurn(params: {
  transcript?: string;
  audioBase64?: string;
  mimeType?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  systemContext?: any;
  voiceName?: string;
  ai: GoogleGenAI;
}): Promise<{
  response: string;
  transcript: string;
  executedTools: Array<{ name: string; args: any; result: any; durationMs?: number }>;
  osActions: any[];
  audioBase64?: string;
  audioMimeType?: string;
  recalledMemories?: any[];
}> {
  const { transcript: inputTranscript, audioBase64, mimeType = "audio/webm", history = [], systemContext, voiceName = "Zephyr", ai } = params;

  let resolvedTranscript = (inputTranscript || "").trim();

  // 1. If audio base64 is provided without transcript, transcribe it
  if (!resolvedTranscript && audioBase64) {
    try {
      const transcribeResponse = await ai.models.generateContent({
        model: "gemini-3.5-transcribe",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "audio/webm",
                data: audioBase64
              }
            },
            {
              text: "Transcribe this audio faithfully into plain English text. Return only the transcription."
            }
          ]
        }
      });
      resolvedTranscript = (transcribeResponse.text || "").trim();
    } catch (transcribeErr: any) {
      console.warn("Audio transcription fallback:", transcribeErr.message);
    }
  }

  if (!resolvedTranscript) {
    resolvedTranscript = "Hello, what tasks can you perform?";
  }

  // 2. Memory Recall & Context Enrichment
  let recalledMemoriesList: any[] = [];
  try {
    const memoryResult = await recallMemories(resolvedTranscript, undefined, 4);
    recalledMemoriesList = memoryResult.memories;
  } catch (mErr) {
    console.warn("Memory recall error:", mErr);
  }

  const memoryContextText = recalledMemoriesList.length > 0
    ? `\nRECALLED AGENT LONG-TERM MEMORIES:\n${recalledMemoriesList.map((m) => `- [${m.category.toUpperCase()}] ${m.key}: ${m.content}`).join("\n")}\n`
    : "";

  // 3. Build system instruction with full developer & self-authoring capabilities
  const systemInstruction = `You are VCA OS Voice Intelligence & Autonomous Engineering Agent — an elite full-stack engineer and system supervisor capable of natural two-way speech, executing real terminal commands, installing repositories & packages, coding your own dynamic tools from scratch, continually updating Pokémon prices, and managing long-term memory.

Key Capabilities:
1. Real Terminal & Shell Execution: Execute real terminal commands via 'execute_terminal_command'.
2. Self-Tool Development & Dynamic Execution: Code new custom tools from scratch using 'create_custom_tool', run them via 'execute_custom_tool', or list them via 'list_custom_tools'.
3. Repository & Package Installation: Clone any GitHub repository or install npm/pip dependencies using 'install_dependency_or_repo'.
4. Real-Time Pokémon Price Intelligence: Autonomously check, calculate, and synchronize Pokémon card market prices across PSA 10, PSA 9, PSA 8, and Raw conditions with volatility tracking via 'sync_pokemon_market_prices'.
5. Autonomous Task Scheduling: Schedule background recurring jobs (price sync, health audits) with 'schedule_autonomous_task'.
6. Persistent Memory Store: Store important facts, user preferences, procedures, and insights into long-term memory using 'store_memory' and recall them with 'recall_memory'.
7. OS & Virtual Workspace Control: Open apps ('open_app'), switch virtual screens ('switch_screen' 0-9), set layouts ('set_layout' e.g. 'split-4-grid'), launch device emulators ('launch_emulator' e.g. Samsung Galaxy S26 Ultra 16GB RAM), and add widgets ('create_widget').
${memoryContextText}
Response Style:
- Conversational, sharp, professional, and clear (optimized for 2-way voice playback).
- Report exact numbers, exit codes, and market valuations when executing tools.
- Do NOT make up fake commands or fake outputs; rely on real tool execution results.`;

  const executedTools: Array<{ name: string; args: any; result: any; durationMs?: number }> = [];
  const osActions: any[] = [];

  // 4. Convert message history to format
  const conversationContents: any[] = [];

  // Add recent history (up to 8 turns)
  for (const h of history.slice(-8)) {
    conversationContents.push({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }]
    });
  }

  // Add current user turn
  conversationContents.push({
    role: "user",
    parts: [{ text: resolvedTranscript }]
  });

  // 5. Multi-turn Tool Invocation Loop (up to 6 loops)
  let finalResponseText = "";
  let currentContents = [...conversationContents];

  for (let step = 0; step < 6; step++) {
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: currentContents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: voiceAgentToolDeclarations }]
      }
    });

    const functionCalls = response.functionCalls;
    const replyText = response.text || "";

    if (!functionCalls || functionCalls.length === 0) {
      finalResponseText = replyText;
      break;
    }

    // Execute the requested tools
    const toolResponsesParts: any[] = [];

    for (const call of functionCalls) {
      const toolName = call.name;
      const toolArgs = call.args || {};

      const toolStartTime = Date.now();
      const toolResult = await executeTool(toolName, toolArgs);
      const toolDuration = Date.now() - toolStartTime;

      executedTools.push({
        name: toolName,
        args: toolArgs,
        result: toolResult,
        durationMs: toolDuration
      });

      if (toolName === "os_action_control" && toolResult.acknowledged) {
        osActions.push(toolResult);
      }

      toolResponsesParts.push({
        functionResponse: {
          name: toolName,
          response: toolResult
        }
      });
    }

    // Append the model's tool calls and our function responses to the conversation
    const candidateContent = response.candidates?.[0]?.content;
    if (candidateContent) {
      currentContents.push(candidateContent);
    }
    currentContents.push({
      role: "user",
      parts: toolResponsesParts
    });
  }

  if (!finalResponseText && executedTools.length > 0) {
    const lastTool = executedTools[executedTools.length - 1];
    finalResponseText = `Executed ${lastTool.name} successfully. Output: ${JSON.stringify(lastTool.result).slice(0, 200)}`;
  } else if (!finalResponseText) {
    finalResponseText = "I'm ready. How can I assist you with your terminal, Pokémon prices, or system tasks today?";
  }

  // 6. Generate Voice Audio via Gemini TTS
  let audioBase64Result: string | undefined = undefined;
  let audioMimeType: string | undefined = undefined;

  try {
    const ttsCleanText = finalResponseText
      .replace(/```[\s\S]*?```/g, "Code and terminal output processed.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
      .slice(0, 1000);

    const ttsResponse = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: ttsCleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: (voiceName as any) || "Zephyr" }
          }
        }
      }
    });

    const generatedAudio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (generatedAudio) {
      audioBase64Result = generatedAudio;
      audioMimeType = "audio/mp3";
    }
  } catch (ttsErr: any) {
    console.warn("TTS generation warning (client will use audio synthesis fallback):", ttsErr.message);
  }

  return {
    response: finalResponseText,
    transcript: resolvedTranscript,
    executedTools,
    osActions,
    audioBase64: audioBase64Result,
    audioMimeType,
    recalledMemories: recalledMemoriesList
  };
}
