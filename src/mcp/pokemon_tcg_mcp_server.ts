import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import {
  searchCards,
  getCardById,
  getCardPrice,
  searchSets,
  getSetById,
  getTypes,
  getSupertypes,
  getSubtypes,
  getRarities,
} from "../lib/pokemonTcgApi.js";

dotenv.config();

/**
 * Tool definitions matching the grzetich/pokemon-tcg-mcp specification
 */
const TOOLS: Tool[] = [
  {
    name: "search_cards",
    description: "Search Pokémon cards by name, set_name, type, rarity, subtype, supertype with pagination.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Card name to search for (e.g. 'Charizard', 'Pikachu', 'Mewtwo').",
        },
        set_name: {
          type: "string",
          description: "Expansion set name (e.g. 'Base Set', 'Evolving Skies', '151').",
        },
        type: {
          type: "string",
          description: "Energy type (e.g. 'Fire', 'Water', 'Lightning', 'Psychic').",
        },
        rarity: {
          type: "string",
          description: "Rarity level (e.g. 'Rare Holo', 'Common', 'Secret Rare').",
        },
        subtype: {
          type: "string",
          description: "Card subtype (e.g. 'Basic', 'Stage 2', 'VMAX', 'EX', 'Supporter').",
        },
        supertype: {
          type: "string",
          description: "Card supertype: 'Pokémon', 'Trainer', or 'Energy'.",
        },
        page: {
          type: "number",
          description: "Page number (default 1).",
        },
        limit: {
          type: "number",
          description: "Max results per page (default 20, max 250).",
        },
      },
    },
  },
  {
    name: "get_card_by_id",
    description: "Fetch complete details of a single Pokémon card by its official ID (e.g. 'base1-4', 'swsh7-215').",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique card ID (e.g. 'base1-4').",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "get_card_price",
    description: "Get real-time TCGPlayer market pricing, variants (normal, holofoil, reverse holofoil), and Cardmarket values for a Pokémon card.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Card name (e.g. 'Charizard', 'Umbreon VMAX').",
        },
        set_name: {
          type: "string",
          description: "Optional set name to narrow the pricing query (e.g. 'Base Set', 'Evolving Skies').",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "search_sets",
    description: "List or search Pokémon TCG expansion sets by name.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Name of the set (e.g. 'Silver Tempest', 'Paldea Evolved').",
        },
        page: {
          type: "number",
          description: "Page number (default 1).",
        },
        limit: {
          type: "number",
          description: "Max sets to return (default 20).",
        },
      },
    },
  },
  {
    name: "get_set_by_id",
    description: "Get expansion set details by set ID (e.g. 'base1', 'sv3', 'swsh7').",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Set identifier (e.g. 'base1').",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "get_types",
    description: "List all official Pokémon card energy types (Colorless, Darkness, Dragon, Fairy, Fighting, Fire, Grass, Lightning, Metal, Psychic, Water).",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_supertypes",
    description: "List all Pokémon card supertypes (Pokémon, Energy, Trainer).",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_subtypes",
    description: "List all Pokémon card subtypes (Basic, Stage 1, Stage 2, EX, GX, V, VMAX, Supporter, Stadium, Item, etc.).",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_rarities",
    description: "List all Pokémon card rarities (Common, Uncommon, Rare, Rare Holo, Secret Rare, Illustration Rare, etc.).",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

const server = new Server(
  {
    name: "pokemon-tcg-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    let resultData: any;

    switch (name) {
      case "search_cards":
        resultData = await searchCards({
          name: args.name ? String(args.name) : undefined,
          set_name: args.set_name ? String(args.set_name) : undefined,
          types: args.type ? String(args.type) : undefined,
          rarity: args.rarity ? String(args.rarity) : undefined,
          subtype: args.subtype ? String(args.subtype) : undefined,
          supertype: args.supertype ? String(args.supertype) : undefined,
          page: args.page ? Number(args.page) : 1,
          limit: args.limit ? Number(args.limit) : 20,
        });
        break;

      case "get_card_by_id":
        if (!args.id) throw new Error("Argument 'id' is required (e.g. 'base1-4')");
        resultData = await getCardById(String(args.id));
        break;

      case "get_card_price":
        if (!args.name) throw new Error("Argument 'name' is required (e.g. 'Charizard')");
        resultData = await getCardPrice(
          String(args.name),
          args.set_name ? String(args.set_name) : undefined
        );
        break;

      case "search_sets":
        resultData = await searchSets({
          name: args.name ? String(args.name) : undefined,
          page: args.page ? Number(args.page) : 1,
          limit: args.limit ? Number(args.limit) : 20,
        });
        break;

      case "get_set_by_id":
        if (!args.id) throw new Error("Argument 'id' is required (e.g. 'base1')");
        resultData = await getSetById(String(args.id));
        break;

      case "get_types":
        resultData = await getTypes();
        break;

      case "get_supertypes":
        resultData = await getSupertypes();
        break;

      case "get_subtypes":
        resultData = await getSubtypes();
        break;

      case "get_rarities":
        resultData = await getRarities();
        break;

      default:
        throw new Error(`Tool '${name}' not found on pokemon-tcg-mcp server`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(resultData, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Pokemon TCG MCP Server (stdio) initialized and ready.");
}

main().catch((error) => {
  console.error("Failed to start Pokemon TCG MCP server:", error);
  process.exit(1);
});
