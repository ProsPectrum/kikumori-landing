import "server-only";

import { getStore } from "./store/index.js";

export async function enforceRateLimit({ key, limit, windowSeconds }) {
  const count = await getStore().increment(`rl:${key}`, windowSeconds);
  if (count > limit) {
    return { allowed: false, retryAfter: windowSeconds };
  }
  return { allowed: true, retryAfter: 0 };
}
