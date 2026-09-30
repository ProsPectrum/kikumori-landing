import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { classifyUserAgent, isInAppBrowserCategory } from "../lib/browser.js";
import { getDestinationUrl } from "../lib/destination.js";
import { issueRedirectToken, consumeRedirectToken } from "../lib/redirectTokens.js";
import { resetMemoryStore } from "../lib/store/memory.js";
import { processHumanVerification } from "../lib/verifyHuman.js";

const DESTINATION = process.env.EXCLUSIVE_DESTINATION_URL;

afterEach(() => {
  resetMemoryStore();
});

test("destination is configured only on the server allowlist", () => {
  assert.equal(getDestinationUrl("exclusive"), DESTINATION);
  assert.equal(getDestinationUrl("unknown"), null);
});

test("in-app browser detection is limited to embedded apps", () => {
  assert.equal(classifyUserAgent("Instagram 1.0").browserCategory, "instagram");
  assert.equal(classifyUserAgent("Mozilla/5.0 Chrome/120").browserCategory, "browser");
  assert.equal(isInAppBrowserCategory("instagram"), true);
  assert.equal(isInAppBrowserCategory("googlebot"), false);
});

test("POST verify-human without token is rejected at the processor", async () => {
  const result = await processHumanVerification({
    token: "",
    blockId: "exclusive",
    ip: "127.0.0.1",
  });
  assert.equal(result.status, 403);
  assert.equal(result.body.redirectPath, undefined);
  assert.ok(!JSON.stringify(result.body).includes(DESTINATION));
});

test("fake Turnstile token is rejected and does not issue a redirect path", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ success: false, "error-codes": ["invalid-input-response"] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

  try {
    const result = await processHumanVerification({
      token: "fake-token",
      blockId: "exclusive",
      ip: "127.0.0.1",
    });
    assert.equal(result.status, 403);
    assert.ok(!JSON.stringify(result.body).includes(DESTINATION));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("valid Turnstile issues an opaque one-time redirect path", async () => {
  const originalFetch = globalThis.fetch;
  let siteverifyCalled = false;
  globalThis.fetch = async (url, init) => {
    if (String(url).includes("siteverify")) {
      siteverifyCalled = true;
      const body = String(init.body);
      assert.ok(body.includes("secret=test-secret"));
      assert.ok(!body.includes(DESTINATION));
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    throw new Error(`unexpected fetch ${url}`);
  };

  try {
    const result = await processHumanVerification({
      token: "valid-token",
      blockId: "exclusive",
      ip: "127.0.0.1",
    });
    assert.equal(siteverifyCalled, true);
    assert.equal(result.status, 200);
    assert.match(result.body.redirectPath, /^\/r\/[A-Za-z0-9_-]+$/);
    assert.ok(!JSON.stringify(result.body).includes(DESTINATION));
    assert.notEqual(result.body.redirectPath, "/r/exclusive");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("valid redirect token can be consumed once then rejected", async () => {
  const { token } = await issueRedirectToken("exclusive", 60);
  const first = await consumeRedirectToken(token);
  assert.equal(first.status, "ok");
  assert.equal(first.blockId, "exclusive");
  const second = await consumeRedirectToken(token);
  assert.equal(second.status, "used");
});

test("expired token is rejected", async () => {
  const { token } = await issueRedirectToken("exclusive", 60);
  const { hashRedirectToken } = await import("../lib/redirectTokens.js");
  const { memoryStore } = await import("../lib/store/memory.js");
  await memoryStore.setJson(
    `redir:${hashRedirectToken(token)}`,
    { blockId: "exclusive", expiresAt: Date.now() - 1000, used: false },
    60,
  );
  const result = await consumeRedirectToken(token);
  assert.equal(result.status, "expired");
});

test("unknown redirect token is missing", async () => {
  const result = await consumeRedirectToken("exclusive");
  assert.equal(result.status, "missing");
});
