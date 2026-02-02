/**
 * HTTP transport using Hono and WebStandardStreamableHTTPServerTransport
 *
 * Based on the MCP SDK's Hono example.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createServer, getResourceLoader } from "../server.js";

export interface HttpAppOptions {
  transport?: WebStandardStreamableHTTPServerTransport;
}

/**
 * Creates the Hono app with MCP endpoints.
 * Exported for testing.
 */
export function createHttpApp(options: HttpAppOptions = {}): Hono {
  const { transport } = options;

  const app = new Hono();

  // CORS for MCP headers
  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowHeaders: [
        "Content-Type",
        "mcp-session-id",
        "Last-Event-ID",
        "mcp-protocol-version",
      ],
      exposeHeaders: ["mcp-session-id", "mcp-protocol-version"],
    })
  );

  // Health check
  app.get("/health", (c) => c.json({ status: "ok" }));

  // MCP endpoint - handles GET, POST, DELETE
  if (transport) {
    app.all("/mcp", (c) => transport.handleRequest(c.req.raw));
  }

  return app;
}

/**
 * Starts the HTTP server with Hono.
 */
export async function startHttpServer(): Promise<void> {
  const port = parseInt(process.env.PORT || "3000", 10);

  // Create MCP server and transport
  const mcpServer = createServer();
  const transport = new WebStandardStreamableHTTPServerTransport();

  // Create Hono app
  const app = createHttpApp({ transport });

  // Connect server to transport
  await mcpServer.connect(transport);

  // Log startup info
  const resourceLoader = getResourceLoader();
  console.log(`UK Legislation MCP Server (HTTP mode)`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`MCP endpoint: http://localhost:${port}/mcp`);
  console.log("Resources loaded:");
  for (const resource of resourceLoader.listResources()) {
    console.log(`  - ${resource.uri}`);
  }

  // Start server
  serve({ fetch: app.fetch, port });
}
