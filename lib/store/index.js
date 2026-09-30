import "server-only";

import { memoryStore } from "./memory.js";
import { createUpstashStore, hasUpstashConfig } from "./upstash.js";

let redisStore;

export function getStore() {
  if (process.env.TOKEN_STORE === "memory") return memoryStore;
  if (hasUpstashConfig()) {
    if (!redisStore) redisStore = createUpstashStore();
    return redisStore;
  }
  return memoryStore;
}

export function isSharedStoreEnabled() {
  return process.env.TOKEN_STORE !== "memory" && hasUpstashConfig();
}
