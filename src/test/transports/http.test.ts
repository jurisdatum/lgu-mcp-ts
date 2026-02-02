/**
 * Tests for HTTP transport
 */

import { test } from "node:test";
import assert from "node:assert";
import { createHttpApp } from "../../transports/http.js";

test("health check returns ok", async () => {
  const app = createHttpApp();
  const res = await app.request("/health");

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.deepStrictEqual(body, { status: "ok" });
});

test("MCP endpoint is accessible without authentication", async () => {
  const app = createHttpApp();
  const res = await app.request("/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }),
  });

  // Without transport configured, returns 404 (no handler registered)
  // Key assertion: no auth rejection, endpoint is open
  assert.strictEqual(res.status, 404);
});
