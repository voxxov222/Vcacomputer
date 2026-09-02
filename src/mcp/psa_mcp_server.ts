import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import { getPSACertData } from "../lib/psaApi.js";

// Ensure .env is loaded to access PSA_API_KEY
dotenv.config();

/**
 * Define the MCP Tool for verifying PSA certificates
 */
const VerifyPsaCertTool: Tool = {
  name: "verify_psa_cert",
  description: "Fetches and validates collectible card details by PSA Certification Number using the PSA Public API.",
  inputSchema: {
    type: "object",
    properties: {
      certNumber: {
        type: "string",
        description: "The 8-digit PSA Certification Number to verify (e.g. '12345678').",
      },
    },
    required: ["certNumber"],
  },
};

/**
 * Initialize the MCP Server
 */
const server = new Server(
  {
    name: "psa-verification-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handle listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [VerifyPsaCertTool],
  };
});

/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "verify_psa_cert") {
    const certNumber = String(request.params.arguments?.certNumber);
    if (!certNumber) {
      throw new Error("certNumber is required");
    }

    try {
      // Call the shared PSA API validation function
      const data = await getPSACertData(certNumber);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error verifying PSA Cert: ${error.message}`
          }
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Tool not found: ${request.params.name}`);
});

/**
 * Connect the server over stdio
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PSA Verification MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Failed to start MCP server:", error);
  process.exit(1);
});
