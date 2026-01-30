#!/usr/bin/env node

/**
 * MCP Server for UK Legislation (legislation.gov.uk)
 *
 * Provides tools to search and retrieve UK legislation via the Model Context Protocol.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Import tools
import * as getLegislation from "./tools/get-legislation.js";
import * as getLegislationMetadata from "./tools/get-legislation-metadata.js";
import * as searchLegislation from "./tools/search-legislation.js";
import * as searchLegislationSemantic from "./tools/search-legislation-semantic.js";
import * as searchLegislationSectionsSemantic from "./tools/search-legislation-sections-semantic.js";

// Import API client
import { LegislationClient } from "./api/legislation-client.js";
import { LexClient } from "./api/lex-client.js";

// Import resource loader
import { ResourceLoader } from "./resources/resource-loader.js";

// Initialize API client and resource loader
const apiClient = new LegislationClient();
const lexClient = new LexClient();
const resourceLoader = new ResourceLoader();

// Create MCP server
const server = new Server(
  {
    name: "legislation-gov-uk",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

/**
 * Handler: List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: searchLegislation.name,
        description: searchLegislation.description,
        inputSchema: searchLegislation.inputSchema,
      },
      {
        name: getLegislation.name,
        description: getLegislation.description,
        inputSchema: getLegislation.inputSchema,
      },
      {
        name: getLegislationMetadata.name,
        description: getLegislationMetadata.description,
        inputSchema: getLegislationMetadata.inputSchema,
      },
      {
        name: searchLegislationSemantic.name,
        description: searchLegislationSemantic.description,
        inputSchema: searchLegislationSemantic.inputSchema,
      },
      {
        name: searchLegislationSectionsSemantic.name,
        description: searchLegislationSectionsSemantic.description,
        inputSchema: searchLegislationSectionsSemantic.inputSchema,
      },
    ],
  };
});

/**
 * Handler: Execute a tool
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case searchLegislation.name:
        return await searchLegislation.execute(args as any, apiClient);

      case getLegislation.name:
        return await getLegislation.execute(args as any, apiClient);

      case getLegislationMetadata.name:
        return await getLegislationMetadata.execute(args as any, apiClient);

      case searchLegislationSemantic.name:
        return await searchLegislationSemantic.execute(args as any, lexClient);

      case searchLegislationSectionsSemantic.name:
        return await searchLegislationSectionsSemantic.execute(args as any, lexClient);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        content: [
          {
            type: "text",
            text: `Error executing tool: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
    throw error;
  }
});

/**
 * Handler: List available resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: resourceLoader.listResources()
  };
});

/**
 * Handler: Read a resource
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    const resource = resourceLoader.readResource(uri);
    return {
      contents: [resource]
    };
  } catch (error) {
    throw new Error(`Unknown resource: ${uri}`);
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr (stdout is used for MCP communication)
  console.error("UK Legislation MCP Server running on stdio");
  console.error("Tools: search_legislation, get_legislation, get_legislation_metadata");
  console.error("Resources loaded from manifest:");
  for (const resource of resourceLoader.listResources()) {
    console.error(`  - ${resource.uri}`);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
