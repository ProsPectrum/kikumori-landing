import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { getRedirectTtlSeconds } from "./config.js";
import { getStore } from "./store/index.js";

const TOKEN_BYTES = 32; // 256-bit token; only the SHA-256 hash is stored.

export function hashRedirectToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function tokenKey(tokenHash) {
  return `redir:${tokenHash}`;
}

export async function issueRedirectToken(
  blockId,
  { sourceId = "", ttlSeconds = getRedirectTtlSeconds() } = {},
) {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const tokenHash = hashRedirectToken(token);
  const now = Date.now();
  const expiresAt = now + ttlSeconds * 1000;

  await getStore().setJson(
    tokenKey(tokenHash),
    { blockId, sourceId: sourceId || "", expiresAt, used: false },
    ttlSeconds,
  );

  return { token, expiresAt };
}

export async function consumeRedirectToken(token) {
  if (!token || typeof token !== "string" || token.length > 128) {
    return { status: "missing" };
  }

  if (!/^[A-Za-z0-9_-]+$/.test(token)) {
    return { status: "missing" };
  }

  const tokenHash = hashRedirectToken(token);
  return getStore().consumeToken(tokenKey(tokenHash), Date.now());
}
