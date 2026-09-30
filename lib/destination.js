import "server-only";

import { EXCLUSIVE_BLOCK_ID } from "./config.js";

// Destination is resolved only from a server allowlist. Callers never pass a URL.
const BLOCK_ENV = {
  [EXCLUSIVE_BLOCK_ID]: "EXCLUSIVE_DESTINATION_URL",
};

function assertSafeDestination(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error("Destination URL is invalid");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Destination protocol is not allowed");
  }

  if (parsed.username || parsed.password) {
    throw new Error("Destination must not include credentials");
  }

  return parsed.toString();
}

export function getDestinationUrl(blockId) {
  const envName = BLOCK_ENV[blockId];
  if (!envName) return null;

  const configured = process.env[envName];
  if (!configured) return null;

  return assertSafeDestination(configured);
}

export function isAllowedBlockId(blockId) {
  return Object.prototype.hasOwnProperty.call(BLOCK_ENV, blockId);
}
