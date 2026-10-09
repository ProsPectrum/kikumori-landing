import "server-only";

import { EXCLUSIVE_BLOCK_ID } from "./config.js";
import { TRAFFIC_SOURCES } from "./trafficSources.js";

const SOURCE_ENV = Object.fromEntries(
  TRAFFIC_SOURCES.map((row) => [row.id, row.destEnv]),
);

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

function fromEnv(name) {
  const configured = process.env[name];
  if (!configured) return null;
  return assertSafeDestination(configured);
}

export function getDestinationUrl(blockId, sourceId = "") {
  if (blockId !== EXCLUSIVE_BLOCK_ID) return null;

  const sourceEnv = SOURCE_ENV[sourceId];
  if (sourceEnv) {
    const scoped = fromEnv(sourceEnv);
    if (scoped) return scoped;
  }

  return fromEnv("EXCLUSIVE_DESTINATION_URL");
}

export function isAllowedBlockId(blockId) {
  return blockId === EXCLUSIVE_BLOCK_ID;
}
