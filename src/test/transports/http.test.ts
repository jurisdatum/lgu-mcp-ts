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

test("MCP endpoint is accessible without authentication when no key set", async () => {
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

test("returns 401 when server key is set and no token provided", async () => {
  const app = createHttpApp({ serverKey: "test-secret" });
  const res = await app.request("/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }),
  });

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.headers.get("WWW-Authenticate"), "Bearer");
});

test("returns 401 when server key is set and wrong token provided", async () => {
  const app = createHttpApp({ serverKey: "test-secret" });
  const res = await app.request("/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      Authorization: "Bearer wrong-key",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }),
  });

  assert.strictEqual(res.status, 401);
});

test("returns 401 (not 500) when token and key have same string length but different byte length", async () => {
  // "é".length === "a".length (1), but Buffer.byteLength("é") !== Buffer.byteLength("a").
  // Old code guarding on string length could call timingSafeEqual with mismatched buffers and throw (500).
  const app = createHttpApp({ serverKey: "é" });
  const res = await app.request("/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      Authorization: "Bearer a",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }),
  });

  assert.strictEqual(res.status, 401);
});

test("returns 401 (not 500) when key is ASCII but token is non-ASCII with same string length", async () => {
  const app = createHttpApp({ serverKey: "a" });
  const res = await app.request("/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      Authorization: "Bearer é",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }),
  });

  assert.strictEqual(res.status, 401);
});

test("allows access when correct bearer token is provided", async () => {
  const app = createHttpApp({ serverKey: "test-secret" });
  const res = await app.request("/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      Authorization: "Bearer test-secret",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }),
  });

  // 404 because no transport configured, but crucially not 401
  assert.strictEqual(res.status, 404);
});

test("health check is accessible even when server key is set", async () => {
  const app = createHttpApp({ serverKey: "test-secret" });
  const res = await app.request("/health");

  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.deepStrictEqual(body, { status: "ok" });
});
